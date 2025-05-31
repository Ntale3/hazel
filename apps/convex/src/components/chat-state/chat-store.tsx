import type { Id } from "convex-hazel/_generated/dataModel"
import { type JSX, Show, createContext, createEffect, createMemo, splitProps, useContext } from "solid-js"
import { createStore } from "solid-js/store"

interface ChatStore extends InputChatStore {
	replyToMessageId: Id<"messages"> | null
	openThreadId: Id<"channels"> | null
	imageDialog: {
		open: boolean
		messageId: Id<"messages"> | null
		selectedImage: string | null
	}
	onlineUserIds: string[]
	typingUserIds: string[]
}

interface InputChatStore {
	serverId: Id<"servers">
	channelId: Id<"channels">
}

const createChatStore = (props: InputChatStore) => {
	const [state, setState] = createStore<ChatStore>({
		replyToMessageId: null,
		openThreadId: null,
		imageDialog: {
			open: false,
			messageId: null,
			selectedImage: null,
		},
		onlineUserIds: [],
		typingUserIds: [],
		...props,
	})

	return {
		state,
		setState,
	}
}

export const ChatContext = createContext<ReturnType<typeof createChatStore> | undefined>()

export const ChatProvider = (props: { children: JSX.Element } & InputChatStore) => {
	const [childProps, restProps] = splitProps(props, ["children"])

	const params = createMemo(() => ({
		serverId: props.serverId,
		channelId: props.channelId,
	}))

	return (
		<Show when={params()} keyed>
			{(params) => {
				const chatStore$ = createChatStore({
					...restProps,
					channelId: params.channelId,
					serverId: params.serverId,
				})

				return <ChatContext.Provider value={chatStore$}>{childProps.children}</ChatContext.Provider>
			}}
		</Show>
	)
}

export const useChat = () => {
	const context = useContext(ChatContext)

	if (!context) {
		throw new Error("useChat must be used within a ChatProvider")
	}

	return context
}
