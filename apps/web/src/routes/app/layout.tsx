import { convexQuery } from "@convex-dev/react-query"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router"
import { Authenticated, Unauthenticated } from "convex/react"
import { AppSidebar } from "~/components/app-sidebar/app-sidebar"
import { PresenceProvider } from "~/components/presence/presence-provider"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"

export const Route = createFileRoute("/app")({
	component: RouteComponent,
})

function RouteComponent() {
	// Fetch organization and user data
	const organizationQuery = useQuery(convexQuery(api.me.getOrganization, {}))
	const userQuery = useQuery(convexQuery(api.me.getCurrentUser, {}))

	const organizationId = organizationQuery.data?.directive === "success" ? organizationQuery.data.data._id : undefined
	const userId = userQuery.data?._id

	return (
		<>
			<Authenticated>
				<PresenceProvider organizationId={organizationId} userId={userId}>
					<SidebarProvider>
						<AppSidebar />
						<SidebarInset>
							<Outlet />
						</SidebarInset>
					</SidebarProvider>
				</PresenceProvider>
			</Authenticated>
			<Unauthenticated>
				<Navigate
					to="/auth/login"
					search={{
						returnTo: location.pathname,
					}}
				/>
			</Unauthenticated>
		</>
	)
}
