import { Splitter } from "@ark-ui/solid"
import { createFileRoute } from "@tanstack/solid-router"
import { Sidebar } from "../components/sidebar"

export const Route = createFileRoute("/")({
	component: App,
})

function App() {
	return (
		<main class="flex w-full">
			<Splitter.Root panels={[{ id: "a", minSize: 15, maxSize: 20 }, { id: "b" }]}>
				<Splitter.Panel id="a">
					<Sidebar />
				</Splitter.Panel>
				<Splitter.ResizeTrigger class="h-12 w-1 bg-primary" id="a:b" aria-label="Resize" />
				<Splitter.Panel id="b">Main Panel</Splitter.Panel>
			</Splitter.Root>
		</main>
	)
}
