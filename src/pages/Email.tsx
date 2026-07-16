import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	InboxIcon,
	ReplyIcon,
	StarIcon,
	Trash2Icon,
	PaperclipIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types & dummy data                                                         */
/* -------------------------------------------------------------------------- */

interface Email {
	id: string;
	from: string;
	subject: string;
	preview: string;
	body: string;
	time: string;
	read: boolean;
	starred: boolean;
	tag?: string;
	hasAttachment?: boolean;
}

const EMAILS: Email[] = [
	{
		id: "1",
		from: "Prof. Martinez",
		subject: "BIO 201 — Lab Report Graded",
		preview: "Your Unit 3 Lab Report has been graded. Please check Canvas for…",
		body: "Hi,\n\nYour Unit 3 Lab Report has been graded. You received 47/50. Well done overall — see the inline comments for feedback on your discussion section.\n\nBest,\nProf. Martinez",
		time: "9:14 AM",
		read: false,
		starred: true,
		tag: "BIO 201",
	},
	{
		id: "2",
		from: "CS 161 TA",
		subject: "Office Hours Update — this week",
		preview: "Office hours this Thursday will be held at 3 PM instead of 2 PM due to…",
		body: "Hey everyone,\n\nJust a heads-up that office hours this Thursday will move to 3 PM–5 PM instead of the usual 2 PM slot. The location is still Kearney 101B.\n\nSee you there!\n— TA Team",
		time: "Yesterday",
		read: true,
		starred: false,
		tag: "CS 161",
	},
	{
		id: "3",
		from: "Registrar's Office",
		subject: "Fall 2025 Registration Opens July 28",
		preview: "Course registration for Fall 2025 opens on Monday, July 28 at 8:00 AM…",
		body: "Dear Student,\n\nFall 2025 course registration opens on Monday, July 28 at 8:00 AM. Please log in to your student portal to view your assigned registration time and review available sections.\n\nIf you have a hold on your account, visit the Registrar's Office before July 25.\n\nRegistrar's Office",
		time: "Mon",
		read: true,
		starred: false,
	},
	{
		id: "4",
		from: "Study Group — ENG 102",
		subject: "Re: Peer Review Draft Exchange",
		preview: "I've uploaded my draft to the shared Google Drive. Can everyone submit theirs by…",
		body: "Hi all,\n\nI've uploaded my draft to the shared Google Drive folder. Can everyone please submit theirs by Wednesday night so we have time to read before Thursday's session?\n\nAlso — does anyone want to meet virtually at 7 PM Wednesday? Let me know!\n\nJamila",
		time: "Mon",
		read: false,
		starred: false,
		tag: "ENG 102",
		hasAttachment: true,
	},
	{
		id: "5",
		from: "Financial Aid",
		subject: "Action Required: Verify Enrollment for Aid Disbursement",
		preview: "Please verify your enrollment status for the upcoming semester to ensure…",
		body: "Dear Student,\n\nTo ensure your financial aid disbursement is processed on time, please verify your enrollment status for the upcoming semester via the student portal no later than July 22, 2025.\n\nFailure to verify may result in a delay or cancellation of aid.\n\nFinancial Aid Office",
		time: "Jul 14",
		read: true,
		starred: false,
	},
	{
		id: "6",
		from: "MTH 251 Prof. Chen",
		subject: "Quiz 4 Solutions Posted",
		preview: "The solutions for Quiz 4 have been posted to the course page. Average score…",
		body: "Hi class,\n\nQuiz 4 solutions are now posted on the course page. The class average was 82%. If you'd like to go over your paper, stop by office hours on Friday.\n\n— Prof. Chen",
		time: "Jul 13",
		read: true,
		starred: true,
		tag: "MTH 251",
	},
];

/* -------------------------------------------------------------------------- */
/*  Email list item                                                            */
/* -------------------------------------------------------------------------- */

function EmailRow({
	email,
	selected,
	onSelect,
}: {
	email: Email;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"w-full text-left px-4 py-3 transition-colors border-b border-border last:border-0",
				selected
					? "bg-muted"
					: email.read
					? "hover:bg-muted/60"
					: "bg-primary/5 hover:bg-primary/10"
			)}
		>
			<div className="flex items-start gap-2">
				{/* Unread dot */}
				<span
					className={cn(
						"mt-1.5 size-1.5 shrink-0 rounded-full",
						email.read ? "bg-transparent" : "bg-primary"
					)}
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<p
							className={cn(
								"truncate text-sm",
								email.read ? "font-normal text-foreground" : "font-semibold"
							)}
						>
							{email.from}
						</p>
						<span className="shrink-0 text-xs text-muted-foreground">
							{email.time}
						</span>
					</div>
					<p className="truncate text-sm text-foreground/80">{email.subject}</p>
					<div className="mt-0.5 flex items-center gap-2">
						<p className="truncate text-xs text-muted-foreground flex-1">
							{email.preview}
						</p>
						{email.hasAttachment && (
							<PaperclipIcon className="size-3 shrink-0 text-muted-foreground" />
						)}
					</div>
					{email.tag && (
						<Badge variant="outline" className="mt-1.5 text-[10px] font-normal py-0 px-1.5">
							{email.tag}
						</Badge>
					)}
				</div>
			</div>
		</button>
	);
}

/* -------------------------------------------------------------------------- */
/*  Reader pane                                                                */
/* -------------------------------------------------------------------------- */

function EmailReader({ email }: { email: Email }) {
	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border">
				<div className="min-w-0">
					<h2 className="text-base font-semibold leading-tight">{email.subject}</h2>
					<p className="mt-0.5 text-sm text-muted-foreground">
						From: <span className="text-foreground">{email.from}</span>
						{email.tag && (
							<Badge variant="outline" className="ml-2 text-[10px] font-normal py-0 px-1.5">
								{email.tag}
							</Badge>
						)}
					</p>
					<p className="text-xs text-muted-foreground mt-0.5">{email.time}</p>
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<Button variant="ghost" size="icon" aria-label="Star">
						<StarIcon
							className={cn(
								"size-4",
								email.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
							)}
						/>
					</Button>
					<Button variant="ghost" size="icon" aria-label="Delete">
						<Trash2Icon className="size-4 text-muted-foreground" />
					</Button>
				</div>
			</div>

			{/* Body */}
			<div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
				<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
					{email.body}
				</p>
			</div>

			{/* Reply bar */}
			<div className="border-t border-border px-6 py-3">
				<Button size="sm" className="gap-1.5">
					<ReplyIcon className="size-3.5" />
					Reply
				</Button>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
			<InboxIcon className="size-10 opacity-30" />
			<p className="text-sm">Select an email to read</p>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export function EmailPage() {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selected = EMAILS.find((e) => e.id === selectedId) ?? null;

	return (
		<div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
			{/* Email list */}
			<div className="scrollbar-thin w-full max-w-xs shrink-0 overflow-y-auto border-r border-border">
				{/* Toolbar */}
				<div className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-3 border-b border-border">
					<div className="flex items-center gap-2">
						<InboxIcon className="size-4 text-muted-foreground" />
						<span className="text-sm font-medium">Inbox</span>
						<Badge variant="secondary" className="font-normal text-xs">
							{EMAILS.filter((e) => !e.read).length}
						</Badge>
					</div>
				</div>
				{EMAILS.map((email) => (
					<EmailRow
						key={email.id}
						email={email}
						selected={email.id === selectedId}
						onSelect={() => setSelectedId(email.id)}
					/>
				))}
			</div>

			<Separator orientation="vertical" className="hidden md:block" />

			{/* Reader pane */}
			<div className="hidden min-h-0 flex-1 flex-col md:flex">
				{selected ? <EmailReader email={selected} /> : <EmptyState />}
			</div>
		</div>
	);
}
