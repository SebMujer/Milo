import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

/**
 * Routes listed here render their <Outlet /> directly inside SidebarInset
 * without the padded / scrollable content wrapper.
 */
const FULL_BLEED_ROUTES = ["/dashboard/whiteboard"];

const PAGE_VARIANTS = {
	initial: { opacity: 0, y: 6 },
	enter:   { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] as const } },
	exit:    { opacity: 0, y: -4, transition: { duration: 0.12, ease: [0.25, 0.1, 0.25, 1] as const } },
} as const;

export function AppShell({ children }: { children?: React.ReactNode }) {
	const location = useLocation();
	const isFullBleed = FULL_BLEED_ROUTES.some((r) => location.pathname.startsWith(r));

	return (
		<div className="h-screen overflow-hidden">
			<SidebarProvider className="h-full">
				<AppSidebar />
				<SidebarInset className="flex min-h-0 flex-col md:peer-data-[variant=inset]:ml-0">
					<AppHeader />
					{isFullBleed ? (
						<>{children ?? <Outlet />}</>
					) : (
						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={location.pathname}
								variants={PAGE_VARIANTS}
								initial="initial"
								animate="enter"
								exit="exit"
								className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6"
							>
								{children ?? <Outlet />}
							</motion.div>
						</AnimatePresence>
					)}
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
