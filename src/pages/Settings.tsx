import { useState, useEffect, useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	SunIcon,
	MoonIcon,
	MonitorIcon,
	MailIcon,
	DownloadIcon,
	Trash2Icon,
	CheckIcon,
	RefreshCwIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Theme helpers                                                              */
/* -------------------------------------------------------------------------- */

type Theme = "dark" | "light" | "system";

function getStoredTheme(): Theme {
	return (localStorage.getItem("milo_theme") as Theme) ?? "system";
}

function applyTheme(theme: Theme) {
	const resolved =
		theme === "system"
			? window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: theme;
	document.documentElement.classList.toggle("dark", resolved === "dark");
	localStorage.setItem("milo_theme", theme);
}

/* -------------------------------------------------------------------------- */
/*  Export helpers                                                             */
/* -------------------------------------------------------------------------- */

function exportData() {
	const snapshot: Record<string, string> = {};
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i)!;
		snapshot[key] = localStorage.getItem(key)!;
	}
	const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `milo-backup-${new Date().toISOString().slice(0, 10)}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------------------- */
/*  Section wrapper                                                            */
/* -------------------------------------------------------------------------- */

interface SectionProps {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
	children: React.ReactNode;
}

function Section({ icon: Icon, title, description, children }: SectionProps) {
	return (
		<Card className="shadow-none dark:ring-0">
			<CardHeader className="pb-3">
				<div className="flex items-center gap-2">
					<Icon className="size-4 text-muted-foreground" />
					<CardTitle className="text-base">{title}</CardTitle>
				</div>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

/* -------------------------------------------------------------------------- */
/*  Theme toggle — 3-way segmented control                                    */
/* -------------------------------------------------------------------------- */

const THEME_OPTIONS: {
	value: Theme;
	label: string;
	Icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ value: "light", label: "Light", Icon: SunIcon },
	{ value: "dark", label: "Dark", Icon: MoonIcon },
	{ value: "system", label: "System", Icon: MonitorIcon },
];

function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(getStoredTheme);

	useEffect(() => {
		applyTheme(theme);
		if (theme !== "system") return;
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => applyTheme("system");
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, [theme]);

	function select(t: Theme) {
		setTheme(t);
		applyTheme(t);
	}

	return (
		<div
			role="radiogroup"
			aria-label="Theme"
			className="inline-flex rounded-lg border p-1 gap-1"
		>
			{THEME_OPTIONS.map(({ value, label, Icon }) => {
				const active = theme === value;
				return (
					<button
						key={value}
						role="radio"
						aria-checked={active}
						onClick={() => select(value)}
						className={cn(
							"inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							active
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<Icon className="size-3.5" />
						{label}
					</button>
				);
			})}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Email Sync Settings                                                        */
/* -------------------------------------------------------------------------- */

const SYNC_OPTIONS = ["Every 5 minutes", "Every 15 minutes", "Every 30 minutes", "Hourly", "Manual only"];

function EmailSyncSection() {
	const [email, setEmail] = useState(
		() => localStorage.getItem("milo_email_address") ?? ""
	);
	const [syncFreq, setSyncFreq] = useState(
		() => localStorage.getItem("milo_sync_frequency") ?? "Every 15 minutes"
	);
	const [status, setStatus] = useState<"idle" | "saved">("idle");

	function save() {
		localStorage.setItem("milo_email_address", email);
		localStorage.setItem("milo_sync_frequency", syncFreq);
		setStatus("saved");
		setTimeout(() => setStatus("idle"), 2000);
	}

	return (
		<div className="space-y-4">
			{/* Primary email */}
			<div className="space-y-1.5">
				<label className="text-sm font-medium" htmlFor="email-address">
					Primary Email Address
				</label>
				<Input
					id="email-address"
					type="email"
					placeholder="you@university.edu"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					autoComplete="email"
					className="max-w-sm"
				/>
				<p className="text-xs text-muted-foreground">
					Milo will display email synced from this address in the Inbox and Threads views.
				</p>
			</div>

			{/* Sync frequency */}
			<div className="space-y-1.5">
				<label className="text-sm font-medium" htmlFor="sync-freq">
					Sync Frequency
				</label>
				<div className="flex flex-wrap gap-2" role="group" aria-label="Sync frequency">
					{SYNC_OPTIONS.map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setSyncFreq(opt)}
							className={cn(
								"inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								syncFreq === opt
									? "border-primary bg-primary/10 text-primary font-medium"
									: "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
							)}
						>
							<RefreshCwIcon className="size-3" />
							{opt}
						</button>
					))}
				</div>
			</div>

			<Button
				onClick={save}
				size="sm"
				disabled={status === "saved"}
				className="gap-1.5"
			>
				{status === "saved" ? (
					<>
						<CheckIcon className="size-3.5" />
						Saved
					</>
				) : (
					"Save Email Settings"
				)}
			</Button>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Data management                                                            */
/* -------------------------------------------------------------------------- */

function DataSection() {
	const [resetStatus, setResetStatus] = useState<"idle" | "done">("idle");

	const handleExport = useCallback(() => {
		exportData();
	}, []);

	function handleReset() {
		if (
			!window.confirm(
				"This will delete all locally stored Milo data including email settings and preferences. Continue?"
			)
		) {
			return;
		}
		localStorage.clear();
		setResetStatus("done");
		setTimeout(() => setResetStatus("idle"), 2500);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-1.5">
				<p className="text-sm font-medium">Export Data</p>
				<p className="text-xs text-muted-foreground">
					Download a JSON snapshot of all locally stored Milo preferences.
				</p>
				<div className="mt-1">
					<Button onClick={handleExport} variant="outline" size="sm" className="gap-1.5">
						<DownloadIcon className="size-3.5" />
						Export Data
					</Button>
				</div>
			</div>

			<Separator />

			<div className="flex flex-col gap-1.5">
				<p className="text-sm font-medium">Reset All Data</p>
				<p className="text-xs text-muted-foreground">
					Permanently removes all cached emails, notes, and settings from this
					device. This cannot be undone.
				</p>
				<div className="mt-1">
					<Button onClick={handleReset} variant="destructive" size="sm" className="gap-1.5">
						<Trash2Icon className="size-3.5" />
						{resetStatus === "done" ? "Data Cleared" : "Reset All Data"}
					</Button>
				</div>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export function Settings() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-6">
			<div>
				<h1 className="text-xl font-semibold">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your Milo preferences and integrations.
				</p>
			</div>

			<Section
				icon={MailIcon}
				title="Email Sync Settings"
				description="Configure which email account Milo syncs from and how often to check for new messages."
			>
				<EmailSyncSection />
			</Section>

			<Section
				icon={SunIcon}
				title="Appearance"
				description="Choose how Milo looks. 'System' follows your OS preference automatically."
			>
				<ThemeToggle />
			</Section>

			<Section
				icon={DownloadIcon}
				title="Backup & Data"
				description="Export a local backup or wipe all stored data from this device."
			>
				<DataSection />
			</Section>
		</div>
	);
}
