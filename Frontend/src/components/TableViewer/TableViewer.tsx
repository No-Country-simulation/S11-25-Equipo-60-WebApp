"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import type { CardType } from "@/interfaces/AppInterfaces"
import GenericTable from "./GenericTable"
import es from "@/lib/locales/es.json"

interface TableViewerProps {
  readonly cardTypes?: CardType[]
  readonly setCardTypes?: React.Dispatch<React.SetStateAction<CardType[]>>
}

// mock data
const MockCardTypes: CardType[] = [
  { id: "1", name: "Visa Crédito", fee: 3.5, days: 30 },
  { id: "2", name: "Visa Débito", fee: 1.5, days: 1 },
  { id: "3", name: "Master Crédito", fee: 4.1, days: 30 },
  { id: "4", name: "Master Débito", fee: 1.6, days: 1 },
]

export function TableViewer({ cardTypes = MockCardTypes, setCardTypes }: TableViewerProps) {
  // If parent doesn't provide setter, manage local state
  const [localData, setLocalData] = useState<CardType[]>(cardTypes)
  const data = setCardTypes ? cardTypes : localData
  const setData = setCardTypes ?? setLocalData

  const t = es.table

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GenericTable
          data={data}
          setData={setData}
          columnLabels={{
            name: t.headers.name,
            fee: t.headers.fee,
            days: t.headers.days,
          }}
        />
      </CardContent>
    </Card>
  )
}
