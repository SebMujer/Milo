import { useCallback, useRef } from "react";
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	addEdge,
	useEdgesState,
	useNodesState,
	type Connection,
	type Node,
	type NodeTypes,
	type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/* -------------------------------------------------------------------------- */
/*  Note Node                                                                  */
/* -------------------------------------------------------------------------- */

interface NoteNodeData {
	label: string;
}

function NoteNode({ data }: { data: NoteNodeData }) {
	return (
		<div
			className="min-w-[160px] max-w-[260px] rounded-lg border border-border bg-card px-4 py-3 shadow-md"
			style={{ backdropFilter: "blur(4px)" }}
		>
			<p className="text-sm font-medium text-card-foreground leading-snug whitespace-pre-wrap break-words">
				{data.label}
			</p>
		</div>
	);
}

const NODE_TYPES: NodeTypes = { note: NoteNode };

/* -------------------------------------------------------------------------- */
/*  Seed nodes                                                                 */
/* -------------------------------------------------------------------------- */

const INITIAL_NODES: Node<NoteNodeData>[] = [
	{
		id: "1",
		type: "note",
		position: { x: 80, y: 80 },
		data: { label: "Welcome to Milo Whiteboard\n\nDrag me anywhere." },
	},
	{
		id: "2",
		type: "note",
		position: { x: 360, y: 200 },
		data: { label: "Click '+ Add Note' to create new notes." },
	},
];

let nodeIdCounter = INITIAL_NODES.length + 1;
function nextId() {
	return String(++nodeIdCounter);
}

/* -------------------------------------------------------------------------- */
/*  Whiteboard page                                                            */
/* -------------------------------------------------------------------------- */

export function Whiteboard() {
	const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const rfInstance = useRef<ReactFlowInstance | null>(null);

	const onConnect = useCallback(
		(connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
		[setEdges]
	);

	/** Add a new Note node near the centre of the current viewport. */
	function addNote() {
		const viewport = rfInstance.current?.getViewport() ?? { x: 0, y: 0, zoom: 1 };
		// Project the canvas centre (approx) into flow coords
		const x = (-viewport.x + window.innerWidth / 2) / viewport.zoom - 80;
		const y = (-viewport.y + window.innerHeight / 2) / viewport.zoom - 40;

		const newNode: Node<NoteNodeData> = {
			id: nextId(),
			type: "note",
			position: { x, y },
			data: { label: "New note" },
		};
		setNodes((nds) => [...nds, newNode]);
	}

	/** Right-click on the canvas pane → add note at cursor position. */
	const onPaneContextMenu = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			if (!rfInstance.current) return;
			const pos = rfInstance.current.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});
			const newNode: Node<NoteNodeData> = {
				id: nextId(),
				type: "note",
				position: pos,
				data: { label: "New note" },
			};
			setNodes((nds) => [...nds, newNode]);
		},
		[setNodes]
	);

	return (
		<div
			className="absolute inset-0 top-14 overflow-hidden"
			style={{ isolation: "isolate" }}
		>
			{/* Toolbar */}
			<div className="absolute top-3 left-3 z-10">
				<Button size="sm" onClick={addNote} className="gap-1.5 shadow-md">
					<PlusIcon className="size-3.5" />
					Add Note
				</Button>
			</div>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={NODE_TYPES}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onPaneContextMenu={onPaneContextMenu}
				onInit={(instance) => {
					rfInstance.current = instance;
				}}
				fitView
				fitViewOptions={{ padding: 0.3 }}
				className="bg-background"
				deleteKeyCode="Delete"
			>
				{/* Dotted grid — adapts to dark theme via CSS vars */}
				<Background
					variant={BackgroundVariant.Dots}
					gap={20}
					size={1.5}
					color="var(--color-border, oklch(0.4 0 0 / 60%))"
				/>
				<Controls
					className="!border-border !bg-card !shadow-md [&>button]:!border-border [&>button]:!bg-card [&>button]:!text-foreground [&>button:hover]:!bg-muted"
				/>
				<MiniMap
					className="!border-border !bg-card !shadow-md"
					nodeColor="var(--color-muted-foreground, #888)"
					maskColor="var(--color-background, oklch(0.145 0 0 / 70%))"
				/>
			</ReactFlow>
		</div>
	);
}
