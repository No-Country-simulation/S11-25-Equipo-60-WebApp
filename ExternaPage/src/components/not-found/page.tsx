"use client"

import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "../ui/button";
import { LogoSvg } from "../svg/LogoSvg";
import { LogoType } from "../logoType/LogoType"
import { useTranslation } from "@/providers"

export function NotFoundContent() {
    const { t } = useTranslation()

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex flex-col items-center justify-center space-y-2 gap-2">
            <LogoType sizeLogo={128} className="text-6xl font-bold text-foreground/90"/>
            <h1 className="text-7xl font-bold text-foreground/90">
              {t("notFound.code")}
            </h1>
            <h2 className="text-2xl font-semibold text-foreground/80">
              {t("notFound.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("notFound.description")}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button>{t("notFound.backHome")}</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">{t("notFound.goDashboard")}</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }
