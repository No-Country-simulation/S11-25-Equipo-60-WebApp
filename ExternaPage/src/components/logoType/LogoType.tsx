"use client"

import { LogoSvg } from "@/components"
import { useTranslation } from "@/providers"

interface ILogoTypeProps {
  readonly sizeLogo?: number
  readonly alt?: string
  readonly className?: string
  readonly currentColor?: string
  readonly horizontal?: boolean
}

export const LogoType = ({ sizeLogo = 24, alt, className, currentColor = "#ffffff", horizontal = false }: Readonly<ILogoTypeProps>) => {
    const { t } = useTranslation()
  return (
    <div className={`flex justify-center items-center gap-2 ${className} ${horizontal ? "flex-row" : "flex-col"}`}>
      <LogoSvg size={sizeLogo} alt={t("logoType.alt")} currentColor={currentColor} className={className} />
      <span className={`${className}`} >
        {t("logoType.title")}
      </span>    
    </div>
  )
}
