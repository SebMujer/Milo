import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
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
	type NodeProps,
	type NodeTypes,
	type ReactFlowInstance,
	type XYPosition,
} from "reactflow";
import "reactflow/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import {
	MaximizeIcon,
	PenIcon,
	PlusIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Types                                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

type NodeType = "note" | "task" | "event";

interface MiloNodeData {
	label: string;
	type: NodeType;
	color: string;       // hex or tailwind token key
	expanded?: boolean;
	body?: string;       // rich body for full-screen view
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Color palette — monotone/muted dark-theme accents                         */
/* ═══════════════════════════════════════════════════════════════════════════ */

const COLORS = [
	{ id: "zinc",    bg: "bg-zinc-800",    hex: "#3f3f46", label: "Zinc"    },
	{ id: "slate",   bg: "bg-slate-700",   hex: "#334155", label: "Slate"   },
	{ id: "stone",   bg: "bg-stone-700",   hex: "#44403c", label: "Stone"   },
	{ id: "neutral", bg: "bg-neutral-700", hex: "#404040", label: "Neutral" },
	{ id: "amber",   bg: "bg-amber-900",   hex: "#451a03", label: "Amber"   },
	{ id: "rose",    bg: "bg-rose-900",    hex: "#4c0519", label: "Rose"    },
] as const;

const TYPE_LABELS: Record<NodeType, string> = {
	note: "Note",
	task: "Task",
	event: "Event",
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Notion-style full-screen overlay                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */

function FullScreenNode({
	data,
	onClose,
	onSave,
}: {
	data: MiloNodeData;
	onClose: () => void;
	onSave: (label: string, body: string) => void;
}) {
	const [label, setLabel] = useState(data.label);
	const [body, setBody] = useState(data.body ?? "");

	function save() {
		onSave(label, body);
		toast.success("Node saved");
		onClose();
	}

	return (
		<motion.div
			className="fixed inset-0 z-[200] flex flex-col bg-background"
			initial={{ opacity: 0, scale: 0.97 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.97 }}
			transition={{ type: "spring", stiffness: 380, damping: 30 }}
		>
			{/* Top bar */}
			<div className="flex items-center justify-between border-b border-border px-6 py-3">
				<div className="flex items-center gap-3">
					<span
						className="size-3 rounded-full"
						style={{ background: data.color }}
					/>
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						{TYPE_LABELS[data.type]}
					</span>
				</div>
				<div className="flex gap-2">
					<Button size="sm" onClick={save}>Save</Button>
					<Button size="sm" variant="ghost" onClick={onClose}>
						<XIcon className="size-4" />
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-6 py-10">
				<input
					className="w-full bg-transparent text-3xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
					placeholder="Untitled"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
				/>
				<textarea
					className="scrollbar-thin min-h-[60vh] w-full resize-none bg-transparent text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
					placeholder="Start writing… (Markdown supported)"
					value={body}
					onChange={(e) => setBody(e.target.value)}
				/>
			</div>
		</motion.div>
	);
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Custom ReactFlow Node                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* Shared state so the node can talk back to the Whiteboard */
interface NodeCallbacks {
	onDelete: (id: string) => void;
	onEdit: (id: string) => void;
	onFullScreen: (id: string) => void;
	onContextMenu: (id: string, event: React.MouseEvent) => void;
}

const nodeCallbacks: NodeCallbacks = {
	onDelete: () => {},
	onEdit: () => {},
	onFullScreen: () => {},
	onContextMenu: () => {},
};

function MiloNode({ id, data }: NodeProps<MiloNodeData>) {
	const [expanded, setExpanded] = useState(false);

	return (
		<>
			<motion.div
				layout
				className={cn(
					"relative min-w-[180px] max-w-[260px] cursor-pointer select-none overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg",
					"transition-shadow hover:shadow-xl"
				)}
				onContextMenu={(e) => {
					e.preventDefault();
					e.stopPropagation();
					nodeCallbacks.onContextMenu(id, e);
				}}
				onClick={() => setExpanded((v) => !v)}
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ type: "spring", stiffness: 420, damping: 26 }}
			>
				{/* Color accent strip */}
				<div
					className="h-1.5 w-full"
					style={{ background: data.color }}
				/>

				{/* Header */}
				<div className="flex items-center justify-between px-3 pt-2.5 pb-1">
					<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						{TYPE_LABELS[data.type]}
					</span>
				</div>

				{/* Label */}
				<div className="px-3 pb-2">
					<p className="text-sm font-medium text-card-foreground leading-snug break-words">
						{data.label}
					</p>
				</div>

				{/* Expanded area */}
				<AnimatePresence initial={false}>
					{expanded && (
						<motion.div
							key="expanded"
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ type: "spring", stiffness: 340, damping: 28 }}
							className="overflow-hidden"
						>
							<div className="border-t border-border/40 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
								{data.body
									? data.body.slice(0, 180) + (data.body.length > 180 ? "…" : "")
									: <span className="italic opacity-50">No content yet.</span>
								}
							</div>
							{/* Actions */}
							<div className="flex items-center gap-1 border-t border-border/40 px-2 py-1.5">
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); nodeCallbacks.onFullScreen(id); }}
									className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
								>
									<MaximizeIcon className="size-3" />
									Full screen
								</button>
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); nodeCallbacks.onEdit(id); }}
									className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
								>
									<PenIcon className="size-3" />
									Rename
								</button>
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); nodeCallbacks.onDelete(id); }}
									className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-auto"
								>
									<Trash2Icon className="size-3" />
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</>
	);
}

const NODE_TYPES: NodeTypes = { milo: MiloNode };

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Creation Popover                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface CreationPopoverProps {
	position: { x: number; y: number }; // screen coords
	onConfirm: (label: string, type: NodeType, color: string) => void;
	onClose: () => void;
}

function CreationPopover({ position, onConfirm, onClose }: CreationPopoverProps) {
	const [label, setLabel] = useState("");
	const [type, setType] = useState<NodeType>("note");
	const [color, setColor] = useState(COLORS[0].hex);
	const ref = useRef<HTMLDivElement>(null);

	/* Click-outside dismiss */
	useEffect(() => {
		function handler(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onClose();
			}
		}
		document.addEventListener("mousedown", handler, true);
		return () => document.removeEventListener("mousedown", handler, true);
	}, [onClose]);

	/* Adjust so popover stays on screen */
	const style: React.CSSProperties = {
		position: "fixed",
		left: Math.min(position.x, window.innerWidth - 300),
		top: Math.min(position.y, window.innerHeight - 280),
	};

	function submit() {
		const name = label.trim() || "Untitled";
		onConfirm(name, type, color);
		onClose();
	}

	return (
		<motion.div
			ref={ref}
			style={style}
			className="z-[100] w-72 rounded-xl border border-border bg-popover p-4 shadow-xl"
			initial={{ opacity: 0, scale: 0.94, y: -6 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.94, y: -4 }}
			transition={{ type: "spring", stiffness: 420, damping: 28 }}
		>
			<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				New Node
			</p>

			{/* Name */}
			<Input
				autoFocus
				placeholder="Node name…"
				value={label}
				onChange={(e) => setLabel(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && submit()}
				className="mb-3 h-8 text-sm"
			/>

			{/* Type picker */}
			<div className="mb-3 flex gap-1" role="group" aria-label="Node type">
				{(["note", "task", "event"] as NodeType[]).map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => setType(t)}
						className={cn(
							"flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors border",
							type === t
								? "border-foreground/40 bg-muted text-foreground"
								: "border-border text-muted-foreground hover:text-foreground"
						)}
					>
						{TYPE_LABELS[t]}
					</button>
				))}
			</div>

			{/* Color picker */}
			<div className="mb-4 flex gap-1.5">
				{COLORS.map((c) => (
					<button
						key={c.id}
						type="button"
						onClick={() => setColor(c.hex)}
						aria-label={c.label}
						className={cn(
							"size-5 rounded-full transition-transform hover:scale-110",
							c.bg,
							color === c.hex && "ring-2 ring-offset-1 ring-foreground/50 ring-offset-popover"
						)}
					/>
				))}
			</div>

			<Button size="sm" className="w-full" onClick={submit}>
				<PlusIcon className="size-3.5 mr-1.5" />
				Create Node
			</Button>
		</motion.div>
	);
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Node Context Popover (right-click on node)                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface NodeContextPopoverProps {
	position: { x: number; y: number };
	nodeId: string;
	nodeData: MiloNodeData;
	onRename: (id: string, label: string) => void;
	onColorChange: (id: string, color: string) => void;
	onDelete: (id: string) => void;
	onClose: () => void;
}

function NodeContextPopover({
	position,
	nodeId,
	nodeData,
	onRename,
	onColorChange,
	onDelete,
	onClose,
}: NodeContextPopoverProps) {
	const [renaming, setRenaming] = useState(false);
	const [newLabel, setNewLabel] = useState(nodeData.label);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handler(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) onClose();
		}
		document.addEventListener("mousedown", handler, true);
		return () => document.removeEventListener("mousedown", handler, true);
	}, [onClose]);

	const style: React.CSSProperties = {
		position: "fixed",
		left: Math.min(position.x, window.innerWidth - 240),
		top: Math.min(position.y, window.innerHeight - 220),
	};

	return (
		<motion.div
			ref={ref}
			style={style}
			className="z-[100] w-56 rounded-xl border border-border bg-popover p-3 shadow-xl"
			initial={{ opacity: 0, scale: 0.94, y: -4 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.94, y: -4 }}
			transition={{ type: "spring", stiffness: 420, damping: 28 }}
		>
			<p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
				Node Actions
			</p>

			{renaming ? (
				<div className="flex gap-1.5">
					<Input
						autoFocus
						value={newLabel}
						onChange={(e) => setNewLabel(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") { onRename(nodeId, newLabel.trim() || nodeData.label); onClose(); }
							if (e.key === "Escape") setRenaming(false);
						}}
						className="h-7 text-xs"
					/>
					<Button
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={() => { onRename(nodeId, newLabel.trim() || nodeData.label); onClose(); }}
					>
						OK
					</Button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setRenaming(true)}
					className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
				>
					<PenIcon className="size-3.5 text-muted-foreground" />
					Rename
				</button>
			)}

			{/* Color row */}
			<div className="mt-2 flex gap-1.5 px-2">
				{COLORS.map((c) => (
					<button
						key={c.id}
						type="button"
						onClick={() => { onColorChange(nodeId, c.hex); onClose(); }}
						aria-label={c.label}
						className={cn(
							"size-5 rounded-full transition-transform hover:scale-110",
							c.bg,
							nodeData.color === c.hex && "ring-2 ring-offset-1 ring-foreground/50 ring-offset-popover"
						)}
					/>
				))}
			</div>

			<div className="mt-2 border-t border-border pt-2">
				<button
					type="button"
					onClick={() => { onDelete(nodeId); onClose(); }}
					className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
				>
					<Trash2Icon className="size-3.5" />
					Delete Node
				</button>
			</div>
		</motion.div>
	);
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Whiteboard Page                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface PopoverState {
	kind: "create";
	screen: { x: number; y: number };
	flow: XYPosition;
}

interface NodeContextState {
	kind: "node";
	screen: { x: number; y: number };
	nodeId: string;
}

let _idCounter = 0;
function nextId() { return `milo-${++_idCounter}`; }

export function Whiteboard() {
	const [nodes, setNodes, onNodesChange] = useNodesState<MiloNodeData>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const rfInstance = useRef<ReactFlowInstance | null>(null);
	const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Popover state
	const [popover, setPopover] = useState<PopoverState | null>(null);
	const [nodeCtx, setNodeCtx] = useState<NodeContextState | null>(null);

	// Full-screen node editor
	const [fullScreenId, setFullScreenId] = useState<string | null>(null);
	const fullScreenNode = nodes.find((n) => n.id === fullScreenId);

	/* ── Wire node callbacks ─────────────────────────────────── */
	nodeCallbacks.onDelete = (id) => {
		setNodes((ns) => ns.filter((n) => n.id !== id));
		toast.success("Node deleted");
	};
	nodeCallbacks.onEdit = (id) => {
		const n = nodes.find((x) => x.id === id);
		if (!n) return;
		setNodeCtx({
			kind: "node",
			screen: { x: window.innerWidth / 2 - 112, y: window.innerHeight / 2 - 110 },
			nodeId: id,
		});
	};
	nodeCallbacks.onFullScreen = (id) => setFullScreenId(id);
	nodeCallbacks.onContextMenu = (id, e) => {
		e.preventDefault();
		setNodeCtx({ kind: "node", screen: { x: e.clientX, y: e.clientY }, nodeId: id });
		setPopover(null);
	};

	/* ── Edge connection ─────────────────────────────────────── */
	const onConnect = useCallback(
		(connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
		[setEdges]
	);

	/* ── Canvas right-click / context menu ───────────────────── */
	const onPaneContextMenu = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			if (!rfInstance.current) return;
			const flow = rfInstance.current.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});
			setNodeCtx(null);
			setPopover({ kind: "create", screen: { x: event.clientX, y: event.clientY }, flow });
		},
		[]
	);

	/* ── Touch long-press ────────────────────────────────────── */
	function onTouchStart(e: React.TouchEvent) {
		const touch = e.touches[0];
		longPressTimer.current = setTimeout(() => {
			if (!rfInstance.current) return;
			const flow = rfInstance.current.screenToFlowPosition({
				x: touch.clientX,
				y: touch.clientY,
			});
			setNodeCtx(null);
			setPopover({ kind: "create", screen: { x: touch.clientX, y: touch.clientY }, flow });
		}, 500);
	}

	function onTouchEnd() {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
	}

	/* ── Node creation ───────────────────────────────────────── */
	function createNode(label: string, type: NodeType, color: string, flowPos?: XYPosition) {
		const pos = flowPos ?? (() => {
			const vp = rfInstance.current?.getViewport() ?? { x: 0, y: 0, zoom: 1 };
			return {
				x: (-vp.x + window.innerWidth / 2) / vp.zoom - 90,
				y: (-vp.y + (window.innerHeight - 56) / 2) / vp.zoom - 40,
			};
		})();

		const newNode: Node<MiloNodeData> = {
			id: nextId(),
			type: "milo",
			position: pos,
			data: { label, type, color, body: "" },
		};
		setNodes((ns) => [...ns, newNode]);
		toast.success(`${TYPE_LABELS[type]} node created`);
	}

	/* ── Toolbar "Add Node" button ───────────────────────────── */
	function openToolbarPopover() {
		const cx = 160;
		const cy = 80;
		const flow = rfInstance.current?.screenToFlowPosition({ x: cx, y: cy }) ??
			{ x: 0, y: 0 };
		setNodeCtx(null);
		setPopover({ kind: "create", screen: { x: cx, y: cy }, flow });
	}

	/* ── Node mutations ─────────────────────────────────────── */
	function renameNode(id: string, label: string) {
		setNodes((ns) =>
			ns.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n)
		);
		toast.info("Node renamed");
	}

	function recolorNode(id: string, color: string) {
		setNodes((ns) =>
			ns.map((n) => n.id === id ? { ...n, data: { ...n.data, color } } : n)
		);
	}

	function saveFullScreen(label: string, body: string) {
		if (!fullScreenId) return;
		setNodes((ns) =>
			ns.map((n) =>
				n.id === fullScreenId ? { ...n, data: { ...n.data, label, body } } : n
			)
		);
	}

	const nodeCtxData = nodeCtx
		? nodes.find((n) => n.id === nodeCtx.nodeId)?.data
		: null;

	return (
		<div
			className="absolute inset-0 top-14 overflow-hidden"
			style={{ isolation: "isolate" }}
			onTouchStart={onTouchStart}
			onTouchEnd={onTouchEnd}
			onTouchMove={onTouchEnd}
		>
			{/* Toolbar */}
			<div className="absolute left-3 top-3 z-10">
				<Button size="sm" onClick={openToolbarPopover} className="gap-1.5 shadow-md">
					<PlusIcon className="size-3.5" />
					Add Node
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
				onInit={(inst) => { rfInstance.current = inst; }}
				fitView={false}
				className="bg-background"
				deleteKeyCode="Delete"
				minZoom={0.2}
				maxZoom={2}
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={24}
					size={1.5}
					color="oklch(0.35 0 0 / 70%)"
				/>
				<Controls
					className="!border-border !bg-card !shadow-md [&>button]:!border-border [&>button]:!bg-card [&>button]:!text-foreground [&>button:hover]:!bg-muted"
				/>
				<MiniMap
					className="!border-border !bg-card !shadow-md"
					nodeColor={(n) => (n.data as MiloNodeData)?.color ?? "#3f3f46"}
					maskColor="oklch(0.145 0 0 / 70%)"
				/>
			</ReactFlow>

			{/* Creation popover */}
			<AnimatePresence>
				{popover?.kind === "create" && (
					<CreationPopover
						position={popover.screen}
						onConfirm={(label, type, color) =>
							createNode(label, type, color, popover.flow)
						}
						onClose={() => setPopover(null)}
					/>
				)}
			</AnimatePresence>

			{/* Node context popover */}
			<AnimatePresence>
				{nodeCtx && nodeCtxData && (
					<NodeContextPopover
						position={nodeCtx.screen}
						nodeId={nodeCtx.nodeId}
						nodeData={nodeCtxData}
						onRename={renameNode}
						onColorChange={recolorNode}
						onDelete={(id) => {
							setNodes((ns) => ns.filter((n) => n.id !== id));
							toast.success("Node deleted");
						}}
						onClose={() => setNodeCtx(null)}
					/>
				)}
			</AnimatePresence>

			{/* Full-screen node editor */}
			<AnimatePresence>
				{fullScreenId && fullScreenNode && (
					<FullScreenNode
						data={fullScreenNode.data}
						onClose={() => setFullScreenId(null)}
						onSave={saveFullScreen}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
