"use client";

import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { navLinks } from "@/components/app-shared";
import { NavUser } from "@/components/nav-user";
import { BellIcon, SearchIcon } from "lucide-react";

export function AppHeader() {
	const location = useLocation();

	// Match the current path against the nav items to derive the breadcrumb.
	const activeItem =
		navLinks.find(
			(item) => item.path && location.pathname === item.path
		) ??
		// Fallback: parent segment match (e.g. /dashboard/calendar -> Calendar)
		navLinks.find(
			(item) =>
				item.path &&
				location.pathname.startsWith(item.path.split("/").slice(0, -1).join("/")) &&
				item.path !== "/dashboard"
		);

	return (
		<header
			className={cn(
				"sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 md:px-6"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>
			<div className="flex items-center gap-3">
				<Button size="icon-sm" variant="outline" aria-label="Search">
					<SearchIcon />
				</Button>
				<Button aria-label="Notifications" size="icon-sm" variant="outline">
					<BellIcon />
				</Button>
				<Separator
					className="h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<NavUser />
			</div>
		</header>
	);
}
