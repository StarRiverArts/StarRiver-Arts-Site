(() => {
  const LANGS = [
    { code: 'zh', label: '繁體中文', htmlLang: 'zh-TW' },
    { code: 'en', label: 'English', htmlLang: 'en' },
  ];
  const CODES = LANGS.map(l => l.code);
  const KEY   = 'sr-lang';
  const html  = document.documentElement;

  document.querySelectorAll('.nav,.rc-nav').forEach((nav) => {
    const links = nav.querySelector('.nav-links,.rc-links');
    if (!links) return;
    links.id ||= 'projectt-navigation';
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'pt-menu-toggle';
    button.setAttribute('aria-controls', links.id); button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="zh">選單</span><span class="en">Menu</span>';
    nav.insertBefore(button, links); nav.classList.add('has-mobile-menu');
    const close = () => { nav.classList.remove('is-menu-open'); button.setAttribute('aria-expanded','false'); };
    button.addEventListener('click', () => {
      const open = !nav.classList.contains('is-menu-open');
      nav.classList.toggle('is-menu-open',open); button.setAttribute('aria-expanded',String(open));
    });
    links.addEventListener('click', (event) => { if (event.target.closest('a')) close(); });
    nav.addEventListener('keydown', (event) => { if (event.key === 'Escape') { close(); button.focus(); } });
  });
  document.querySelectorAll('.ta-sidebar').forEach((sidebar) => {
    const notes = document.createElement('details'); notes.className = 'ta-mobile-notes';
    const summary = document.createElement('summary');
    summary.innerHTML = '<span class="zh">榜單閱讀說明</span><span class="en">Reading the leaderboard</span>';
    notes.append(summary); while (sidebar.firstChild) notes.append(sidebar.firstChild);
    sidebar.append(notes);
    const screen = matchMedia('(max-width: 900px)');
    const update = () => { notes.open = !screen.matches; }; update(); screen.addEventListener('change', update);
  });

  const applyLang = (code) => {
    const l = LANGS.find(x => x.code === code) || LANGS[0];
    ['zh', 'en', 'jp'].forEach(c => html.classList.remove('lang-' + c));
    html.classList.add('lang-' + l.code);
    html.lang = l.htmlLang;
    try { localStorage.setItem(KEY, l.code); } catch (_) { /* Session-only language still works. */ }
    document.querySelectorAll('[data-lang-select]').forEach(el => { el.value = l.code; });
  };

  document.querySelectorAll('[data-lang-select] option[value="jp"]').forEach((option) => option.remove());

  let saved = 'zh';
  try { saved = localStorage.getItem(KEY) || 'zh'; } catch (_) { /* Use the default. */ }
  applyLang(CODES.includes(saved) ? saved : 'zh');

  document.addEventListener('change', (e) => {
    if (e.target && e.target.matches('[data-lang-select]')) {
      applyLang(e.target.value);
    }
  });

  // Racing Hub is a distinct data/application site even though its historical
  // filesystem path is still /play/RacingClub/TimeAttack/. Keep the browser
  // title site-first and derive detail names from the rendered canonical data.
  // A Racing Hub Track is the independently indexed track-world implementation;
  // routes are world-local children and records are compared within that scope.
  const RACING_HUB_CATEGORIES = {
    overview: '',
    tracks: 'Tracks',
    track: 'Tracks',
    players: 'Racers',
    player: 'Racers',
    teams: 'Teams',
    team: 'Teams',
    vehicles: 'Vehicles',
    vehicle: 'Vehicles',
    events: 'Events',
    event: 'Events',
    trackmap: 'Map',
    catalog: 'Index',
    info: 'Info',
    review: 'Review',
  };

  const RACING_HUB_DETAIL_SELECTORS = {
    track: '.ta-track-detail-head .ta-track-board-title',
    player: '.ta-profile-feature .ta-section-title',
    vehicle: '.ta-profile-feature .ta-section-title',
    team: '.ta-team-detail-copy h2',
    event: '.ta-event-detail .ta-event-lead .ta-title',
  };

  const activeNodeText = (node) => {
    if (!node) return '';
    const lang = html.classList.contains('lang-en') ? 'en' : 'zh';
    const localized = node.querySelector(`.${lang}`);
    const source = localized || node;
    return source.textContent.replace(/\s+/g, ' ').trim();
  };

  const racingHubDetailName = (view) => {
    const selector = RACING_HUB_DETAIL_SELECTORS[view];
    if (!selector) return '';
    const text = activeNodeText(document.querySelector(selector));
    if (text) return text;
    const fallbackId = new URLSearchParams(window.location.search).get('id');
    return fallbackId ? decodeURIComponent(fallbackId) : '';
  };

  const updateRacingHubTitle = () => {
    const body = document.body;
    if (!body || !body.classList.contains('timeattack-page')) return;
    const view = body.dataset.view || 'overview';
    const category = RACING_HUB_CATEGORIES[view];
    if (category === undefined) return;

    const parts = ['Racing Hub'];
    if (category) parts.push(category);
    const detailName = racingHubDetailName(view);
    if (detailName) parts.push(detailName);
    const nextTitle = parts.join(' | ');
    if (document.title !== nextTitle) document.title = nextTitle;
  };

  if (document.body && document.body.classList.contains('timeattack-page')) {
    updateRacingHubTitle();
    const titleNode = document.querySelector('title');
    const pageRoot = document.querySelector('[data-page-root]');
    const observer = new MutationObserver(updateRacingHubTitle);
    if (titleNode) observer.observe(titleNode, { childList: true, characterData: true, subtree: true });
    if (pageRoot) observer.observe(pageRoot, { childList: true, characterData: true, subtree: true });
  }
})();
