import { createContext, useContext } from "react";
import type { Lang } from "../api/types";
import { en } from "./en";
import { ta } from "./ta";

export const dictionaries: Record<Lang, Record<string, string>> = { en, ta };

export function t(key: string, vars?: Record<string, string | number>, lang: Lang = "en"): string {
  const dict = dictionaries[lang] || en;
  let str = dict[key] || en[key] || key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
  }
  return str;
}

export interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key, vars) => t(key, vars, "en"),
});

export function useT() {
  return useContext(LanguageContext);
}
