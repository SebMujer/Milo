import type { ReactNode } from "react";
import {
	LayoutGridIcon,
	CalendarDaysIcon,
	ClipboardListIcon,
	GraduationCapIcon,
	NotebookPenIcon,
	BookOpenIcon,
	SettingsIcon,
} from "lucide-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label?: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		items: [
			{
				title: "Overview",
				path: "/dashboard",
				icon: <LayoutGridIcon />,
				isActive: true,
			},
		],
	},
	{
		label: "Schoolwork",
		items: [
			{
				title: "Calendar",
				path: "/dashboard/calendar",
				icon: <CalendarDaysIcon />,
			},
			{
				title: "Tasks",
				path: "/dashboard/tasks",
				icon: <ClipboardListIcon />,
			},
			{
				title: "Canvas",
				icon: <GraduationCapIcon />,
				subItems: [
					{ title: "Assignments", path: "/dashboard/canvas/assignments" },
					{ title: "Grades", path: "/dashboard/canvas/grades" },
					{ title: "Announcements", path: "/dashboard/canvas/announcements" },
				],
			},
			{
				title: "Notes",
				icon: <NotebookPenIcon />,
				subItems: [
					{ title: "Active notes", path: "/dashboard/notes/active" },
					{ title: "Archive", path: "/dashboard/notes/archive" },
				],
			},
			{
				title: "Courses",
				path: "/dashboard/courses",
				icon: <BookOpenIcon />,
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Settings",
		path: "/dashboard/settings",
		icon: <SettingsIcon />,
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
