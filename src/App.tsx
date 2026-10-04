import React, { useState, useEffect } from "react";
import type { Lang } from "./api/types";
import { LanguageContext, t as tFunc } from "./i18n";
import { AppHeader } from "./components/AppHeader";
import { Footer } from "./components/Footer";
import { SkipLink } from "./components/SkipLink";
import { HomePage } from "./pages/HomePage";
import { PrivacyPage } from "./pages/PrivacyPage";

export const App: React.FC = () => {
  const [route, setRoute] = useState<string>(() => window.location.hash || "#/");

  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("ruko.lang");
      return saved === "ta" ? "ta" : "en";
    } catch {
      return "en";
    }
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem("ruko.lang", newLang);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || "#/");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang === "ta") {
      import("@fontsource/noto-sans-tamil/400.css").catch(() => {});
      import("@fontsource/noto-sans-tamil/600.css").catch(() => {});
    }
  }, [lang]);

  const navigateToHome = () => {
    window.location.hash = "#/";
    setRoute("#/");
  };

  const navigateToPrivacy = () => {
    window.location.hash = "#/privacy";
    setRoute("#/privacy");
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: (key, vars) => tFunc(key, vars, lang),
      }}
    >
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--paper)" }}>
        <SkipLink />
        <AppHeader onNavigateHome={navigateToHome} onNavigatePrivacy={navigateToPrivacy} />

        <main id="main-content" tabIndex={-1} style={{ flex: 1, maxWidth: "1120px", width: "100%", margin: "0 auto", padding: "32px 24px", boxSizing: "border-box", outline: "none" }}>
          {route === "#/privacy" ? (
            <PrivacyPage onBack={navigateToHome} />
          ) : (
            <HomePage />
          )}
        </main>

        <Footer onNavigatePrivacy={navigateToPrivacy} />
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
