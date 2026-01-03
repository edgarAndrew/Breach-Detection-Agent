import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/shared/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <main className="flex min-h-screen w-full">
                <AppSidebar />
                <section className="flex-1 overflow-auto">
                    <SidebarTrigger />
                    {children}
                </section>
            </main>
        </SidebarProvider>
    )
}
