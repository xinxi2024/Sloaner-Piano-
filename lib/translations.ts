// 简单的翻译系统

type TranslationKey =
  | "piano"
  | "howToPlay"
  | "close"
  | "useKeyboard"
  | "useTouchscreen"
  | "changeInstrument"
  | "selectInstrument"
  | "pianoInstrument"
  | "organInstrument"
  | "synthInstrument"
  | "musicBoxInstrument"
  | "bestExperience"

const translations: Record<"en" | "zh", Record<TranslationKey, string>> = {
  en: {
    piano: "Piano",
    howToPlay: "How to Play",
    close: "Close",
    useKeyboard: "Use your computer keyboard to play (keys A-K for white keys, W-U for black keys)",
    useTouchscreen: "Or tap/click directly on the piano keys",
    changeInstrument: "Change instruments using the selector below",
    selectInstrument: "Select Instrument",
    pianoInstrument: "Piano",
    organInstrument: "Organ",
    synthInstrument: "Synth",
    musicBoxInstrument: "Music Box",
    bestExperience: "Use a larger screen for the best experience",
  },
  zh: {
    piano: "钢琴",
    howToPlay: "如何演奏",
    close: "关闭",
    useKeyboard: "使用键盘演奏（A-K 键为白键，W-U 键为黑键）",
    useTouchscreen: "或直接点击/触摸钢琴键",
    changeInstrument: "使用下方选择器更换乐器",
    selectInstrument: "选择乐器",
    pianoInstrument: "钢琴",
    organInstrument: "风琴",
    synthInstrument: "合成器",
    musicBoxInstrument: "八音盒",
    bestExperience: "使用更大的屏幕获得最佳体验",
  },
}

export function useTranslation(language: "en" | "zh") {
  const t = (key: TranslationKey): string => {
    const translation = translations[language][key]
    if (!translation) {
      console.warn(`Missing translation for key "${key}" in language "${language}"`)
      return key
    }
    return translation
  }

  return { t }
}

