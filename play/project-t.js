(() => {
  const html = document.documentElement;
  const button = document.querySelector("[data-lang-toggle]");
  const storageKey = "sr-lang";

  const applyLang = (lang) => {
    const next = lang === "en" ? "en" : "zh";
    html.lang = next === "zh" ? "zh-TW" : "en";
    html.classList.remove("lang-zh", "lang-en");
    html.classList.add(`lang-${next}`);
    window.localStorage.setItem(storageKey, next);
  };

  applyLang(window.localStorage.getItem(storageKey) || "zh");

  if (button) {
    button.addEventListener("click", () => {
      const current = window.localStorage.getItem(storageKey) || "zh";
      applyLang(current === "zh" ? "en" : "zh");
    });
  }
})();
