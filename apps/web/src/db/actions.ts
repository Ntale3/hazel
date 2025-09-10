import { AttachmentId, type ChannelId, type OrganizationId, type UserId } from "@hazel/db/schema"
import { createOptimisticAction } from "@tanstack/react-db"
import { v4 as uuid } from "uuid"
import { attachmentCollection } from "./collections"

export const uploadAttachment = createOptimisticAction<{
	organizationId: OrganizationId
	file: File
	channelId: ChannelId
	userId: UserId
}>({
	onMutate: (props) => {
		const attachmentId = AttachmentId.make(uuid())

		attachmentCollection.insert({
			id: attachmentId,
			organizationId: props.organizationId,
			channelId: props.channelId,
			messageId: null,
			fileName: props.file.name,
			fileSize: props.file.size,
			r2Key: "pending",
			uploadedBy: props.userId,
			status: "complete" as const,
			uploadedAt: new Date(),
		})
	},
	mutationFn: async (_text, _params) => {
		throw new Error("Function not implemented.")
	},
})
