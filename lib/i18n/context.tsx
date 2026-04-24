"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { translate, type Dictionary } from "./dictionaries"
import type { Locale } from "./config"

interface I18nContextValue {
  locale: Locale
  dict: Dictionary
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

interface Props {
  locale: Locale
  dict: Dictionary
  children: ReactNode
}

export function I18nProvider({ locale, dict, children }: Props) {
  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      dict,
      t: (key, vars) => translate(dict, key, vars),
    }
  }, [locale, dict])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useI18n은 <I18nProvider> 내부에서만 호출 가능합니다.")
  }
  return ctx
}

/** 짧은 사용을 위한 별칭 */
export function useT() {
  return useI18n().t
}
