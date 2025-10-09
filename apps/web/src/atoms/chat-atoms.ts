import { Atom } from "@effect-atom/atom-react"
import type { ChannelId, MessageId } from "@hazel/db/schema"
import type { RefObject } from "react"

/**
 * Per-channel reply state using Atom.family
 * Each channel gets its own isolated reply state
 */
export const replyToMessageAtomFamily = Atom.family((_channelId: ChannelId) =>
	Atom.make<MessageId | null>(null).pipe(Atom.keepAlive),
)

/**
 * Global active thread channel ID
 * Threads are app-wide, not per-channel
 */
export const activeThreadChannelIdAtom = Atom.make<ChannelId | null>(null).pipe(Atom.keepAlive)

/**
 * Global active thread message ID
 * Tracks which message the thread is for
 */
export const activeThreadMessageIdAtom = Atom.make<MessageId | null>(null).pipe(Atom.keepAlive)

/**
 * Per-channel scroll container ref
 * Stores the ref to the scroll container for each channel
 */
export const scrollContainerRefAtomFamily = Atom.family((_channelId: ChannelId) =>
	Atom.make<RefObject<HTMLDivElement | null> | null>(null).pipe(Atom.keepAlive),
)

/**
 * Per-channel scroll state tracking
 * Tracks whether the user is currently at the bottom of the scroll container
 */
export const isAtBottomAtomFamily = Atom.family((_channelId: ChannelId) =>
	Atom.make<boolean>(true).pipe(Atom.keepAlive),
)

/**
 * Per-channel message count tracking
 * Used to detect when new messages are added
 */
export const messageCountAtomFamily = Atom.family((_channelId: ChannelId) =>
	Atom.make<number>(0).pipe(Atom.keepAlive),
)
