"use client"

import { Construction, Clock, Wrench } from "lucide-react"
import { Card } from "@/components"
import texts from "@/lib/locales/es.json"
//import Link from "next/link"

interface UnderConstructionProps {
  readonly title?: string
  readonly description?: string
  readonly showBackButton?: boolean
}

export function FuntionConstruction({
  title = texts.function?.title ?? "Función en Construcción",
  description = texts.function?.description ?? "Esta funcionalidad está siendo desarrollada. Estará disponible pronto.",
  showBackButton = true,
}: UnderConstructionProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6 shadow-xl">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-2xl" />
            <div className="relative bg-linear-to-br from-orange-500 to-yellow-500 p-6 rounded-full">
              <Construction className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-balance bg-linear-to-r from-orange-600 to-yellow-600 dark:from-orange-400 dark:to-yellow-400 bg-clip-text text-transparent">
            {texts.page.title}
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            {texts.page.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <Wrench className="h-8 w-8 text-orange-500" />
            <p className="text-sm font-medium">{texts.statusCards.dev.title}</p>
            <p className="text-xs text-muted-foreground text-center">{texts.statusCards.dev.desc}</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <Clock className="h-8 w-8 text-blue-500" />
            <p className="text-sm font-medium">{texts.statusCards.soon.title}</p>
            <p className="text-xs text-muted-foreground text-center">{texts.statusCards.soon.desc}</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <Construction className="h-8 w-8 text-yellow-500" />
            <p className="text-sm font-medium">{texts.statusCards.improve.title}</p>
            <p className="text-xs text-muted-foreground text-center">{texts.statusCards.improve.desc}</p>
          </div>
        </div>
        <div className="pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            {texts.contact.prompt} {" "}
            <a
              href={`mailto:${texts.contact.email}`}
              className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
            >
              {texts.contact.email}
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}
