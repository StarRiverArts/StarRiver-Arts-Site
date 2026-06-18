(() => {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-lang-toggle]");
  const page = document.body.getAttribute("data-page");

  function setLanguage(value) {
    const lang = value === "en" ? "en" : "zh";
    root.classList.remove("lang-zh", "lang-en");
    root.classList.add(`lang-${lang}`);
    root.lang = lang === "zh" ? "zh-TW" : "en";
    try {
      localStorage.setItem("sr-lang", lang);
    } catch (error) {
      void error;
    }
  }

  let saved = "zh";
  try {
    saved = localStorage.getItem("sr-lang") || "zh";
  } catch (error) {
    void error;
  }
  setLanguage(saved);

  if (toggle) {
    toggle.addEventListener("click", () => {
      setLanguage(root.classList.contains("lang-zh") ? "en" : "zh");
    });
  }

  if (page) {
    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.getAttribute("data-nav") === page) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = year;
  });
})();
