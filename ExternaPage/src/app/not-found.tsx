import { NotFoundContent } from "@/components"
import { I18nProvider } from "@/i18n/i18n-provider"

export default function NotFound() {
  return (
    <I18nProvider>
     <NotFoundContent />
    </I18nProvider>
  )
}
