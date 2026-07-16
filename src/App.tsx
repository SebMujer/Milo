import { Routes, Route } from "react-router-dom";
import { add } from "date-fns";
import { AuthPage } from "@/components/auth-page";
import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";
import { FullScreenCalendar } from "@/components/FullScreenCalendar";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { Settings } from "@/pages/Settings";
import { Whiteboard } from "@/pages/Whiteboard";
import { EmailPage } from "@/pages/Email";
import { ThreadsPage } from "@/pages/Threads";
import type { CalendarData } from "@/components/FullScreenCalendar";

function buildCalendarData(): CalendarData[] {
	const today = new Date();
	const mk = (offsetDays: number, name: string, time: string): CalendarData => ({
		day: add(today, { days: offsetDays }),
		events: [
			{
				id: Date.now() + offsetDays,
				name,
				time,
				datetime: add(today, { days: offsetDays }).toISOString(),
			},
		],
	});

	return [
		mk(1, "Biology Exam", "9:00 AM"),
		mk(1, "Project Milestone", "11:59 PM"),
		mk(3, "CS 161 Lecture", "11:00 AM"),
		mk(5, "Essay Draft Due", "11:59 PM"),
		mk(7, "MTH 251 Quiz", "3:30 PM"),
		mk(10, "Group Study", "4:00 PM"),
	];
}

function App() {
	return (
		<Routes>
			<Route path="/" element={<AuthPage />} />
			<Route path="/dashboard" element={<AppShell />}>
				<Route index element={<Dashboard />} />
				<Route
					path="calendar"
					element={<FullScreenCalendar data={buildCalendarData()} />}
				/>
				<Route path="email" element={<EmailPage />} />
				<Route path="threads" element={<ThreadsPage />} />
				<Route path="settings" element={<Settings />} />
				<Route path="whiteboard" element={<Whiteboard />} />
			</Route>
			<Route path="/privacy" element={<PrivacyPolicy />} />
		</Routes>
	);
}

export default App;
