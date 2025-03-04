"use client"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface LanguageSelectorProps {
  language: "en" | "zh"
  onLanguageChange: (language: "en" | "zh") => void
}

export default function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  const languages = [
    { code: "zh", name: "中文" },
    { code: "en", name: "English" },
  ]

  // 处理语言选择
  const handleSelectLanguage = (langCode: string) => {
    if (langCode === "en" || langCode === "zh") {
      onLanguageChange(langCode as "en" | "zh")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-white hover:bg-white/10 border border-white/20"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{language === "en" ? "English" : "中文"}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-indigo-950/90 backdrop-blur-md border-white/20">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={`flex items-center justify-between text-white hover:bg-white/10 cursor-pointer ${
              language === lang.code ? "bg-indigo-700/50" : ""
            }`}
            onClick={() => handleSelectLanguage(lang.code)}
            onSelect={(event) => {
              // 阻止默认行为以确保我们的处理程序运行
              event.preventDefault()
              handleSelectLanguage(lang.code)
            }}
          >
            {lang.name}
            {language === lang.code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

