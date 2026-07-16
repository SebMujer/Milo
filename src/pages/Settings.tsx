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
	KeyIcon,
	DownloadIcon,
	Trash2Icon,
	CheckIcon,
	EyeIcon,
	EyeOffIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Theme helpers                                                              */
/* -------------------------------------------------------------------------- */

type Theme = "dark" | "light" | "system";

/** Read the persisted theme or fall back to "system". */
function getStoredTheme(): Theme {
	return (localStorage.getItem("milo_theme") as Theme) ?? "system";
}

/** Apply the resolved theme class to <html> and persist the preference. */
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

/** Serialise all localStorage keys into a JSON file and trigger download. */
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
/*  Sub-components                                                             */
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

const THEME_OPTIONS: { value: Theme; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
	{ value: "light", label: "Light", Icon: SunIcon },
	{ value: "dark",  label: "Dark",  Icon: MoonIcon },
	{ value: "system", label: "System", Icon: MonitorIcon },
];

function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(getStoredTheme);

	// Re-apply whenever the OS preference changes while "system" is active.
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
/*  Canvas API Key                                                             */
/* -------------------------------------------------------------------------- */

function CanvasApiSection() {
	const [apiKey, setApiKey] = useState(
		() => localStorage.getItem("canvas_api_key") ?? ""
	);
	const [showKey, setShowKey] = useState(false);
	const [status, setStatus] = useState<"idle" | "saved">("idle");

	function save() {
		localStorage.setItem("canvas_api_key", apiKey);
		setStatus("saved");
		setTimeout(() => setStatus("idle"), 2000);
	}

	return (
		<div className="space-y-3">
			<div className="relative">
				<Input
					type={showKey ? "text" : "password"}
					placeholder="Enter your Canvas API key…"
					value={apiKey}
					onChange={(e) => setApiKey(e.target.value)}
					className="pr-10 font-mono text-sm"
					autoComplete="off"
					spellCheck={false}
				/>
				<button
					type="button"
					onClick={() => setShowKey((v) => !v)}
					aria-label={showKey ? "Hide API key" : "Show API key"}
					className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
				>
					{showKey ? (
						<EyeOffIcon className="size-4" />
					) : (
						<EyeIcon className="size-4" />
					)}
				</button>
			</div>
			<p className="text-xs text-muted-foreground">
				Generate a key in Canvas → Account → Settings → Approved Integrations.
			</p>
			<Button
				onClick={save}
				size="sm"
				disabled={!apiKey || status === "saved"}
				className="gap-1.5"
			>
				{status === "saved" ? (
					<>
						<CheckIcon className="size-3.5" />
						Saved
					</>
				) : (
					"Save API Key"
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
				"This will delete all locally stored Milo data including your Canvas API key. Continue?"
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
			{/* Export */}
			<div className="flex flex-col gap-1.5">
				<p className="text-sm font-medium">Export Data</p>
				<p className="text-xs text-muted-foreground">
					Download a JSON snapshot of all locally stored Milo data.
				</p>
				<div className="mt-1">
					<Button
						onClick={handleExport}
						variant="outline"
						size="sm"
						className="gap-1.5"
					>
						<DownloadIcon className="size-3.5" />
						Export Data
					</Button>
				</div>
			</div>

			<Separator />

			{/* Reset */}
			<div className="flex flex-col gap-1.5">
				<p className="text-sm font-medium">Reset All Data</p>
				<p className="text-xs text-muted-foreground">
					Permanently removes all cached assignments, notes, and settings from
					this device. This cannot be undone.
				</p>
				<div className="mt-1">
					<Button
						onClick={handleReset}
						variant="destructive"
						size="sm"
						className="gap-1.5"
					>
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
			{/* Page heading */}
			<div>
				<h1 className="text-xl font-semibold">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your Milo preferences and integrations.
				</p>
			</div>

			{/* Canvas Integration */}
			<Section
				icon={KeyIcon}
				title="Canvas Integration"
				description="Connect your Canvas LMS account to sync assignments and deadlines."
			>
				<CanvasApiSection />
			</Section>

			{/* Appearance */}
			<Section
				icon={SunIcon}
				title="Appearance"
				description="Choose how Milo looks. 'System' follows your OS preference automatically."
			>
				<ThemeToggle />
			</Section>

			{/* Backup & Reset */}
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
