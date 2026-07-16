import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import es from "@/locales/es.json";
import en from "@/locales/en.json";

// Esto controla los textos DE INTERFAZ (menús, botones, HUD).
// El contenido de cada Question ya trae es/en embebidos (ver types/question.ts)
// y se selecciona directo con el idioma activo, sin pasar por i18next.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: "es",
    interpolation: { escapeValue: false },
  });

export default i18n;
