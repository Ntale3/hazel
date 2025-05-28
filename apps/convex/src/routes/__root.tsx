import { Outlet, createRootRouteWithContext } from "@tanstack/solid-router"

import type { useAuth } from "clerk-solidjs"

interface RootContext {
	auth: ReturnType<typeof useAuth>
}

export const Route = createRootRouteWithContext<RootContext>()({
	component: RootComponent,
})

function RootComponent() {
	return <Outlet />
}
