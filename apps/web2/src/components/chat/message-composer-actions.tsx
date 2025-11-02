import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/20/solid"
import { ItalicSquare } from "@untitledui/icons"
import { forwardRef, useRef } from "react"
import { Button } from "~/components/ui/button"
import IconEmoji1 from "~/components/icons/icon-emoji-1"
import { useEmojiStats } from "~/hooks/use-emoji-stats"
import { useFileUpload } from "~/hooks/use-file-upload"
import { useOrganization } from "~/hooks/use-organization"
import { useChat } from "~/providers/chat-provider"
import { EmojiPicker } from "~/components/emoji-picker"

export interface MessageComposerActionsRef {
	cleanup: () => void
}

interface MessageComposerActionsProps {
	onSubmit?: () => Promise<void>
	onEmojiSelect?: (emoji: string) => void
}

export const MessageComposerActions = forwardRef<MessageComposerActionsRef, MessageComposerActionsProps>(
	({ onSubmit, onEmojiSelect }, _ref) => {
		const { organizationId } = useOrganization()
		const fileInputRef = useRef<HTMLInputElement>(null)
		const { trackEmojiUsage } = useEmojiStats()

		const {
			channelId,
			addAttachment,
			isUploading,
			setIsUploading,
			addUploadingFile,
			removeUploadingFile,
		} = useChat()

		const { uploadFile } = useFileUpload({
			organizationId: organizationId!,
			channelId,
		})

		const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files
			if (files && files.length > 0) {
				setIsUploading(true)
				// Upload files sequentially
				for (const file of Array.from(files)) {
					// Generate unique file ID for tracking
					const fileId = crypto.randomUUID()

					// Add to uploading files state (shows loading spinner)
					addUploadingFile({
						fileId,
						fileName: file.name,
						fileSize: file.size,
					})

					// Upload the file
					const attachmentId = await uploadFile(file)

					// Remove from uploading files state
					removeUploadingFile(fileId)

					// Add to completed attachments if successful
					if (attachmentId) {
						addAttachment(attachmentId)
					}
				}
				setIsUploading(false)
			}
			// Reset input
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
		}

		const handleEmojiSelect = (unicode: string) => {
			trackEmojiUsage(unicode)
			if (onEmojiSelect) {
				onEmojiSelect(unicode)
			}
		}

		return (
			<>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					className="hidden"
					onChange={handleFileSelect}
					accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
					aria-label="File upload"
				/>

				{/* Bottom action bar */}
				<div className="flex w-full items-center justify-between gap-3 border-border border-t bg-bg px-3 py-2">
					<div className="flex items-center gap-2">
						{/* Shortcuts button */}
						<Button intent="plain" size="xs">
							<ItalicSquare data-slot="icon" />
							<span className="font-semibold">Shortcuts</span>
						</Button>

						{/* Attach button */}
						<Button
							intent="plain"
							size="xs"
							onPress={() => fileInputRef.current?.click()}
							isDisabled={isUploading}
						>
							<PaperClipIcon data-slot="icon" />
							<span className="font-semibold">Attach</span>
						</Button>

						{/* Emoji picker */}
						<EmojiPicker onPick={handleEmojiSelect}>
							<IconEmoji1 data-slot="icon" />
						</EmojiPicker>
					</div>

					<div className="flex items-center gap-2">
						{/* Send button */}
						<Button
							intent="primary"
							size="sm"
							onPress={onSubmit}
							isDisabled={isUploading}
							aria-label="Send message"
						>
							<PaperAirplaneIcon data-slot="icon" />
							<span className="font-semibold">Send</span>
						</Button>
					</div>
				</div>
			</>
		)
	},
)

MessageComposerActions.displayName = "MessageComposerActions"
