import { createFileRoute } from "@tanstack/react-router"
import { SectionHeader } from "~/components/application/section-headers/section-headers"
import { Form } from "~/components/base/form/form"

import "@radix-ui/themes/styles.css"
import "@workos-inc/widgets/styles.css"

import { useAuth } from "@workos-inc/authkit-react"
import {
	OrganizationSwitcher,
	UserProfile,
	UserSecurity,
	UserSessions,
	UsersManagement,
	WorkOsWidgets,
} from "@workos-inc/widgets"

export const Route = createFileRoute("/app/settings/team")({
	component: RouteComponent,
})

function RouteComponent() {
	const { isLoading, user, getAccessToken, switchToOrganization } = useAuth()

	return (
		<Form
			className="flex flex-col gap-6 px-4 lg:px-8"
			onSubmit={(e) => {
				e.preventDefault()
				const data = Object.fromEntries(new FormData(e.currentTarget))
				console.log("Form data:", data)
			}}
		>
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Team</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Manage your team members and invite new ones.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<div className="flex flex-col gap-5">
				<WorkOsWidgets
					theme={{
						appearance: "dark",
						accentColor: "green",
						radius: "medium",
						fontFamily: "Inter",
					}}
				>
					<OrganizationSwitcher
						authToken={getAccessToken}
						switchToOrganization={switchToOrganization}
					>
						{/* <CreateOrganization /> */}
					</OrganizationSwitcher>
					<UserProfile authToken={getAccessToken} />

					<UsersManagement authToken={getAccessToken} />
					<UserSessions authToken={getAccessToken} />
					<UserSecurity authToken={getAccessToken} />
				</WorkOsWidgets>
			</div>
		</Form>
	)
}
