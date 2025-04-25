// src/components/ui/button.tsx

import { type Component, type JSX, splitProps } from "solid-js";
// Keep tailwind-variants
import { type VariantProps, tv } from "tailwind-variants";

const buttonStyles = tv({
	base: [
		"relative isolate inline-flex items-center justify-center gap-x-2 font-medium",
		"outline-0 outline-offset-2 hover:no-underline focus-visible:outline-2",
		"inset-ring inset-ring-fg/20 bg-(--btn-bg) pressed:bg-(--btn-overlay) text-(--btn-fg) shadow-[shadow:inset_0_2px_--theme(--color-white/15%)] hover:bg-(--btn-overlay) dark:inset-ring-fg/15 dark:shadow-none",
		"forced-colors:outline-[Highlight] forced-colors:[--btn-icon:ButtonText] forced-colors:hover:[--btn-icon:ButtonText]",
		"*:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-1 *:data-[slot=icon]:size-4 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:text-current/60 pressed:*:data-[slot=icon]:text-current *:data-[slot=icon]:transition hover:*:data-[slot=icon]:text-current/90",
		"*:data-[slot=avatar]:-mx-0.5 *:data-[slot=avatar]:my-1 *:data-[slot=avatar]:*:size-4 *:data-[slot=avatar]:size-4 *:data-[slot=avatar]:shrink-0",
	],
	variants: {
		intent: {
			primary: [
				"outline-primary [--btn-bg:theme(--color-primary/95%)] [--btn-fg:var(--color-primary-fg)] [--btn-overlay:var(--color-primary)]",
			],
			secondary: [
				"outline-primary [--btn-bg:theme(--color-secondary/90%)] [--btn-fg:var(--color-secondary-fg)] [--btn-overlay:var(--color-secondary)]",
			],
			warning: [
				"outline-warning [--btn-bg:theme(--color-warning/95%)] [--btn-fg:var(--color-warning-fg)] [--btn-overlay:var(--color-warning)]",
			],
			danger: [
				"outline-danger [--btn-bg:theme(--color-danger/95%)] [--btn-fg:var(--color-danger-fg)] [--btn-overlay:var(--color-danger)]",
			],
			outline: [
				"shadow-none outline-primary [--btn-fg:var(--color-fg)] [--btn-overlay:theme(--color-secondary/90%)]",
			],
			plain: [
				"inset-ring-transparent shadow-none outline-primary [--btn-fg:var(--color-fg)] [--btn-overlay:theme(--color-secondary/90%)] dark:inset-ring-transparent",
			],
		},
		size: {
			"extra-small":
				"h-8 px-[calc(var(--spacing)*2.7)] text-xs/4 **:data-[slot=avatar]:*:size-3.5 **:data-[slot=avatar]:size-3.5 **:data-[slot=icon]:size-3 lg:text-[0.800rem]/4",
			small: "h-9 px-3.5 text-sm/5 sm:text-sm/5",
			medium: "h-10 px-4 text-base sm:text-sm/6",
			large:
				"h-11 px-4.5 text-base *:data-[slot=icon]:mx-[-1.5px] sm:*:data-[slot=icon]:size-5 lg:text-base/7",
			"square-petite": "size-9 shrink-0",
		},
		shape: {
			square: "rounded-lg",
			circle: "rounded-full",
		},
		isDisabled: {
			false: "cursor-pointer",
			true: "inset-ring-0 cursor-default opacity-50 forced-colors:text-[GrayText]",
		},
		isPending: {
			true: "cursor-default opacity-50",
		},
	},
	defaultVariants: {
		intent: "primary",
		size: "medium",
		shape: "square",
	},
});

export interface ButtonProps
	extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonStyles> {
	isPending?: boolean;
}

const Button: Component<ButtonProps> = (props) => {
	const [local, rest] = splitProps(props, [
		"class", // User-provided class
		"intent",
		"size",
		"shape",
		"disabled", // Standard disabled prop
		"isPending", // Custom pending prop
		"children",
	]);

	const classes = buttonStyles({
		intent: local.intent,
		size: local.size,
		shape: local.shape,
		isDisabled: local.disabled,
		isPending: local.isPending,
		className: local.class,
	});

	return (
		<button
			class={classes}
			disabled={local.disabled || local.isPending}
			{...rest}
		>
			{local.children}
		</button>
	);
};

export { Button, buttonStyles };
