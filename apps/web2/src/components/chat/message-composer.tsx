import { XMarkIcon } from "@heroicons/react/20/solid"
import { and, eq, inArray, useLiveQuery } from "@tanstack/react-db"
import { FileIcon } from "@untitledui/file-icons"
import { useMemo, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Loader } from "~/components/ui/loader"
import { cn } from "~/lib/utils"
import { attachmentCollection, channelMemberCollection } from "~/db/collections"
import { useTyping } from "~/hooks/use-typing"
import { useAuth } from "~/lib/auth"
import { useChat } from "~/providers/chat-provider"
import { formatFileSize, getFileTypeFromName } from "~/utils/file-utils"
import { MessageComposerActions } from "./message-composer-actions"
import { ReplyIndicator } from "./reply-indicator"

interface MessageComposerProps {
	placeholder?: string
}

export const MessageComposer = ({ placeholder = "Type a message..." }: MessageComposerProps) => {
	const { user } = useAuth()
	const {
		sendMessage,
		replyToMessageId,
		setReplyToMessageId,
		channelId,
		attachmentIds,
		removeAttachment,
		isUploading,
		uploadingFiles,
	} = useChat()

	const [content, setContent] = useState("")
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const { data: channelMembersData } = useLiveQuery(
		(q) =>
			q
				.from({ member: channelMemberCollection })
				.where(({ member }) =>
					and(eq(member.channelId, channelId), eq(member.userId, user?.id || "")),
				)
				.orderBy(({ member }) => member.createdAt, "desc")
				.limit(1),
		[channelId, user?.id],
	)

	const currentChannelMember = useMemo(() => {
		return channelMembersData?.[0] || null
	}, [channelMembersData])

	const { handleContentChange, stopTyping } = useTyping({
		channelId,
		memberId: currentChannelMember?.id || null,
	})

	const { data: attachments } = useLiveQuery(
		(q) =>
			q
				.from({
					attachments: attachmentCollection,
				})
				.where(({ attachments }) => inArray(attachments.id, attachmentIds)),
		[attachmentIds],
	)

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value)
		handleContentChange(e.target.value)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		// Submit on Enter (without Shift)
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSubmit()
		}
	}

	const handleSubmit = async () => {
		if (!content.trim()) return

		sendMessage({
			content: content.trim(),
		})
		stopTyping()

		// Clear textarea
		setContent("")
		if (textareaRef.current) {
			textareaRef.current.value = ""
		}
	}

	const handleEmojiSelect = (emoji: string) => {
		// Insert emoji at cursor position
		const textarea = textareaRef.current
		if (!textarea) return

		const start = textarea.selectionStart
		const end = textarea.selectionEnd
		const newContent = content.slice(0, start) + emoji + content.slice(end)

		setContent(newContent)

		// Set cursor position after emoji
		setTimeout(() => {
			textarea.selectionStart = textarea.selectionEnd = start + emoji.length
			textarea.focus()
		}, 0)
	}


	return (
		<div className="relative flex h-max items-center gap-3">
			<div className="w-full">
				{/* Completed Attachments */}
				{(attachmentIds.length > 0 || uploadingFiles.length > 0) && (
					<div
						className={cn(
							"border border-border border-b-0 bg-secondary px-2 py-1",
							uploadingFiles.length > 0 ? "rounded-t-none border-t-0" : "rounded-t-lg",
							replyToMessageId && "border-b-0",
						)}
					>
						<div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
							{attachmentIds.map((attachmentId) => {
								const attachment = attachments?.find((a) => a?.id === attachmentId)
								const fileName = attachment?.fileName || "File"
								const fileSize = attachment?.fileSize || 0
								const fileType = getFileTypeFromName(fileName)

								return (
									<div
										key={attachmentId}
										className="group flex items-center gap-2 rounded-lg bg-bg p-2 transition-colors hover:bg-secondary"
									>
										<FileIcon
											type={fileType}
											className="size-8 shrink-0 text-muted-fg"
										/>
										<div className="min-w-0 flex-1">
											<div className="truncate font-medium text-fg text-sm">
												{fileName}
											</div>
											<div className="text-muted-fg text-xs">
												{formatFileSize(fileSize)}
											</div>
										</div>
										<Button
											intent="plain"
											size="sq-xs"
											onPress={() => removeAttachment(attachmentId)}
										>
											<XMarkIcon data-slot="icon" />
										</Button>
									</div>
								)
							})}

							{uploadingFiles.map((file: any) => {
								const fileType = getFileTypeFromName(file.fileName)

								return (
									<div
										key={file.fileId}
										className="group flex items-center gap-2 rounded-lg bg-bg p-2 transition-colors hover:bg-secondary"
									>
										<FileIcon
											type={fileType}
											className="size-8 shrink-0 text-muted-fg"
										/>
										<div className="min-w-0 flex-1">
											<div className="truncate font-medium text-fg text-sm">
												{file.fileName}
											</div>
											<div className="text-muted-fg text-xs">
												{formatFileSize(file.fileSize)}
											</div>
										</div>
										<Loader className="size-4" />
									</div>
								)
							})}
						</div>
					</div>
				)}

				{/* Container for reply indicator */}
				{replyToMessageId && (
					<ReplyIndicator
						className={
							uploadingFiles.length > 0 || attachmentIds.length > 0
								? "rounded-t-none border-t-0"
								: ""
						}
						replyToMessageId={replyToMessageId}
						onClose={() => setReplyToMessageId(null)}
					/>
				)}

				{/* Textarea Container */}
				<div
					className={cn(
						"overflow-hidden rounded-lg border border-border bg-bg shadow-sm",
						(replyToMessageId || attachmentIds.length > 0 || uploadingFiles.length > 0) &&
							"rounded-t-none border-t-0",
					)}
				>
					<textarea
						ref={textareaRef}
						placeholder={placeholder}
						value={content}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						disabled={isUploading}
						className="min-h-[80px] w-full resize-none border-0 bg-transparent px-3 py-2 text-fg outline-none focus:ring-0"
						aria-label="Message input"
					/>

					<MessageComposerActions onEmojiSelect={handleEmojiSelect} onSubmit={handleSubmit} />
				</div>
			</div>
		</div>
	)
}
