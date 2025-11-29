"use client"

import { Link, useParams } from "@tanstack/react-router"

// Linear logo component
const LinearLogo = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 100 100" fill="currentColor">
		<path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5965C20.0515 94.4522 5.50224 79.8955 1.22541 61.5228ZM15.3697 18.5009L93.4999 96.631c.3176.3176.6316.6287.943.9336-7.1832 7.2164-15.7906 13.0019-25.4143 17.0026L6.38687 51.9247c1.90742-12.065 7.37083-22.9679 15.0028-31.4238ZM84.8246 8.92857c.3176.31757.6287.63166.9336.943L35.0683 60.561c-.5765.5765-1.5419.2934-1.7418-.4803-1.9831-7.6614-5.4382-14.7057-10.0823-20.8282L68.8073.000220537c5.7914 2.10816 11.0714 5.20656 15.0032 9.27554Z" />
	</svg>
)

interface LinearConnectPromptProps {
	url: string
}

export function LinearConnectPrompt({ url }: LinearConnectPromptProps) {
	// Get orgSlug from any route that has it (with strict: false to work from child routes)
	const params = useParams({ strict: false }) as { orgSlug?: string }
	const orgSlug = params.orgSlug

	// Extract issue key for display
	const issueKey = url.match(/\/issue\/([A-Z]+-\d+)/i)?.[1]?.toUpperCase()

	return (
		<div className="mt-2 flex max-w-md items-center gap-3 overflow-hidden rounded-lg border border-[#5E6AD2]/30 border-dashed bg-linear-to-r from-[#5E6AD2]/5 to-transparent p-3 transition-colors hover:border-[#5E6AD2]/50 hover:bg-[#5E6AD2]/5">
			<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#5E6AD2]/10">
				<LinearLogo className="size-5 text-[#5E6AD2]" />
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="font-medium text-fg text-sm">Connect Linear to preview</p>
					{issueKey && (
						<span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-fg">
							{issueKey}
						</span>
					)}
				</div>
				<p className="mt-0.5 text-muted-fg text-xs">
					Link your Linear workspace to see issue details inline
				</p>
			</div>

			{orgSlug && (
				<Link
					to="/$orgSlug/settings/integrations"
					params={{ orgSlug }}
					className="shrink-0 rounded-md bg-[#5E6AD2] px-3 py-1.5 font-medium text-white text-xs shadow-sm transition-all hover:bg-[#4F5BC7] hover:shadow-md active:scale-95"
				>
					Connect
				</Link>
			)}
		</div>
	)
}
