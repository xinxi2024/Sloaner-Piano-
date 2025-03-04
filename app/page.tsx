"use client"

import { useState, useEffect } from "react"
import PianoKeyboard from "@/components/piano-keyboard"
import InstrumentSelector from "@/components/instrument-selector"
import { Button } from "@/components/ui/button"
import LanguageSelector from "@/components/language-selector"
import { useTranslation } from "@/lib/translations"

export default function Home() {
  const [instrument, setInstrument] = useState("piano")
  const [showInstructions, setShowInstructions] = useState(true)
  // 设置默认语言为中文
  const [language, setLanguage] = useState<"en" | "zh">("zh")
  const { t } = useTranslation(language)

  // 处理语言变更
  const handleLanguageChange = (newLanguage: "en" | "zh") => {
    console.log("Language changed to:", newLanguage)
    setLanguage(newLanguage)
    // 将语言偏好保存到本地存储
    try {
      localStorage.setItem("preferredLanguage", newLanguage)
    } catch (error) {
      console.error("Failed to save language preference:", error)
    }
  }

  // 组件挂载时加载保存的语言偏好
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("preferredLanguage")
      if (savedLanguage === "en" || savedLanguage === "zh") {
        console.log("Loading saved language:", savedLanguage)
        setLanguage(savedLanguage)
      }
    } catch (error) {
      console.error("Failed to load language preference:", error)
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-purple-900 to-indigo-900">
      <div className="w-full max-w-5xl flex flex-col items-center gap-6">
        <div className="w-full flex justify-between items-center mt-4">
          <div className="flex items-center">
            <div className="logo-container mr-3">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <rect width="40" height="40" rx="8" fill="#6366F1" />
                <path d="M8 28H32V32H8V28Z" fill="white" />
                <rect x="10" y="8" width="4" height="20" fill="white" />
                <rect x="18" y="8" width="4" height="20" fill="white" />
                <rect x="26" y="8" width="4" height="20" fill="white" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">Sloaner {t("piano")}</h1>
          </div>
          <LanguageSelector language={language} onLanguageChange={handleLanguageChange} />
        </div>

        {showInstructions && (
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-lg text-white max-w-2xl border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">{t("howToPlay")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(false)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {t("close")}
              </Button>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>{t("useKeyboard")}</li>
              <li>{t("useTouchscreen")}</li>
              <li>{t("changeInstrument")}</li>
            </ul>
          </div>
        )}

        <InstrumentSelector
          currentInstrument={instrument}
          onInstrumentChange={setInstrument}
          language={language}
          key={`instrument-selector-${language}`}
        />

        <PianoKeyboard instrument={instrument} />

        <div className="text-indigo-200 text-sm mt-8 text-center">
          <p>© 2025 Sloaner {t("piano")}</p>
          <p className="mt-1">{t("bestExperience")}</p>
        </div>
      </div>
    </main>
  )
}

