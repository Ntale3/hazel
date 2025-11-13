import { useAtomSet } from "@effect-atom/atom-react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router"
import { Exit } from "effect"
import { useEffect, useState } from "react"
import { createOrganizationMutation } from "~/atoms/organization-atoms"
import { organizationCollection, organizationMemberCollection } from "~/db/collections"
import { useAuth } from "~/lib/auth"

export const Route = createFileRoute("/_app/onboarding/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { user } = useAuth()
	const navigate = useNavigate()
	const createOrganization = useAtomSet(createOrganizationMutation, { mode: "promiseExit" })
	const [isCreatingOrg, setIsCreatingOrg] = useState(false)

	const { data: userOrganizations } = useLiveQuery(
		(q) =>
			q
				.from({ member: organizationMemberCollection })
				.innerJoin({ org: organizationCollection }, ({ member, org }) =>
					eq(member.organizationId, org.id),
				)
				.where(({ member }) => eq(member.userId, user?.id || ""))
				.orderBy(({ member }) => member.createdAt, "asc"),
		[user?.id],
	)

	// Auto-create organization for new users
	useEffect(() => {
		if (userOrganizations && userOrganizations.length === 0 && !isCreatingOrg && user) {
			setIsCreatingOrg(true)

			createOrganization({
				payload: {
					name: `${user.firstName}'s Workspace`,
					slug: null,
					logoUrl: null,
					settings: null,
				},
			})
				.then((result) => {
					if (Exit.isSuccess(result)) {
						const orgId = result.value.data.id
						navigate({
							to: "/onboarding/setup-organization",
							search: { orgId },
						})
					} else {
						console.error("Failed to create organization:", result)
						setIsCreatingOrg(false)
					}
				})
				.catch((error: any) => {
					console.error("Failed to create organization:", error)
					setIsCreatingOrg(false)
				})
		}
	}, [userOrganizations, isCreatingOrg, user, createOrganization, navigate])

	if (userOrganizations && userOrganizations.length > 0) {
		const firstOrg = userOrganizations[0]!

		// If organization doesn't have a slug, redirect to setup
		if (!firstOrg.org.slug) {
			return <Navigate to="/onboarding/setup-organization" search={{ orgId: firstOrg.org.id }} />
		}

		return <Navigate to="/$orgSlug" params={{ orgSlug: firstOrg.org.slug }} />
	}

	// Show loading state while creating organization
	return (
		<div className="flex h-dvh items-center justify-center">
			<div className="flex flex-col items-center space-y-4">
				<div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				<p className="font-medium text-lg">Setting up your account...</p>
			</div>
		</div>
	)
}
