import { Outlet, useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

/**
 * Routes listed here render their <Outlet /> directly inside SidebarInset
 * without the padded / scrollable content wrapper.
 * This lets full-bleed components (like Whiteboard) fill the inset exactly.
 */
const FULL_BLEED_ROUTES = ["/dashboard/whiteboard"];

export function AppShell({ children }: { children?: React.ReactNode }) {
	const { pathname } = useLocation();
	const isFullBleed = FULL_BLEED_ROUTES.some((r) => pathname.startsWith(r));

	return (
		<div className="h-screen overflow-hidden">
			<SidebarProvider className="h-full">
				<AppSidebar />
				<SidebarInset className="flex min-h-0 flex-col md:peer-data-[variant=inset]:ml-0">
					<AppHeader />
					{isFullBleed ? (
						/* Full-bleed: component positions itself absolutely within SidebarInset */
						<>{children ?? <Outlet />}</>
					) : (
						/* Normal: padded scrollable content area */
						<div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
							{children ?? <Outlet />}
						</div>
					)}
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
