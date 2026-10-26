export const views = ['map', 'workshop', 'observatory', 'garden', 'crossroads', 'connect'] as const;
type View = (typeof views)[number];

export function resolveFragment(
  fragment: string,
  detailParent: (id: string) => string | null = (id) => {
    if (typeof document === 'undefined') return null;
    const element = document.getElementById(id);
    if (element?.tagName !== 'DETAILS') return null;
    return element.closest<HTMLElement>('[data-view]')?.id ?? null;
  },
): { view: View; detail?: string; invalid: boolean } {
  const raw = fragment.replace(/^#/, '');
  let id: string;
  try {
    id = decodeURIComponent(raw);
  } catch {
    return { view: 'map', invalid: true };
  }
  if (!id || id === 'main') return { view: 'map', invalid: false };
  if (views.includes(id as View)) return { view: id as View, invalid: false };
  const parent = detailParent(id) as View | null;
  if (parent && views.includes(parent)) return { view: parent, detail: id, invalid: false };
  return { view: 'map', invalid: true };
}

if (typeof document !== 'undefined') {
  const panels = [...document.querySelectorAll<HTMLElement>('[data-view]')];
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-location]')];
  const lens = document.querySelector<HTMLFieldSetElement>('[data-lens-control]');
  const lensPanels = [...document.querySelectorAll<HTMLElement>('[data-lens-panel]')];
  let arrival: Animation | undefined;
  let initialized = false;
  let lastRequested = '';
  history.scrollRestoration = 'manual';

  function synchronize(focusHeading = true): void {
    const requested = window.location.hash;
    const route = resolveFragment(requested);
    arrival?.cancel();
    if (route.invalid) {
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}#map`);
    }
    for (const panel of panels) panel.hidden = panel.id !== route.view;
    for (const link of links) {
      if (link.hash === `#${route.view}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    const title = document.getElementById(`${route.view}-title`);
    const label = route.view === 'map'
      ? 'Explore Waldo\'s library'
      : title?.textContent?.trim().replace(/\s+/g, ' ') ?? route.view;
    document.title = `${label} | Waldo Ibarra`;
    if (initialized && focusHeading && requested !== lastRequested &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const artwork = document.querySelector<HTMLElement>(`#${route.view} .journal-plate`);
      arrival = artwork?.animate([
        { opacity: 0.65, translate: '0 8px' },
        { opacity: 1, translate: '0 0' },
      ], { duration: 240, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    }
    document.documentElement.dataset.place = route.view;
    document.documentElement.classList.add('world-ready');
    if (route.detail) {
      const disclosure = document.getElementById(route.detail) as HTMLDetailsElement;
      disclosure.open = true;
      disclosure.scrollIntoView({ block: 'start', behavior: 'instant' });
      disclosure.querySelector('summary')?.focus({ preventScroll: true });
    } else if (requested === '#main') {
      const main = document.getElementById('main');
      main?.focus({ preventScroll: true });
      main?.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else {
      if (initialized && focusHeading) title?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    initialized = true;
    lastRequested = window.location.hash;
  }
  synchronize();
  if (lens) {
    const updateLens = (): void => {
      const selected = lens.querySelector<HTMLInputElement>('input:checked')?.value;
      for (const panel of lensPanels) panel.hidden = panel.dataset.lensPanel !== selected;
      lens.dataset.selected = selected;
    };
    lens.addEventListener('change', updateLens);
    updateLens();
    document.querySelector<HTMLButtonElement>('[data-open-connections]')
      ?.addEventListener('click', () => {
        const choice = lens.querySelector<HTMLInputElement>('input[value="connections"]');
        if (!choice) return;
        choice.checked = true;
        updateLens();
        choice.focus({ preventScroll: true });
        lens.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
  }
  window.addEventListener('hashchange', () => synchronize());
  window.addEventListener('load', () => synchronize(false), { once: true });
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target || link.hasAttribute('download') ||
        link.origin !== window.location.origin || link.pathname !== window.location.pathname ||
        link.search !== window.location.search || !link.hash) return;
    if (link.hash === '#main') {
      event.preventDefault();
      const main = document.getElementById('main');
      main?.focus({ preventScroll: true });
      main?.scrollIntoView({ block: 'start', behavior: 'instant' });
      return;
    }
    if (link.hash !== window.location.hash) return;
    const route = resolveFragment(link.hash);
    if (route.invalid || route.detail) return;
    event.preventDefault();
    synchronize();
  });
}
