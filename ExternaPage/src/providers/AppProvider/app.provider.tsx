import { ReactNode } from 'react'
import { ThemeProvider, I18nProvider } from "@/providers"

export function AppProvider({ children, }: Readonly<{ children: ReactNode }>) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <I18nProvider>
          {children}
        </I18nProvider>
      </ThemeProvider>
  )
}
