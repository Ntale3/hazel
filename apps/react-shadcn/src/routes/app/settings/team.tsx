import { createFileRoute } from "@tanstack/react-router"
import { SectionHeader } from "~/components/application/section-headers/section-headers"
import { Form } from "~/components/base/form/form"

import "@radix-ui/themes/styles.css"
import "@workos-inc/widgets/styles.css"

import { Edit01, Plus, Trash01 } from "@untitledui/icons"

import { useState } from "react"
import type { SortDescriptor } from "react-aria-components"
import { PaginationCardDefault } from "~/components/application/pagination/pagination"
import { Table, TableCard } from "~/components/application/table/table"
import { Avatar } from "~/components/base/avatar/avatar"
import type { BadgeColors } from "~/components/base/badges/badge-types"
import { Badge, BadgeWithDot } from "~/components/base/badges/badges"
import { Button } from "~/components/base/buttons/button"
import { ButtonUtility } from "~/components/base/buttons/button-utility"

export const Route = createFileRoute("/app/settings/team")({
	component: RouteComponent,
})

function RouteComponent() {
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "status",
		direction: "ascending",
	})

	const teamMembers = [
		{
			name: "Olivia Rhye",
			email: "olivia@untitledui.com",
			username: "@olivia",
			avatarUrl: "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80",
			status: "Active",
			teams: [
				{ name: "Design", value: "design" },
				{ name: "Product", value: "product" },
			],
		},
		{
			name: "Phoenix Baker",
			email: "phoenix@untitledui.com",
			username: "@phoenix",
			avatarUrl: "https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80",
			status: "Active",
			teams: [
				{ name: "Product", value: "product" },
				{ name: "Software Engineering", value: "software_engineering" },
			],
		},
		{
			name: "Lana Steiner",
			email: "lana@untitledui.com",
			username: "@lana",
			avatarUrl: "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80",
			status: "Offline",
			teams: [
				{ name: "Operations", value: "operations" },
				{ name: "Product", value: "product" },
			],
		},
		{
			name: "Demi Wilkinson",
			email: "demi@untitledui.com",
			username: "@demi",
			avatarUrl: "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80",
			status: "Active",
			teams: [
				{ name: "Design", value: "design" },
				{ name: "Product", value: "product" },
				{ name: "Software Engineering", value: "software_engineering" },
			],
		},
		{
			name: "Candice Wu",
			email: "candice@untitledui.com",
			username: "@candice",
			status: "Offline",
			teams: [
				{ name: "Operations", value: "operations" },
				{ name: "Finance", value: "finance" },
			],
		},
		{
			name: "Natali Craig",
			email: "natali@untitledui.com",
			username: "@natali",
			avatarUrl: "https://www.untitledui.com/images/avatars/natali-craig?fm=webp&q=80",
			status: "Active",
			teams: [
				{ name: "Design", value: "design" },
				{ name: "Finance", value: "finance" },
			],
		},
		{
			name: "Drew Cano",
			email: "drew@untitledui.com",
			username: "@drew",
			avatarUrl: "https://www.untitledui.com/images/avatars/drew-cano?fm=webp&q=80",
			status: "Active",
			teams: [
				{ name: "Customer Success", value: "customer_success" },
				{ name: "Operations", value: "operations" },
				{ name: "Finance", value: "finance" },
			],
		},
		{
			name: "Orlando Diggs",
			email: "orlando@untitledui.com",
			username: "@orlando",
			avatarUrl: "https://www.untitledui.com/images/avatars/orlando-diggs?fm=webp&q=80",
			status: "Active",
			teams: [
				{ name: "Product", value: "product" },
				{ name: "Software Engineering", value: "software_engineering" },
			],
		},
	]

	const teamsToBadgeColorsMap: Record<string, BadgeColors> = {
		design: "brand",
		product: "blue",
		software_engineering: "success",
		operations: "pink",
		finance: "purple",
		customer_success: "indigo",
	}

	const getInitials = (name: string) => {
		const [firstName, lastName] = name.split(" ")
		return `${firstName.charAt(0)}${lastName.charAt(0)}`
	}

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

			<TableCard.Root className="rounded-none bg-transparent shadow-none ring-0 lg:rounded-xl lg:bg-primary lg:shadow-xs lg:ring-1">
				<TableCard.Header
					title="Team members"
					description="Manage your team members and their account permissions here."
					className="pb-5"
					badge={
						<Badge color="gray" type="modern" size="sm">
							48 users
						</Badge>
					}
					contentTrailing={
						<div className="flex gap-3">
							<Button size="md" iconLeading={Plus}>
								Invite user
							</Button>
						</div>
					}
				/>
				<Table
					aria-label="Team members"
					selectionMode="multiple"
					sortDescriptor={sortDescriptor}
					onSortChange={setSortDescriptor}
					className="bg-primary"
				>
					<Table.Header className="bg-primary">
						<Table.Head id="name" isRowHeader label="Name" allowsSorting className="w-full" />
						<Table.Head id="status" label="Status" allowsSorting />
						<Table.Head id="email" label="Email address" allowsSorting />
						<Table.Head id="teams" label="Teams" allowsSorting />
						<Table.Head id="actions" />
					</Table.Header>
					<Table.Body items={teamMembers}>
						{(member) => (
							<Table.Row id={member.email} className="odd:bg-secondary_subtle">
								<Table.Cell>
									<div className="flex w-max items-center gap-3">
										<Avatar
											src={member.avatarUrl}
											initials={getInitials(member.name)}
											alt={member.name}
										/>
										<div>
											<p className="text-sm font-medium text-primary">{member.name}</p>
											<p className="text-sm text-tertiary">{member.username}</p>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<BadgeWithDot
										color={
											member.status === "Active"
												? "success"
												: member.status === "Offline"
													? "gray"
													: "gray"
										}
										size="sm"
										type="modern"
									>
										{member.status}
									</BadgeWithDot>
								</Table.Cell>
								<Table.Cell>{member.email}</Table.Cell>
								<Table.Cell>
									<div className="flex gap-1">
										{member.teams.map((team) => (
											<BadgeWithDot
												key={team.value}
												color={teamsToBadgeColorsMap[team.value]}
												type="modern"
												size="sm"
											>
												{team.name}
											</BadgeWithDot>
										))}
									</div>
								</Table.Cell>

								<Table.Cell className="px-4">
									<div className="flex justify-end gap-0.5">
										<ButtonUtility
											size="xs"
											color="tertiary"
											tooltip="Delete"
											icon={Trash01}
										/>
										<ButtonUtility
											size="xs"
											color="tertiary"
											tooltip="Edit"
											icon={Edit01}
										/>
									</div>
								</Table.Cell>
							</Table.Row>
						)}
					</Table.Body>
				</Table>
				<PaginationCardDefault page={1} total={6} />
			</TableCard.Root>
		</Form>
	)
}
