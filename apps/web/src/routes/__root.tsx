import { TanStackDevtools } from "@tanstack/react-devtools"
import {
	createRootRouteWithContext,
	type NavigateOptions,
	Outlet,
	type ToOptions,
	useRouter,
} from "@tanstack/react-router"
import { RpcDevtoolsPanel } from "effect-rpc-tanstack-devtools/components"
import { RouterProvider } from "react-aria-components"
import { VersionCheck } from "~/components/version-check"

declare module "react-aria-components" {
	interface RouterConfig {
		href: ToOptions
		routerOptions: Omit<NavigateOptions, keyof ToOptions>
	}
}

export const Route = createRootRouteWithContext<{}>()({
	component: () => {
		const router = useRouter()

		return (
			<RouterProvider
				navigate={(href, opts) => router.navigate({ ...href, ...opts })}
				useHref={(href) => router.buildLocation(href).href}
			>
				{import.meta.env.DEV && (
					<TanStackDevtools
						plugins={[
							{
								name: "Effect RPC",
								render: <RpcDevtoolsPanel />,
							},
						]}
					/>
				)}
				<Outlet />
				{import.meta.env.PROD && <VersionCheck />}
			</RouterProvider>
		)
	},
})
