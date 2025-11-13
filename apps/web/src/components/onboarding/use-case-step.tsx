import {
	AcademicCapIcon,
	BriefcaseIcon,
	CodeBracketIcon,
	CpuChipIcon,
	GlobeAltIcon,
	HeartIcon,
	MegaphoneIcon,
	ShoppingBagIcon,
	UserGroupIcon,
	WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
	ChoiceBox,
	ChoiceBoxDescription,
	ChoiceBoxItem,
	ChoiceBoxLabel,
} from "~/components/ui/choice-box"
import { OnboardingNavigation } from "./onboarding-navigation"

const useCases = [
	{
		id: "software",
		label: "Software Development",
		description: "Build, ship, and collaborate on code",
		icon: CodeBracketIcon,
	},
	{
		id: "business",
		label: "Business & Startups",
		description: "Operations, strategy, and growth",
		icon: BriefcaseIcon,
	},
	{
		id: "marketing",
		label: "Marketing & Sales",
		description: "Campaigns, analytics, and customer engagement",
		icon: MegaphoneIcon,
	},
	{
		id: "design",
		label: "Design & Creative",
		description: "UI/UX, branding, and visual content",
		icon: WrenchScrewdriverIcon,
	},
	{
		id: "ecommerce",
		label: "Ecommerce & Retail",
		description: "Products, inventory, and customer service",
		icon: ShoppingBagIcon,
	},
	{
		id: "education",
		label: "Education & Training",
		description: "Courses, learning, and student collaboration",
		icon: AcademicCapIcon,
	},
	{
		id: "ai",
		label: "AI & Data Science",
		description: "Models, analytics, and research",
		icon: CpuChipIcon,
	},
	{
		id: "nonprofit",
		label: "Non-profit & Community",
		description: "Social impact and volunteer coordination",
		icon: HeartIcon,
	},
	{
		id: "team",
		label: "General Team Collaboration",
		description: "Cross-functional teams and projects",
		icon: UserGroupIcon,
	},
	{
		id: "community",
		label: "Community & Social",
		description: "Forums, groups, and networking",
		icon: GlobeAltIcon,
	},
]

interface UseCaseStepProps {
	onBack: () => void
	onContinue: (useCases: string[]) => void
	defaultSelection?: string[]
}

export function UseCaseStep({ onBack, onContinue, defaultSelection = [] }: UseCaseStepProps) {
	const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelection))

	const handleContinue = () => {
		onContinue(Array.from(selected))
	}

	return (
		<div className="space-y-6">
			<CardHeader>
				<CardTitle>What will you use Hazel for?</CardTitle>
				<CardDescription>
					Select all that apply. This helps us personalize your experience.
				</CardDescription>
			</CardHeader>

			<div>
				<ChoiceBox
					gap={4}
					columns={2}
					selectionMode="multiple"
					layout="grid"
					aria-label="Use cases"
					selectedKeys={selected}
					onSelectionChange={(keys) => setSelected(new Set(keys as Iterable<string>))}
					items={useCases}
				>
					{(item) => {
						const Icon = item.icon
						return (
							<ChoiceBoxItem key={item.id} id={item.id} textValue={item.label}>
								<Icon />
								<ChoiceBoxLabel>{item.label}</ChoiceBoxLabel>
								<ChoiceBoxDescription>{item.description}</ChoiceBoxDescription>
							</ChoiceBoxItem>
						)
					}}
				</ChoiceBox>
			</div>

			<OnboardingNavigation
				onBack={onBack}
				onContinue={handleContinue}
				canContinue={selected.size > 0}
			/>
		</div>
	)
}
