import { createFileRoute, redirect } from "@tanstack/solid-router"

export const Route = createFileRoute("/")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const token = await context.auth.getToken()

		if (!token) {
			throw redirect({
				to: "/sign-in",
			})
		}
	},
})

function RouteComponent() {
	return <div>Hello "/"!</div>
}
