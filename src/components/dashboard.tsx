import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	BookOpenIcon,
	CalendarClockIcon,
	CheckCircle2Icon,
	CircleIcon,
	ClipboardListIcon,
	FileTextIcon,
	GraduationCapIcon,
	NotebookPenIcon,
	SparklesIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type Priority = "high" | "medium" | "low";

interface Deadline {
	course: string;
	title: string;
	due: string;
	priority: Priority;
}

interface CanvasAssignment {
	course: string;
	title: string;
	due: string;
	points: string;
	status: "submitted" | "todo" | "missing";
}

interface Note {
	title: string;
	course: string;
	updated: string;
	preview: string;
}

interface ScheduleItem {
	time: string;
	course: string;
	room: string;
}

/* -------------------------------------------------------------------------- */
/*  Dummy data                                                                 */
/* -------------------------------------------------------------------------- */

const deadlines: Deadline[] = [
	{
		course: "BIO 201",
		title: "Unit 3 Lab Report",
		due: "Tomorrow, 11:59 PM",
		priority: "high",
	},
	{
		course: "CS 161",
		title: "Project 2: Data Structures",
		due: "Fri, Jul 18",
		priority: "high",
	},
	{
		course: "ENG 102",
		title: "Essay Draft",
		due: "Mon, Jul 21",
		priority: "medium",
	},
	{
		course: "MTH 251",
		title: "Online Quiz 4",
		due: "Wed, Jul 23",
		priority: "low",
	},
];

const canvasAssignments: CanvasAssignment[] = [
	{
		course: "CS 161",
		title: "Reading: Binary Trees",
		due: "Today, 11:59 PM",
		points: "10 pts",
		status: "todo",
	},
	{
		course: "BIO 201",
		title: "Discussion Post 5",
		due: "Today, 11:59 PM",
		points: "5 pts",
		status: "todo",
	},
	{
		course: "ENG 102",
		title: "Peer Review Submission",
		due: "Yesterday",
		points: "20 pts",
		status: "submitted",
	},
	{
		course: "MTH 251",
		title: "Problem Set 6",
		due: "3 days ago",
		points: "30 pts",
		status: "missing",
	},
];

const notes: Note[] = [
	{
		title: "Cellular Respiration",
		course: "BIO 201",
		updated: "2h ago",
		preview: "Glycolysis occurs in the cytoplasm, splitting glucose into…",
	},
	{
		title: "Big-O Notation",
		course: "CS 161",
		updated: "Yesterday",
		preview: "O(n log n) describes merge sort and other divide & conquer…",
	},
	{
		title: "Thesis Outline",
		course: "ENG 102",
		updated: "3d ago",
		preview: "Argument: technology reshapes the modern classroom by…",
	},
];

const todaySchedule: ScheduleItem[] = [
	{ time: "9:00 AM", course: "BIO 201 — Lecture", room: "Science 210" },
	{ time: "11:00 AM", course: "CS 161 — Lecture", room: "Kearney 101" },
	{ time: "1:00 PM", course: "ENG 102 — Seminar", room: "Online" },
	{ time: "3:30 PM", course: "MTH 251 — Recitation", room: "Gilkey 112" },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const priorityStyles: Record<Priority, string> = {
	high: "text-destructive",
	medium: "text-amber-500 dark:text-amber-400",
	low: "text-muted-foreground",
};

const statusStyles: Record<CanvasAssignment["status"], string> = {
	submitted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
	todo: "bg-primary/15 text-primary",
	missing: "bg-destructive/15 text-destructive",
};

const statusLabel: Record<CanvasAssignment["status"], string> = {
	submitted: "Submitted",
	todo: "To do",
	missing: "Missing",
};

/* -------------------------------------------------------------------------- */
/*  Section header                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({
	icon: Icon,
	title,
	count,
	action,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	count?: string;
	action?: string;
}) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<Icon className="size-4 text-muted-foreground" />
				<h3 className="font-medium">{title}</h3>
				{count && (
					<Badge variant="secondary" className="font-normal">
						{count}
					</Badge>
				)}
			</div>
			{action && (
				<button className="text-xs text-muted-foreground transition-colors hover:text-foreground">
					{action}
				</button>
			)}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Stats row                                                                  */
/* -------------------------------------------------------------------------- */

function StudentStats() {
	const stats = [
		{
			label: "Tasks due this week",
			value: "8",
			icon: ClipboardListIcon,
			hint: "3 due today",
		},
		{
			label: "Upcoming deadlines",
			value: "4",
			icon: CalendarClockIcon,
			hint: "next in 2 days",
		},
		{
			label: "Canvas syncs (7d)",
			value: "23",
			icon: GraduationCapIcon,
			hint: "last sync 1h ago",
		},
		{
			label: "Active notes",
			value: "12",
			icon: NotebookPenIcon,
			hint: "2 updated today",
		},
	];

	return (
		<>
			{stats.map((s) => (
				<Card key={s.label} className="shadow-none dark:ring-0">
					<CardHeader>
						<CardTitle className="flex items-center justify-between font-normal text-xs text-muted-foreground">
							{s.label}
							<s.icon className="size-4" />
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						<p className="text-2xl font-semibold tabular-nums">{s.value}</p>
						<p className="text-xs text-muted-foreground">{s.hint}</p>
					</CardContent>
				</Card>
			))}
		</>
	);
}

/* -------------------------------------------------------------------------- */
/*  Main dashboard                                                             */
/* -------------------------------------------------------------------------- */

export function Dashboard() {
	return (
		<div className="space-y-6">
			{/* Greeting */}
			<div className="flex items-center gap-2">
				<SparklesIcon className="size-5 text-primary" />
				<div>
					<h1 className="font-heading text-xl font-semibold">
						Good morning, let&apos;s get organized.
					</h1>
					<p className="text-sm text-muted-foreground">
						You have 3 assignments due today and 4 deadlines this week.
					</p>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StudentStats />
			</div>

			{/* Two-column layout */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left column: deadlines + canvas */}
				<div className="space-y-6 lg:col-span-2">
					{/* Upcoming Deadlines */}
					<Card className="shadow-none dark:ring-0">
						<CardHeader>
							<SectionHeader
								icon={CalendarClockIcon}
								title="Upcoming Deadlines"
								count="4"
								action="View all"
							/>
						</CardHeader>
						<CardContent className="divide-y">
							{deadlines.map((d) => (
								<div
									key={`${d.course}-${d.title}`}
									className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
								>
									<div className="flex min-w-0 items-center gap-3">
										<CircleIcon
											className={cn("size-4 shrink-0", priorityStyles[d.priority])}
										/>
										<div className="min-w-0">
											<p className="truncate font-medium">{d.title}</p>
											<p className="text-xs text-muted-foreground">{d.course}</p>
										</div>
									</div>
									<div className="shrink-0 text-right text-xs text-muted-foreground">
										{d.due}
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Canvas Assignments */}
					<Card className="shadow-none dark:ring-0">
						<CardHeader>
							<SectionHeader
								icon={GraduationCapIcon}
								title="Canvas Assignments"
								count="4"
								action="Open Canvas"
							/>
						</CardHeader>
						<CardContent className="divide-y">
							{canvasAssignments.map((a) => (
								<div
									key={`${a.course}-${a.title}`}
									className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
								>
									<div className="flex min-w-0 items-center gap-3">
										<BookOpenIcon className="size-4 shrink-0 text-muted-foreground" />
										<div className="min-w-0">
											<p className="truncate font-medium">{a.title}</p>
											<p className="text-xs text-muted-foreground">
												{a.course} · {a.points}
											</p>
										</div>
									</div>
									<div className="flex shrink-0 items-center gap-3">
										<span className="text-right text-xs text-muted-foreground">
											{a.due}
										</span>
										<Badge
											variant="secondary"
											className={cn("font-normal", statusStyles[a.status])}
										>
											{statusLabel[a.status]}
										</Badge>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>

				{/* Right column: notes + schedule */}
				<div className="space-y-6">
					{/* Active Notes */}
					<Card className="shadow-none dark:ring-0">
						<CardHeader>
							<SectionHeader
								icon={FileTextIcon}
								title="Active Notes"
								count="3"
								action="New note"
							/>
						</CardHeader>
						<CardContent className="space-y-3">
							{notes.map((n) => (
								<button
									key={n.title}
									type="button"
									className="block w-full rounded-lg border bg-muted/40 p-3 text-left transition-colors hover:bg-muted"
								>
									<div className="flex items-center justify-between gap-2">
										<p className="truncate font-medium">{n.title}</p>
										<Badge variant="outline" className="shrink-0 font-normal">
											{n.course}
										</Badge>
									</div>
									<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
										{n.preview}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										Updated {n.updated}
									</p>
								</button>
							))}
						</CardContent>
					</Card>

					{/* Today's Schedule */}
					<Card className="shadow-none dark:ring-0">
						<CardHeader>
							<CardTitle className="font-normal text-xs text-muted-foreground">
								Today&apos;s Schedule
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{todaySchedule.map((item) => (
								<div
									key={`${item.time}-${item.course}`}
									className="flex items-center gap-3"
								>
									<div className="w-16 shrink-0 text-xs font-medium text-muted-foreground">
										{item.time}
									</div>
									<div className="h-8 w-px bg-border" />
									<div className="min-w-0">
										<p className="truncate text-sm font-medium">{item.course}</p>
										<p className="text-xs text-muted-foreground">{item.room}</p>
									</div>
									<CheckCircle2Icon className="ml-auto size-4 shrink-0 text-muted-foreground/40" />
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
