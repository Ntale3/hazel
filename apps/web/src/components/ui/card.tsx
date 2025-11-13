import type { HTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = ({ className, ...props }: CardHeaderProps) => {
	return <div className={twMerge("flex flex-col space-y-1.5", className)} {...props} />
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = ({ className, ...props }: CardTitleProps) => {
	return (
		<h2
			className={twMerge("text-2xl font-semibold leading-none tracking-tight", className)}
			{...props}
		/>
	)
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = ({ className, ...props }: CardDescriptionProps) => {
	return <p className={twMerge("text-sm text-muted-fg", className)} {...props} />
}

export { CardHeader, CardTitle, CardDescription }
