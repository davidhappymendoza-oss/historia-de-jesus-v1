import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/settingsStore";
import { getQuestionBankSize } from "@/services/questions/questionLoader";
import { audioService } from "@/services/audio";
import { TARGET_QUESTION_BANK_SIZE } from "@/config/levels";
import { FEATURES } from "@/config/features";

const readyItems = [
  "Tipos de datos completos (Question, Player, Statistics, Achievement)",
  "Banco de preguntas 100% en JSON, auto-descubierto (0 cambios de código al agregar preguntas)",
  "Sistema anti-repetición por jugador (question history + ciclos)",
  "Adapter de almacenamiento (local hoy, nube lista para conectar)",
  "Servicio de audio con efectos de correcto/incorrecto funcionando",
  "i18n ES/EN para la interfaz",
  "Tema visual (paleta, tipografía, panel firma)",
];

const upcomingItems = [
  "Fase 1 — Menú principal, flujo de jugador nuevo/existente",
  "Fase 2 — Motor de juego: cronómetro, vidas, puntuación, VerseRevealCard",
];

export default function App() {
  const { t, i18n } = useTranslation();
  const { settings, isLoaded, load, setLanguage } = useSettingsStore();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isLoaded) i18n.changeLanguage(settings.language);
  }, [isLoaded, settings.language, i18n]);

  const bankSize = getQuestionBankSize();

  return (
    <div className="min-h-full bg-ink text-parchment flex flex-col items-center justify-center px-4 py-10 gap-8">
      <header className="text-center">
        <h1 className="font-display text-4xl md:text-5xl text-halo drop-shadow-[0_3px_0_#14141C]">
          {t("app.title")}
        </h1>
        <p className="font-mono text-xs tracking-widest text-parchment/60 mt-2 uppercase">
          {t("app.credit")}
        </p>
      </header>

      <section className="panel-comic w-full max-w-xl p-6 text-comicblack">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Fase 0 — Fundamentos</h2>
          <button
            className="font-mono text-sm px-3 py-1 rounded-lg border-2 border-comicblack bg-halo hover:bg-halo-light transition-colors shadow-panel-sm active:translate-y-[2px] active:shadow-none"
            onClick={() => setLanguage(settings.language === "es" ? "en" : "es")}
          >
            {settings.language === "es" ? "ES" : "EN"}
          </button>
        </div>

        <ul className="space-y-1.5 text-sm mb-4">
          {readyItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-olive font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="font-mono text-sm bg-ink text-halo rounded-lg px-3 py-2 mb-4">
          Banco de preguntas: {bankSize} / {TARGET_QUESTION_BANK_SIZE} preguntas
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 font-display text-sm px-3 py-2 rounded-lg border-2 border-comicblack bg-olive text-parchment shadow-panel-sm active:translate-y-[2px] active:shadow-none"
            onClick={() => audioService.playSfx("correct")}
          >
            🔊 Probar sonido: correcto
          </button>
          <button
            className="flex-1 font-display text-sm px-3 py-2 rounded-lg border-2 border-comicblack bg-clay text-parchment shadow-panel-sm active:translate-y-[2px] active:shadow-none"
            onClick={() => audioService.playSfx("incorrect")}
          >
            🔊 Probar sonido: incorrecto
          </button>
        </div>
      </section>

      <section className="w-full max-w-xl text-parchment/70 text-sm">
        <h3 className="font-display text-base text-halo mb-2">Próximo</h3>
        <ul className="space-y-1">
          {upcomingItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {FEATURES.soundEffects && (
          <p className="mt-3 text-xs text-parchment/40">
            soundEffects: activo — todas las demás funciones futuras están en
            config/features.ts, listas para activarse sin rediseñar nada.
          </p>
        )}
      </section>
    </div>
  );
}
