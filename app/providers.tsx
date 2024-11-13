'use client'

import { LanguageProvider } from "@/context/LanguageContext";
import {NextUIProvider} from '@nextui-org/react'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </NextUIProvider>
  )
}