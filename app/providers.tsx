'use client'

import { LanguageProvider } from "@/context/LanguageContext";
import { OptionProvider } from "@/context/OptionsContext";
import {NextUIProvider} from '@nextui-org/react'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <LanguageProvider>
        <OptionProvider>
          {children}
        </OptionProvider>
      </LanguageProvider>
    </NextUIProvider>
  )
}