"use client"

/**
 * Threads — Hierarchical File Tree Manager
 *
 * Organises Whiteboard Nodes and tasks into nested folders.
 * Built on Radix Accordion with fluid height animations.
 */

import React, {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import {
	FileIcon,
	FolderIcon,
	FolderOpenIcon,
	ChevronRightIcon,
	StickyNoteIcon,
	CheckSquareIcon,
	CalendarIcon,
	FolderPlusIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Types                                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

type TreeViewElement = {
	id: string
	name: string
	isSelectable?: boolean
	kind?: "folder" | "note" | "task" | "event"
	color?: string
	children?: TreeViewElement[]
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Tree Context                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

type TreeContextProps = {
	selectedId: string | undefined
	expandedItems: string[] | undefined
	indicator: boolean
	handleExpand: (id: string) => void
	selectItem: (id: string) => void
	setExpandedItems?: React.Dispatch<React.SetStateAction<string[] | undefined>>
	openIcon?: React.ReactNode
	closeIcon?: React.ReactNode
	direction: "rtl" | "ltr"
}

const TreeContext = createContext<TreeContextProps | null>(null)

const useTree = () => {
	const context = useContext(TreeContext)
	if (!context) throw new Error("useTree must be used within a TreeProvider")
	return context
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Tree root                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

type TreeViewProps = {
	initialSelectedId?: string
	indicator?: boolean
	elements?: TreeViewElement[]
	initialExpandedItems?: string[]
	openIcon?: React.ReactNode
	closeIcon?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

const Tree = forwardRef<HTMLDivElement, TreeViewProps>(
	(
		{
			className,
			elements,
			initialSelectedId,
			initialExpandedItems,
			children,
			indicator = true,
			openIcon,
			closeIcon,
			dir,
			...props
		},
		_ref,  // ref intentionally unused — ScrollArea doesn't forward refs
	) => {
		const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId)
		const [expandedItems, setExpandedItems] = useState<string[] | undefined>(initialExpandedItems)

		const selectItem = useCallback((id: string) => setSelectedId(id), [])

		const handleExpand = useCallback((id: string) => {
			setExpandedItems((prev) => {
				if (prev?.includes(id)) return prev.filter((item) => item !== id)
				return [...(prev ?? []), id]
			})
		}, [])

		const expandSpecificTargetedElements = useCallback(
			(elements?: TreeViewElement[], selectId?: string) => {
				if (!elements || !selectId) return
				const findParent = (el: TreeViewElement, path: string[] = []) => {
					const newPath = [...path, el.id]
					if (el.id === selectId) {
						setExpandedItems((prev) => [...(prev ?? []), ...newPath])
						return
					}
					el.children?.forEach((child) => findParent(child, newPath))
				}
				elements.forEach((el) => findParent(el))
			},
			[],
		)

		useEffect(() => {
			if (initialSelectedId) expandSpecificTargetedElements(elements, initialSelectedId)
		}, [initialSelectedId, elements, expandSpecificTargetedElements])

		return (
			<TreeContext.Provider
				value={{
					selectedId,
					expandedItems,
					handleExpand,
					selectItem,
					setExpandedItems,
					indicator,
					openIcon,
					closeIcon,
					direction: dir === "rtl" ? "rtl" : "ltr",
				}}
			>
				<div className={cn("size-full", className)}>
	<ScrollArea className="h-full relative px-2" dir={dir as "rtl" | "ltr" | undefined}>
						<AccordionPrimitive.Root
							{...props}
							type="multiple"
							defaultValue={expandedItems}
							value={expandedItems}
							className="flex flex-col gap-0.5"
							onValueChange={(value) =>
								setExpandedItems((prev) => [...(prev ?? []), value[0]])
							}
							dir={dir as "rtl" | "ltr" | undefined}
						>
							{children}
						</AccordionPrimitive.Root>
					</ScrollArea>
				</div>
			</TreeContext.Provider>
		)
	},
)
Tree.displayName = "Tree"

/* ─── Tree indicator line ─────────────────────────────────────────────────── */

const TreeIndicator = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const { direction } = useTree()
		return (
			<div
				dir={direction}
				ref={ref}
				className={cn(
					"absolute left-1.5 rtl:right-1.5 h-full w-px rounded-md bg-border hover:bg-muted-foreground/40 duration-300",
					className,
				)}
				{...props}
			/>
		)
	},
)
TreeIndicator.displayName = "TreeIndicator"

/* ─── Folder ──────────────────────────────────────────────────────────────── */

type FolderProps = {
	element: string
	value: string
	isSelectable?: boolean
	isSelect?: boolean
} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>

const Folder = forwardRef<HTMLDivElement, FolderProps & React.HTMLAttributes<HTMLDivElement>>(
	({ className, element, value, isSelectable = true, isSelect, children, ...props }, _ref) => {
		const { handleExpand, expandedItems, indicator, setExpandedItems, openIcon, closeIcon } = useTree()
		const isOpen = expandedItems?.includes(value)

		return (
			<AccordionPrimitive.Item {...props} value={value} className="relative overflow-hidden">
				<AccordionPrimitive.Trigger
					className={cn(
						"flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
						isSelect && isSelectable ? "bg-muted" : "",
						isSelectable ? "cursor-pointer hover:bg-muted/60" : "cursor-not-allowed opacity-50",
						className,
					)}
					disabled={!isSelectable}
					onClick={() => handleExpand(value)}
				>
					{isOpen
						? openIcon ?? <FolderOpenIcon className="size-4 text-muted-foreground" />
						: closeIcon ?? <FolderIcon className="size-4 text-muted-foreground" />}
					<span className="font-medium">{element}</span>
					<ChevronRightIcon
						className={cn(
							"ml-auto size-3.5 text-muted-foreground/50 transition-transform duration-200",
							isOpen && "rotate-90",
						)}
					/>
				</AccordionPrimitive.Trigger>

				<AccordionPrimitive.Content
					className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
				>
					{indicator && <TreeIndicator aria-hidden="true" />}
					<AccordionPrimitive.Root
						dir={undefined}
						type="multiple"
						className="ml-5 flex flex-col gap-0.5 py-0.5 rtl:mr-5"
						defaultValue={expandedItems}
						value={expandedItems}
						onValueChange={(value) =>
							setExpandedItems?.((prev) => [...(prev ?? []), value[0]])
						}
					>
						{children}
					</AccordionPrimitive.Root>
				</AccordionPrimitive.Content>
			</AccordionPrimitive.Item>
		)
	},
)
Folder.displayName = "Folder"

/* ─── File ────────────────────────────────────────────────────────────────── */

const File = forwardRef<
	HTMLButtonElement,
	{
		value: string
		isSelectable?: boolean
		isSelect?: boolean
		fileIcon?: React.ReactNode
		color?: string
	} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ value, className, isSelectable = true, isSelect, fileIcon, children, color, ...props }, ref) => {
	const { selectedId, selectItem } = useTree()
	const isSelected = isSelect ?? selectedId === value

	return (
		<AccordionPrimitive.Item value={value} className="relative">
			<AccordionPrimitive.Trigger
				ref={ref}
				{...props}
				disabled={!isSelectable}
				aria-label="File"
				className={cn(
					"flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
					isSelected && isSelectable ? "bg-muted" : "hover:bg-muted/40",
					isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
					className,
				)}
				onClick={() => selectItem(value)}
			>
				{color && (
					<span
						className="size-2 shrink-0 rounded-full"
						style={{ background: color }}
					/>
				)}
				{!color && (fileIcon ?? <FileIcon className="size-4 text-muted-foreground" />)}
				{children}
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Item>
	)
})
File.displayName = "File"

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Dummy tree data                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

const TREE_DATA: TreeViewElement[] = [
	{
		id: "f1",
		name: "BIO 201",
		kind: "folder",
		children: [
			{ id: "f1-1", name: "Unit 3 Lab Outline", kind: "note", color: "#3f3f46" },
			{ id: "f1-2", name: "Exam Study Plan", kind: "task", color: "#451a03" },
			{
				id: "f1-3",
				name: "Lab Sessions",
				kind: "folder",
				children: [
					{ id: "f1-3-1", name: "Lab 4 — Titration", kind: "event", color: "#334155" },
					{ id: "f1-3-2", name: "Lab 5 — PCR", kind: "event", color: "#334155" },
				],
			},
		],
	},
	{
		id: "f2",
		name: "CS 161",
		kind: "folder",
		children: [
			{ id: "f2-1", name: "Binary Trees Reference", kind: "note", color: "#3f3f46" },
			{ id: "f2-2", name: "Project 2 Checklist", kind: "task", color: "#4c0519" },
			{ id: "f2-3", name: "Midterm Review", kind: "note", color: "#3f3f46" },
		],
	},
	{
		id: "f3",
		name: "ENG 102",
		kind: "folder",
		children: [
			{ id: "f3-1", name: "Thesis Outline", kind: "note", color: "#3f3f46" },
			{ id: "f3-2", name: "Peer Review Tracker", kind: "task", color: "#451a03" },
		],
	},
	{
		id: "f4",
		name: "MTH 251",
		kind: "folder",
		children: [
			{ id: "f4-1", name: "Integration Cheat Sheet", kind: "note", color: "#3f3f46" },
			{ id: "f4-2", name: "Quiz 4 Prep", kind: "task", color: "#4c0519" },
		],
	},
	{
		id: "f5",
		name: "Inbox (Unassigned)",
		kind: "folder",
		children: [
			{ id: "f5-1", name: "Welcome note", kind: "note", color: "#3f3f46" },
		],
	},
]

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Node kind → icon                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function NodeIcon({ kind }: { kind?: TreeViewElement["kind"] }) {
	if (kind === "task") return <CheckSquareIcon className="size-4 text-muted-foreground" />
	if (kind === "event") return <CalendarIcon className="size-4 text-muted-foreground" />
	return <StickyNoteIcon className="size-4 text-muted-foreground" />
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Recursive tree renderer                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

function RenderTree({
	elements,
	onSelect,
}: {
	elements: TreeViewElement[]
	onSelect?: (id: string) => void
}) {
	return (
		<>
			{elements.map((el) =>
				el.children ? (
					<Folder key={el.id} element={el.name} value={el.id}>
						<RenderTree elements={el.children} onSelect={onSelect} />
					</Folder>
				) : (
					<File
						key={el.id}
						value={el.id}
						color={el.color}
						fileIcon={<NodeIcon kind={el.kind} />}
						onClick={() => onSelect?.(el.id)}
					>
						<span className="text-sm text-foreground/80">{el.name}</span>
						{el.kind && el.kind !== "folder" && (
							<Badge
								variant="outline"
								className="ml-auto shrink-0 py-0 px-1.5 text-[10px] font-normal capitalize"
							>
								{el.kind}
							</Badge>
						)}
					</File>
				),
			)}
		</>
	)
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Detail panel                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function findElement(elements: TreeViewElement[], id: string): TreeViewElement | null {
	for (const el of elements) {
		if (el.id === id) return el
		if (el.children) {
			const found = findElement(el.children, id)
			if (found) return found
		}
	}
	return null
}

function DetailPanel({ id }: { id: string }) {
	const el = findElement(TREE_DATA, id)
	if (!el) return null

	return (
		<div className="flex flex-1 flex-col p-6 gap-4">
			<div className="flex items-center gap-3">
				{el.color && (
					<span className="size-3 rounded-full shrink-0" style={{ background: el.color }} />
				)}
				<h2 className="text-lg font-semibold">{el.name}</h2>
				{el.kind && el.kind !== "folder" && (
					<Badge variant="outline" className="capitalize text-xs font-normal">
						{el.kind}
					</Badge>
				)}
			</div>
			<p className="text-sm text-muted-foreground">
				{el.kind === "folder"
					? `This folder contains ${el.children?.length ?? 0} item${(el.children?.length ?? 0) !== 1 ? "s" : ""}.`
					: "Open this node in the Whiteboard to edit its full content."}
			</p>
			<Button size="sm" variant="outline" className="w-fit gap-1.5">
				Open in Whiteboard
			</Button>
		</div>
	)
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Page                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

export function ThreadsPage() {
	const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			{/* Heading */}
			<div>
				<h1 className="text-xl font-semibold">Threads</h1>
				<p className="text-sm text-muted-foreground">
					A hierarchical file tree that organises your Whiteboard Nodes and tasks into nested folders — keeping project nodes separate from course materials.
				</p>
			</div>

			{/* Two-pane layout */}
			<div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
				{/* Tree pane */}
				<div className="w-72 shrink-0 border-r border-border flex flex-col">
					{/* Pane header */}
					<div className="flex items-center justify-between border-b border-border px-3 py-2.5">
						<span className="text-sm font-medium">Node Tree</span>
						<Button variant="ghost" size="icon" className="size-7" aria-label="New folder">
							<FolderPlusIcon className="size-4 text-muted-foreground" />
						</Button>
					</div>

					{/* Tree */}
					<div className="flex-1 overflow-hidden py-2">
						<Tree
							initialExpandedItems={["f1", "f2"]}
							initialSelectedId={selectedId}
							elements={TREE_DATA}
							className="text-sm"
						>
							<RenderTree elements={TREE_DATA} onSelect={setSelectedId} />
						</Tree>
					</div>
				</div>

				{/* Detail pane */}
				<div className="flex flex-1 flex-col">
					{selectedId ? (
						<DetailPanel id={selectedId} />
					) : (
						<div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
							<FolderIcon className="size-10 opacity-30" />
							<p className="text-sm">Select a folder or node to view details</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

// Re-export tree primitives for external use
export { CollapseButton, File, Folder, Tree }
export type { TreeViewElement }

// CollapseButton
const CollapseButton = forwardRef<
	HTMLButtonElement,
	{ elements: TreeViewElement[]; expandAll?: boolean } & React.HTMLAttributes<HTMLButtonElement>
>(({ className, elements, expandAll = false, children, ...props }, ref) => {
	const { expandedItems, setExpandedItems } = useTree()

	const expendAllTree = useCallback((elements: TreeViewElement[]) => {
		const expandTree = (el: TreeViewElement) => {
			if (el.children && el.children.length > 0) {
				setExpandedItems?.((prev) => [...(prev ?? []), el.id])
				el.children.forEach(expandTree)
			}
		}
		elements.forEach(expandTree)
	}, [setExpandedItems])

	const closeAll = useCallback(() => setExpandedItems?.([]), [setExpandedItems])

	useEffect(() => {
		if (expandAll) expendAllTree(elements)
	}, [expandAll, elements, expendAllTree])

	return (
		<Button
			variant="ghost"
			className={cn("h-8 w-fit p-1 absolute bottom-1 right-2", className)}
			onClick={expandedItems && expandedItems.length > 0 ? closeAll : () => expendAllTree(elements)}
			ref={ref}
			{...props}
		>
			{children}
			<span className="sr-only">Toggle</span>
		</Button>
	)
})
CollapseButton.displayName = "CollapseButton"
