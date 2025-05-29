import { Outlet, createRootRouteWithContext } from "@tanstack/solid-router"

import type { useAuth } from "clerk-solidjs"
import type { ConvexSolidClient } from "~/lib/convex"

interface RootContext {
	auth: ReturnType<typeof useAuth>
	convex: ConvexSolidClient
}

const errorCount = 0

export const Route = createRootRouteWithContext<RootContext>()({
	component: RootComponent,
	// errorComponent: (props) => {
	// 	errorCount++

	// 	props.reset()
	// 	return <></>
	// },
})

function RootComponent() {
	return <Outlet />
}
