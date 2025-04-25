import { IconHashtag } from "./icons/hashtag"

export const Sidebar = () => {
	return (
		<ul class="flex flex-col gap-3">
			<ChannelItem />
			<ChannelItem />
			<ChannelItem />
			<ChannelItem />
			<ChannelItem />
			<ChannelItem />
		</ul>
	)
}

export const SidebarItem = () => {
	return <li class="flex flex-col gap-3 hover:bg-mu">WOW</li>
}

export const ChannelItem = () => {
	return (
		<li class="group/sidebar-item flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted">
			<IconHashtag class="size-5 text-muted-fg" />
			<p class="text-muted-fg group-hover/sidebar-item:text-fg">Test Channel</p>
		</li>
	)
}
