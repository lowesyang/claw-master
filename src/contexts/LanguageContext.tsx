import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { translations, Language, TranslationKey } from '../i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'openclaw_language'
const VALID_LANGS: Language[] = ['en', 'zh', 'ja', 'ko', 'es', 'pt', 'ru', 'vi']

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && VALID_LANGS.includes(saved as Language)) return saved as Language
    return 'en'
  })

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    const langMap = translations[language]
    return (langMap && langMap[key]) || translations.en[key] || key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
