import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SunIcon, MoonIcon, KeyIcon, Trash2Icon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Settings Page                                                              */
/* -------------------------------------------------------------------------- */

export function SettingsPage() {
	/* ── Theme ── */
	const [theme, setTheme] = useState<"light" | "dark">(() =>
		document.documentElement.classList.contains("dark") ? "dark" : "light"
	);

	useEffect(() => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [theme]);

	function toggleTheme() {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	}

	/* ── Canvas API Key ── */
	const [apiKey, setApiKey] = useState(() => localStorage.getItem("canvas_api_key") ?? "");
	const [saved, setSaved] = useState(false);

	function saveApiKey() {
		localStorage.setItem("canvas_api_key", apiKey);
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	/* ── Clear Cache ── */
	const [cleared, setCleared] = useState(false);

	function clearCache() {
		localStorage.clear();
		setApiKey("");
		setCleared(true);
		setTimeout(() => setCleared(false), 2000);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div>
				<h1 className="text-xl font-semibold">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your Milo preferences and integrations.
				</p>
			</div>

			{/* Canvas Integration */}
			<Card className="shadow-none dark:ring-0">
				<CardHeader>
					<div className="flex items-center gap-2">
						<KeyIcon className="size-4 text-muted-foreground" />
						<CardTitle className="text-base">Canvas Integration</CardTitle>
					</div>
					<CardDescription>
						Paste your Canvas LMS API key to enable assignment syncing.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Input
						type="password"
						placeholder="Enter your Canvas API key…"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						className="font-mono text-sm"
						autoComplete="off"
					/>
					<Button onClick={saveApiKey} size="sm" disabled={!apiKey}>
						{saved ? "Saved!" : "Save API Key"}
					</Button>
				</CardContent>
			</Card>

			{/* Appearance */}
			<Card className="shadow-none dark:ring-0">
				<CardHeader>
					<div className="flex items-center gap-2">
						{theme === "dark" ? (
							<MoonIcon className="size-4 text-muted-foreground" />
						) : (
							<SunIcon className="size-4 text-muted-foreground" />
						)}
						<CardTitle className="text-base">Appearance</CardTitle>
					</div>
					<CardDescription>Switch between light and dark mode.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						onClick={toggleTheme}
						variant="outline"
						size="sm"
						className="gap-2"
					>
						{theme === "dark" ? (
							<>
								<SunIcon className="size-4" />
								Switch to Light
							</>
						) : (
							<>
								<MoonIcon className="size-4" />
								Switch to Dark
							</>
						)}
					</Button>
				</CardContent>
			</Card>

			{/* Cache */}
			<Card className="shadow-none dark:ring-0">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Trash2Icon className="size-4 text-muted-foreground" />
						<CardTitle className="text-base">Data & Cache</CardTitle>
					</div>
					<CardDescription>
						Clear locally stored data including your API key and cached assignments.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						onClick={clearCache}
						variant="destructive"
						size="sm"
						className="gap-2"
					>
						<Trash2Icon className="size-4" />
						{cleared ? "Cache Cleared!" : "Clear Cache"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
