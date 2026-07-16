import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

/**
 * Whiteboard — infinite canvas powered by tldraw.
 *
 * Positioned absolute to fill the SidebarInset (which is `relative`),
 * sitting below the sticky AppHeader (h-14 = 3.5rem).
 * tldraw manages its own internal panning/zooming so no extra scroll is needed.
 */
export function Whiteboard() {
	return (
		<div
			className="absolute inset-0 top-14 overflow-hidden"
			style={{ isolation: "isolate" }}
		>
			<Tldraw />
		</div>
	);
}
