import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	MessageSquareIcon,
	ChevronRightIcon,
	ReplyIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types & dummy data                                                         */
/* -------------------------------------------------------------------------- */

interface ThreadMessage {
	id: string;
	from: string;
	body: string;
	time: string;
	isMe?: boolean;
}

interface Thread {
	id: string;
	subject: string;
	participants: string[];
	tag?: string;
	unread: number;
	lastTime: string;
	messages: ThreadMessage[];
}

const THREADS: Thread[] = [
	{
		id: "t1",
		subject: "BIO 201 — Lab Group Coordination",
		participants: ["Prof. Martinez", "Jamila K.", "Dev P."],
		tag: "BIO 201",
		unread: 2,
		lastTime: "9:41 AM",
		messages: [
			{
				id: "m1",
				from: "Prof. Martinez",
				time: "Mon, 9:00 AM",
				body: "Hi team — please confirm you've all received the updated lab protocol for Unit 4. We'll begin Tuesday.",
			},
			{
				id: "m2",
				from: "Jamila K.",
				time: "Mon, 10:15 AM",
				body: "Confirmed! I've also shared the shared Google Doc link in our group chat.",
			},
			{
				id: "m3",
				from: "Dev P.",
				time: "Mon, 11:02 AM",
				body: "Got it. Quick question — are we using the standard titration protocol or the modified one from last semester?",
				isMe: true,
			},
			{
				id: "m4",
				from: "Prof. Martinez",
				time: "Today, 9:14 AM",
				body: "Use the updated protocol I just posted to Canvas — it has the corrections to section 3.2.",
			},
			{
				id: "m5",
				from: "Jamila K.",
				time: "Today, 9:41 AM",
				body: "Thanks! We're set. See everyone Tuesday at 9 AM.",
			},
		],
	},
	{
		id: "t2",
		subject: "ENG 102 — Peer Review Coordination",
		participants: ["Jamila K.", "Marcus T.", "You"],
		tag: "ENG 102",
		unread: 1,
		lastTime: "Yesterday",
		messages: [
			{
				id: "m1",
				from: "Jamila K.",
				time: "Sun, 2:00 PM",
				body: "Hey — I've uploaded my draft to the shared Drive. Can everyone submit theirs by Wednesday night?",
			},
			{
				id: "m2",
				from: "Marcus T.",
				time: "Sun, 4:30 PM",
				body: "Will do! Mine needs one more pass but I'll have it up by Tuesday.",
			},
			{
				id: "m3",
				from: "You",
				time: "Yesterday, 6:00 PM",
				body: "Just uploaded mine. Let me know if the sharing permissions work — I set it to 'anyone with the link'.",
				isMe: true,
			},
			{
				id: "m4",
				from: "Jamila K.",
				time: "Yesterday, 8:15 PM",
				body: "Got it, looks great! See everyone Thursday for the in-class session.",
			},
		],
	},
	{
		id: "t3",
		subject: "CS 161 — Project 2 Questions",
		participants: ["CS 161 TA", "You"],
		tag: "CS 161",
		unread: 0,
		lastTime: "Mon",
		messages: [
			{
				id: "m1",
				from: "You",
				time: "Mon, 1:00 PM",
				body: "Hi — quick question about Project 2: does the BST implementation need to support duplicate keys, or should we reject them?",
				isMe: true,
			},
			{
				id: "m2",
				from: "CS 161 TA",
				time: "Mon, 3:45 PM",
				body: "Great question! For this project, duplicates should be rejected — just return false from insert() if the key already exists. The spec will be clarified in the next update.",
			},
			{
				id: "m3",
				from: "You",
				time: "Mon, 4:00 PM",
				body: "Perfect, thanks! That's what I assumed but wanted to confirm.",
				isMe: true,
			},
		],
	},
	{
		id: "t4",
		subject: "Fall 2025 Registration Planning",
		participants: ["Academic Advisor", "You"],
		tag: "Admin",
		unread: 0,
		lastTime: "Jul 12",
		messages: [
			{
				id: "m1",
				from: "Academic Advisor",
				time: "Jul 10",
				body: "Hi — I wanted to reach out ahead of Fall registration. Based on your current progress, I recommend MTH 352, CS 261, and WRIT 210 for next semester. Let me know if you'd like to meet.",
			},
			{
				id: "m2",
				from: "You",
				time: "Jul 11",
				body: "Thanks for the recommendations! Could we schedule a 30-minute meeting during the week of July 21?",
				isMe: true,
			},
			{
				id: "m3",
				from: "Academic Advisor",
				time: "Jul 12",
				body: "Absolutely — I have Thursday July 24 at 2:00 PM open. Does that work for you?",
			},
		],
	},
];

/* -------------------------------------------------------------------------- */
/*  Thread list item                                                           */
/* -------------------------------------------------------------------------- */

function ThreadRow({
	thread,
	selected,
	onSelect,
}: {
	thread: Thread;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"w-full text-left px-4 py-3 transition-colors border-b border-border last:border-0 flex items-center gap-3",
				selected ? "bg-muted" : "hover:bg-muted/60"
			)}
		>
			<MessageSquareIcon className="size-4 shrink-0 text-muted-foreground" />
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<p className={cn("truncate text-sm", thread.unread > 0 ? "font-semibold" : "font-normal")}>
						{thread.subject}
					</p>
					<span className="shrink-0 text-xs text-muted-foreground">{thread.lastTime}</span>
				</div>
				<p className="truncate text-xs text-muted-foreground">
					{thread.participants.slice(0, 3).join(", ")}
				</p>
				<div className="mt-1 flex items-center gap-2">
					{thread.tag && (
						<Badge variant="outline" className="text-[10px] font-normal py-0 px-1.5">
							{thread.tag}
						</Badge>
					)}
					{thread.unread > 0 && (
						<Badge className="text-[10px] font-normal py-0 px-1.5">
							{thread.unread} new
						</Badge>
					)}
				</div>
			</div>
			<ChevronRightIcon className="size-4 shrink-0 text-muted-foreground opacity-50" />
		</button>
	);
}

/* -------------------------------------------------------------------------- */
/*  Thread reader                                                              */
/* -------------------------------------------------------------------------- */

function ThreadReader({ thread }: { thread: Thread }) {
	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Header */}
			<div className="px-6 py-4 border-b border-border">
				<h2 className="text-base font-semibold">{thread.subject}</h2>
				<p className="text-xs text-muted-foreground mt-0.5">
					{thread.participants.join(" · ")}
				</p>
			</div>

			{/* Messages */}
			<div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-4 space-y-4">
				{thread.messages.map((msg) => (
					<div
						key={msg.id}
						className={cn(
							"flex",
							msg.isMe ? "justify-end" : "justify-start"
						)}
					>
						<div
							className={cn(
								"max-w-[70%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
								msg.isMe
									? "bg-primary text-primary-foreground rounded-br-sm"
									: "bg-muted text-foreground rounded-bl-sm"
							)}
						>
							{!msg.isMe && (
								<p className="text-xs font-medium mb-1 opacity-70">{msg.from}</p>
							)}
							<p className="whitespace-pre-wrap">{msg.body}</p>
							<p
								className={cn(
									"mt-1 text-[10px] text-right",
									msg.isMe ? "text-primary-foreground/60" : "text-muted-foreground"
								)}
							>
								{msg.time}
							</p>
						</div>
					</div>
				))}
			</div>

			{/* Reply bar */}
			<div className="border-t border-border px-6 py-3">
				<Button size="sm" className="gap-1.5">
					<ReplyIcon className="size-3.5" />
					Reply to Thread
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
			<MessageSquareIcon className="size-10 opacity-30" />
			<p className="text-sm">Select a thread to view the conversation</p>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export function ThreadsPage() {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selected = THREADS.find((t) => t.id === selectedId) ?? null;

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			{/* Page heading */}
			<div>
				<h1 className="text-xl font-semibold">Threads</h1>
				<p className="text-sm text-muted-foreground">
					A central hub to organize email conversations into logical threads,
					keeping project communications separate from course announcements.
				</p>
			</div>

			{/* Two-pane layout */}
			<div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
				{/* Thread list */}
				<div className="scrollbar-thin w-full max-w-xs shrink-0 overflow-y-auto border-r border-border">
					{/* Toolbar */}
					<div className="sticky top-0 z-10 flex items-center gap-2 bg-background px-4 py-3 border-b border-border">
						<MessageSquareIcon className="size-4 text-muted-foreground" />
						<span className="text-sm font-medium">All Threads</span>
						<Badge variant="secondary" className="font-normal text-xs">
							{THREADS.reduce((n, t) => n + t.unread, 0)}
						</Badge>
					</div>
					{THREADS.map((thread) => (
						<ThreadRow
							key={thread.id}
							thread={thread}
							selected={thread.id === selectedId}
							onSelect={() => setSelectedId(thread.id)}
						/>
					))}
				</div>

				<Separator orientation="vertical" className="hidden md:block" />

				{/* Thread reader */}
				<div className="hidden min-h-0 flex-1 flex-col md:flex">
					{selected ? <ThreadReader thread={selected} /> : <EmptyState />}
				</div>
			</div>
		</div>
	);
}
