(() => {
  const LANGS = [
    { code: 'zh', label: '中文', htmlLang: 'zh-TW' },
    { code: 'en', label: 'EN', htmlLang: 'en' },
  ];
  const CODES = LANGS.map(l => l.code);
  const KEY   = 'sr-lang';
  const html  = document.documentElement;

  const applyLang = (code) => {
    const l = LANGS.find(x => x.code === code) || LANGS[0];
    CODES.forEach(c => html.classList.remove('lang-' + c));
    html.classList.add('lang-' + l.code);
    html.lang = l.htmlLang;
    localStorage.setItem(KEY, l.code);
    document.querySelectorAll('[data-lang-select]').forEach(el => { el.value = l.code; });
  };

  document.querySelectorAll('[data-lang-select] option[value="jp"]').forEach((option) => option.remove());

  const saved = localStorage.getItem(KEY);
  applyLang(CODES.includes(saved) ? saved : 'zh');

  document.addEventListener('change', (e) => {
    if (e.target && e.target.matches('[data-lang-select]')) {
      applyLang(e.target.value);
    }
  });
})();
