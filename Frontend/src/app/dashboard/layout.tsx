import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { DynamicBreadcrumbs } from "@/components/dashboard/breadcrumbs"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import type { ReactNode } from "react"

export default function DashboardLayout({
    children,
}: {
    readonly children: ReactNode
}) {
    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset>
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <DynamicBreadcrumbs />
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
