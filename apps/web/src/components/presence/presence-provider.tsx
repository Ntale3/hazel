import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import usePresence from "@convex-dev/presence/react"
import type { ReactNode } from "react"

interface PresenceProviderProps {
	organizationId: Id<"organizations"> | undefined
	userId: Id<"users"> | undefined
	children: ReactNode
}

export function PresenceProvider({ organizationId, userId, children }: PresenceProviderProps) {
	// Use the organization ID as the room ID for presence tracking
	// This ensures all users in the same organization share presence
	usePresence(
		api.presence,
		organizationId ?? ("" as Id<"organizations">),
		userId ?? ("" as Id<"users">),
		10000, // 10 second heartbeat interval
	)

	// The usePresence hook handles all the presence logic internally
	// No need to wrap children in a context provider as the hook manages state globally
	return <>{children}</>
}