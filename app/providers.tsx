'use client'

import { LanguageProvider } from "@/context/LanguageContext";
import { OptionProvider } from "@/context/OptionsContext";
import {NextUIProvider} from '@nextui-org/react'
import { Suspense } from "react";

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <LanguageProvider>
        <OptionProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </OptionProvider>
      </LanguageProvider>
    </NextUIProvider>
  )
}