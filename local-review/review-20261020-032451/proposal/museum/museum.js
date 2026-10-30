(() => {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-lang-toggle]");
  const page = document.body.getAttribute("data-page");

  function setLanguage(value) {
    const lang = value === "en" ? "en" : "zh";
    root.classList.remove("lang-zh", "lang-en", "lang-jp");
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

  window.srLangToggle = () => setLanguage(root.classList.contains("lang-zh") ? "en" : "zh");

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

  document.querySelectorAll(".museum-footer").forEach((footer) => {
    if (footer.querySelector("[data-site-collaboration]")) return;
    const credit = document.createElement("p");
    credit.className = "museum-collaboration";
    credit.setAttribute("data-site-collaboration", "");
    const zh = document.createElement("span");
    zh.className = "zh";
    zh.textContent = "網站由 StarRiver Arts 主導規劃與製作，並使用 OpenAI GPT 與 Anthropic Claude 協助資訊架構與網頁開發。";
    const en = document.createElement("span");
    en.className = "en";
    en.textContent = "Planned and produced by StarRiver Arts, with OpenAI GPT and Anthropic Claude used to assist information architecture and web development.";
    credit.append(zh, en);
    footer.appendChild(credit);
  });
})();
