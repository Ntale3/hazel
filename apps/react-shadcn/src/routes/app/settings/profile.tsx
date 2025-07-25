import { useConvexMutation, useConvexQuery } from "@convex-dev/react-query"
import { api } from "@hazel/backend/api"
import { createFileRoute } from "@tanstack/react-router"
import { Mail01 } from "@untitledui/icons"
import { type } from "arktype"
import { useState } from "react"
import { toast } from "sonner"
import { useAppForm } from "~/components/application/modals/new-channel-modal"
import { SectionFooter } from "~/components/application/section-footers/section-footer"
import { SectionHeader } from "~/components/application/section-headers/section-headers"
import { SectionLabel } from "~/components/application/section-headers/section-label"
import { Button } from "~/components/base/buttons/button"
import { Form } from "~/components/base/form/form"
import { InputBase, TextField } from "~/components/base/input/input"
import { Label } from "~/components/base/input/label"

export const Route = createFileRoute("/app/settings/profile")({
	component: ProfileSettings,
})

const profileSchema = type({
	firstName: "string > 2",
	lastName: "string > 2",
})

type ProfileFormData = typeof profileSchema.infer

function ProfileSettings() {
	const currentUser = useConvexQuery(api.me.get)
	const updateProfileMutation = useConvexMutation(api.me.updateProfile)

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({})

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setErrors({})

		const formData = new FormData(e.currentTarget)
		const firstName = formData.get("firstName") as string
		const lastName = formData.get("lastName") as string

		// Validation
		const newErrors: typeof errors = {}
		if (!firstName || firstName.trim().length === 0) {
			newErrors.firstName = "First name is required"
		}
		if (!lastName || lastName.trim().length === 0) {
			newErrors.lastName = "Last name is required"
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		setIsSubmitting(true)
		try {
			await updateProfileMutation({ firstName, lastName })
			toast.success("Profile updated successfully")
		} catch (error) {
			console.error("Error updating profile:", error)
			toast.error("Failed to update profile")
		} finally {
			setIsSubmitting(false)
		}
	}

	const form = useAppForm({
		defaultValues: {
			lastName: currentUser?.lastName || "",
			firstName: currentUser?.firstName || "",
		} as ProfileFormData,
		validators: {
			onChange: profileSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				toast.success("Channel created successfully")
				form.reset()
			} catch {
				toast.error("Failed to create channel")
			}
		},
	})

	return (
		<Form className="flex flex-col gap-6 px-4 lg:px-8" onSubmit={handleSubmit}>
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Profile</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Manage your profile information and preferences.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<div className="flex flex-col gap-5">
				<div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
					<SectionLabel.Root isRequired size="sm" title="Name" className="max-lg:hidden" />

					<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
						<TextField
							isRequired
							name="firstName"
							defaultValue={currentUser?.firstName || ""}
							isInvalid={!!errors.firstName}
						>
							<Label className="lg:hidden">First name</Label>
							<InputBase size="md" />
							{errors.firstName && (
								<div className="text-destructive text-sm">{errors.firstName}</div>
							)}
						</TextField>
						<TextField
							isRequired
							name="lastName"
							defaultValue={currentUser?.lastName || ""}
							isInvalid={!!errors.lastName}
						>
							<Label className="lg:hidden">Last name</Label>
							<InputBase size="md" />
							{errors.lastName && (
								<div className="text-destructive text-sm">{errors.lastName}</div>
							)}
						</TextField>
					</div>
				</div>

				<hr className="h-px w-full border-none bg-border-secondary" />

				<div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
					<SectionLabel.Root size="sm" title="Email address" className="max-lg:hidden" />

					<TextField name="email" type="email" isDisabled defaultValue="user@example.com">
						<Label className="lg:hidden">Email address</Label>
						<InputBase size="md" icon={Mail01} />
					</TextField>
				</div>

				<SectionFooter.Root>
					<SectionFooter.Actions>
						<Button
							type="submit"
							color="primary"
							size="md"
							isLoading={isSubmitting}
							isDisabled={isSubmitting}
						>
							Save
						</Button>
					</SectionFooter.Actions>
				</SectionFooter.Root>
			</div>
		</Form>
	)
}
