import { RouterProvider, createRouter } from "@tanstack/solid-router"
import { render } from "solid-js/web"

import "solid-devtools"

import { routeTree } from "./routeTree.gen"

import "./styles/root.css"
import "./styles/code.css"
import "./styles/toast.css"

import { ClerkProvider, useAuth } from "clerk-solidjs"
import { Toaster } from "./components/ui/toaster"

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultPreloadStaleTime: 0,
	context: {
		auth: undefined!,
	},
})

declare module "@tanstack/solid-router" {
	interface Register {
		router: typeof router
	}
}

const InnerProviders = () => {
	const auth = useAuth()

	return (
		<RouterProvider
			router={router}
			context={{
				auth: auth,
			}}
		/>
	)
}

function App() {
	return (
		<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
			<Toaster />
			<InnerProviders />
		</ClerkProvider>
	)
}

const rootElement = document.getElementById("app")
if (rootElement) {
	render(() => <App />, rootElement)
}
