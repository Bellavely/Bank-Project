import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import heTranslation from "./locales/he.json";
import enTranslation from "./locales/en.json";

export const resources = {
  he: { translation: heTranslation },
  en: { translation: enTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "he",
    interpolation: {
      escapeValue: false,
    },
});

i18n.on("languageChanged", (lng: string) => {
  document.dir = lng === "he" ? "rtl" : "ltr";
});

export default i18n;
