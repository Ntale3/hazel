import type { ReactNode } from "react"
import { Logo } from "~/components/logo"
import { Link } from "~/components/ui/link"

interface OnboardingLayoutProps {
	children: ReactNode
	currentStep?: number
	totalSteps?: number
}

export function OnboardingLayout({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
	return (
		<main className="relative grid h-dvh grid-cols-1 flex-col items-center justify-center lg:max-w-none lg:grid-cols-2">
			{/* Left panel - branding and visual */}
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
				<div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 bg-center bg-cover bg-no-repeat" />

				<Link
					href="/"
					aria-label="Go to homepage"
					className="relative z-20 flex items-center gap-2"
				>
					<Logo className="size-8 text-white" />
					<strong className="font-semibold">Hazel</strong>
				</Link>

				<div className="relative z-20 mt-auto rounded-xl bg-black/60 p-6 ring ring-white/10 backdrop-blur-sm">
					<blockquote className="space-y-2">
						<p className="text-lg text-white">
							Welcome to your new workspace. Let's get you set up in just a few steps.
						</p>
						<div className="text-sm text-white/80">
							{currentStep && totalSteps ? `Step ${currentStep} of ${totalSteps}` : "Getting started"}
						</div>
					</blockquote>
				</div>
			</div>

			{/* Right panel - content */}
			<div className="flex min-h-dvh items-center justify-center p-4 sm:p-12">
				<div className="w-full max-w-2xl space-y-6">
					{children}
				</div>
			</div>
		</main>
	)
}
