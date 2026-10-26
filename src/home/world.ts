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
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.site-header nav a')];
  let initialized = false;

  function synchronize(): void {
    const requested = window.location.hash;
    const route = resolveFragment(requested);
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
      ? 'Explore Waldo\'s world'
      : title?.textContent?.trim().replace(/\s+/g, ' ') ?? route.view;
    document.title = `${label} | Waldo Ibarra`;
    document.documentElement.dataset.place = route.view;
    document.documentElement.classList.add('world-ready');
    if (route.detail) {
      const disclosure = document.getElementById(route.detail) as HTMLDetailsElement;
      disclosure.open = true;
      disclosure.scrollIntoView({ block: 'start', behavior: 'instant' });
      disclosure.querySelector('summary')?.focus({ preventScroll: true });
    } else if (initialized && requested !== '#main') {
      title?.scrollIntoView({ block: 'start', behavior: 'instant' });
      title?.focus({ preventScroll: true });
    } else if (requested === '#main') {
      document.getElementById('main')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    initialized = true;
  }
  synchronize();
  window.addEventListener('hashchange', synchronize);
}
