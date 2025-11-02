"use client"

import { memo } from "react"
import { cn } from "~/lib/utils"

/**
 * Simple markdown-like text renderer
 * TODO: Migrate full PlateJS markdown renderer from web app when needed
 * For now, renders text with basic formatting preserved
 */
export const MarkdownReadonly = memo(({ content, className }: { content: string; className?: string }) => {
	return (
		<div
			className={cn(
				"w-full select-text whitespace-pre-wrap break-words text-fg text-sm",
				"[&_strong]:font-bold",
				className,
			)}
		>
			{content}
		</div>
	)
})
