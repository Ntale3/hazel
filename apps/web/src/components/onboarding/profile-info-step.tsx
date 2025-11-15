import { useState } from "react"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Description, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { TextField } from "~/components/ui/text-field"
import { OnboardingNavigation } from "./onboarding-navigation"

interface ProfileInfoStepProps {
	onBack: () => void
	onContinue: (data: { firstName: string; lastName: string }) => void
	defaultFirstName?: string
	defaultLastName?: string
}

export function ProfileInfoStep({
	onBack,
	onContinue,
	defaultFirstName = "",
	defaultLastName = "",
}: ProfileInfoStepProps) {
	const [firstName, setFirstName] = useState(defaultFirstName)
	const [lastName, setLastName] = useState(defaultLastName)

	const handleContinue = () => {
		onContinue({ firstName: firstName.trim(), lastName: lastName.trim() })
	}

	const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0

	return (
		<div className="space-y-6">
			<CardHeader>
				<CardTitle>Set up your profile</CardTitle>
				<CardDescription>Tell us a bit about yourself to personalize your experience</CardDescription>
			</CardHeader>

			<div className="space-y-4">
				<TextField isRequired>
					<Label>First name</Label>
					<Input
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						placeholder="John"
						autoFocus
					/>
					<Description>Your first name as you'd like it to appear</Description>
				</TextField>

				<TextField isRequired>
					<Label>Last name</Label>
					<Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
					<Description>Your last name as you'd like it to appear</Description>
				</TextField>
			</div>

			<OnboardingNavigation onBack={onBack} onContinue={handleContinue} canContinue={canContinue} />
		</div>
	)
}
