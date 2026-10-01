// One-time Route 53 registration and retirement operations, outside Terraform and CI.
import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';
import process from 'node:process';

const domain = 'waldo.love';
const account = '767963650101';
const [action, ...args] = process.argv.slice(2);

function aws(service, operation, flags = [], input) {
  try {
    const response = execFileSync('aws', [
      '--profile', 'waldo', '--region', 'us-east-1', '--output', 'json', '--no-cli-pager',
      service, operation, ...flags,
    ], { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] });
    return response.trim() ? JSON.parse(response) : null;
  } catch {
    // AWS errors can quote request fields. Never echo registration contacts or credentials.
    throw new Error(`AWS ${service} ${operation} failed; inspect status before retrying.`);
  }
}

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}

function requireRetiredDomain(value) {
  if (!value || value !== value.toLowerCase() || value.endsWith('.')
    || value === domain || value.endsWith(`.${domain}`)) {
    throw new Error('Supply the retired registration name, never the current website domain.');
  }
}

function registrationStatus(name) {
  return aws('route53domains', 'get-domain-detail', [
    '--domain-name', name, '--query',
    '{Domain:DomainName,AutoRenew:AutoRenew,Expiration:ExpirationDate,Nameservers:Nameservers}',
  ]);
}

function main() {
  if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    throw new Error('Domain account operations are workstation-only.');
  }
  const identity = aws('sts', 'get-caller-identity');
  if (identity.Account !== account) throw new Error('Unexpected AWS account; refusing operation.');
  print(identity);

  switch (action) {
    case 'inspect': {
      print(aws('route53domains', 'list-domains'));
      print(aws('route53domains', 'check-domain-availability', ['--domain-name', domain]));
      print(aws('route53domains', 'list-prices', ['--tld', 'love']));
      print(aws('route53domains', 'list-operations'));
      print(aws('route53', 'list-hosted-zones'));
      break;
    }
    case 'register': {
      if (process.env.DOMAIN_PURCHASE_APPROVED !== domain) {
        throw new Error('Set DOMAIN_PURCHASE_APPROVED=waldo.love only after spending approval.');
      }
      const maximumPrice = Number(process.env.DOMAIN_MAX_PRICE_USD);
      if (!Number.isFinite(maximumPrice) || maximumPrice <= 0) {
        throw new Error('Set DOMAIN_MAX_PRICE_USD to the approved registration spending limit.');
      }
      const contactPath = realpathSync(args[0]);
      const relativePath = relative(realpathSync('.'), contactPath);
      if (!relativePath.startsWith('../') && !isAbsolute(relativePath)) {
        throw new Error('Keep the contact payload outside the repository.');
      }
      if ((statSync(contactPath).mode & 0o077) !== 0) {
        throw new Error('The contact payload must have owner-only permissions (chmod 600).');
      }
      let payload;
      try {
        payload = JSON.parse(readFileSync(contactPath, 'utf8'));
      } catch {
        throw new Error('Cannot read a valid contact payload; contents suppressed for privacy.');
      }
      if (payload.DomainName !== domain || payload.DurationInYears !== 1
        || payload.AutoRenew !== true
        || !['Admin', 'Registrant', 'Tech'].every((role) => payload[`${role}Contact`]
          && typeof payload[`PrivacyProtect${role}Contact`] === 'boolean')) {
        throw new Error('Require one year, auto-renew on, and approved contacts/privacy.');
      }
      const domains = aws('route53domains', 'list-domains').Domains;
      const operations = aws('route53domains', 'list-operations').Operations;
      if (domains.some((entry) => entry.DomainName === domain)
        || operations.some((entry) => entry.Type === 'REGISTER_DOMAIN'
          && !['SUCCESSFUL', 'FAILED', 'ERROR'].includes(entry.Status))) {
        throw new Error('Registration exists or an operation is pending; inspect before purchase.');
      }
      const availability = aws('route53domains', 'check-domain-availability', [
        '--domain-name', domain,
      ]);
      if (availability.Availability !== 'AVAILABLE') throw new Error('Domain is not available.');
      const prices = aws('route53domains', 'list-prices', ['--tld', 'love']);
      print(prices);
      const registrationPrice = prices.Prices
        .find((price) => price.Name === 'love')?.RegistrationPrice;
      if (registrationPrice?.Currency !== 'USD'
        || !Number.isFinite(registrationPrice.Price) || registrationPrice.Price > maximumPrice) {
        throw new Error('Registration price exceeds approval or uses an unexpected currency.');
      }
      print(aws('route53domains', 'register-domain', [
        '--cli-input-json', `file://${contactPath}`, '--query', '{OperationId:OperationId}',
      ]));
      break;
    }
    case 'operation': {
      if (!args[0]) throw new Error('Supply the registration operation ID.');
      const operation = aws('route53domains', 'get-operation-detail', [
        '--operation-id', args[0], '--query',
        '{OperationId:OperationId,Status:Status,DomainName:DomainName,Type:Type}',
      ]);
      print(operation);
      if (operation.Status === 'SUCCESSFUL' && operation.DomainName === domain) {
        print(registrationStatus(domain));
        print(aws('route53', 'list-hosted-zones-by-name', ['--dns-name', domain]));
      }
      break;
    }
    case 'disable-renewal': {
      requireRetiredDomain(args[0]);
      aws('route53domains', 'disable-domain-auto-renew', ['--domain-name', args[0]]);
      const registration = registrationStatus(args[0]);
      print(registration);
      if (registration.AutoRenew !== false) throw new Error('Auto-renew remains enabled.');
      break;
    }
    case 'delete-zone': {
      const [zoneId, retiredDomain] = args;
      requireRetiredDomain(retiredDomain);
      if (!zoneId) throw new Error('Supply the verified hosted zone ID.');
      const registration = registrationStatus(retiredDomain);
      if (registration.AutoRenew !== false) {
        throw new Error('Disable renewal before zone deletion.');
      }
      const zone = aws('route53', 'get-hosted-zone', ['--id', zoneId]);
      if (zone.HostedZone.Name !== `${retiredDomain}.` || zone.HostedZone.Config.PrivateZone) {
        throw new Error('Hosted zone ID does not match the retired public domain.');
      }
      const distributions = aws('cloudfront', 'list-distributions');
      if ((distributions.DistributionList.Items ?? []).some((distribution) =>
        (distribution.Aliases.Items ?? []).some((alias) => alias === retiredDomain
          || alias.endsWith(`.${retiredDomain}`)))) {
        throw new Error('CloudFront still serves the retired domain; let CI remove its aliases.');
      }
      const dnssec = aws('route53', 'get-dnssec', ['--hosted-zone-id', zoneId]);
      if (dnssec.Status.ServeSignature !== 'NOT_SIGNING'
        || (dnssec.KeySigningKeys ?? []).length > 0) {
        throw new Error('DNSSEC needs explicit teardown before deletion.');
      }
      const records = aws('route53', 'list-resource-record-sets', ['--hosted-zone-id', zoneId]);
      if (records.ResourceRecordSets.some((record) => record.Name !== `${retiredDomain}.`
        || !['NS', 'SOA'].includes(record.Type))) {
        throw new Error('Zone has records; inspect dependencies and remove them explicitly.');
      }
      print(aws('route53', 'delete-hosted-zone', ['--id', zoneId]));
      const zones = aws('route53', 'list-hosted-zones').HostedZones;
      if (zones.some((entry) => entry.Id.replace('/hostedzone/', '')
        === zoneId.replace('/hostedzone/', ''))) throw new Error('Hosted zone still exists.');
      print(registrationStatus(retiredDomain));
      break;
    }
    default:
      throw new Error('Use a domain recipe from just --list.');
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
