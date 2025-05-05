export function ChatImage(props: { src: string; alt: string; onClick: () => void }) {
	return (
		<img
			src={props.src}
			onclick={props.onClick}
			class="block size-full max-w-full object-cover"
			alt={props.alt}
			loading="lazy"
		/>
	)
}
