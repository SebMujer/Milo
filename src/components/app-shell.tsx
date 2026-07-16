import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children?: React.ReactNode }) {
	return (
		<div className="h-screen overflow-hidden">
			<SidebarProvider className="h-full">
				<AppSidebar />
				<SidebarInset className="flex min-h-0 flex-col md:peer-data-[variant=inset]:ml-0">
					<AppHeader />
					<div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
						{children ?? <Outlet />}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
