"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/translations"
import { Music, Radio, AudioWaveformIcon as Waveform, Music2 } from "lucide-react"

interface InstrumentSelectorProps {
  currentInstrument: string
  onInstrumentChange: (instrument: string) => void
  language: "en" | "zh"
}

export default function InstrumentSelector({
  currentInstrument,
  onInstrumentChange,
  language,
}: InstrumentSelectorProps) {
  const { t } = useTranslation(language)

  const instruments = [
    { id: "piano", name: t("pianoInstrument"), icon: <Music className="h-4 w-4 mr-1" /> },
    { id: "organ", name: t("organInstrument"), icon: <Radio className="h-4 w-4 mr-1" /> },
    { id: "synth", name: t("synthInstrument"), icon: <Waveform className="h-4 w-4 mr-1" /> },
    { id: "music-box", name: t("musicBoxInstrument"), icon: <Music2 className="h-4 w-4 mr-1" /> },
  ]

  return (
    <div
      className="bg-white/10 backdrop-blur-md p-5 rounded-lg border border-white/20 shadow-xl w-full max-w-2xl"
      key={`instrument-selector-${language}`}
    >
      <h2 className="text-white text-lg font-medium mb-4 flex items-center">
        <span className="inline-block w-2 h-6 bg-gradient-to-b from-indigo-400 to-purple-400 mr-2 rounded-sm"></span>
        {t("selectInstrument")}
      </h2>
      <RadioGroup
        value={currentInstrument}
        onValueChange={onInstrumentChange}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {instruments.map((instrument) => (
          <div
            key={instrument.id}
            className={`flex items-center space-x-2 p-3 rounded-md transition-all ${
              currentInstrument === instrument.id
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                : "bg-white/5 hover:bg-white/10 text-white"
            }`}
          >
            <RadioGroupItem value={instrument.id} id={instrument.id} className="text-white" />
            <Label htmlFor={instrument.id} className="flex items-center cursor-pointer">
              {instrument.icon}
              {instrument.name}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

