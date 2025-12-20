import { useState } from 'react';
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui";
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu'
import { Languages } from 'lucide-react'

const LANGUAGE_STORAGE_KEY = 'i18nextLng'

export function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const [showLangMenu, setShowLangMenu] = useState(false)

  const handleLanguageChange = (lang: string) => {
    // Change language (LanguageDetector will save to localStorage automatically)
    i18n.changeLanguage(lang)
    // Explicitly ensure it's saved to localStorage (backup)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    setShowLangMenu(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setShowLangMenu(!showLangMenu)
        }}
        title={t('language.ar')}
      >
        <Languages className="h-5 w-5" />
      </Button>
      <DropdownMenu
        isOpen={showLangMenu}
        onClose={() => setShowLangMenu(false)}
        className="w-32"
      >
        <DropdownMenuItem
          isActive={i18n.language === 'ar'}
          onClick={() => handleLanguageChange('ar')}
        >
          <span>{t('language.ar')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          isActive={i18n.language === 'en'}
          onClick={() => handleLanguageChange('en')}
        >
          <span>{t('language.en')}</span>
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}
