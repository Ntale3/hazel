import type { Message, schema } from "@maki-chat/zero"
import type { CustomMutatorDefs } from "@rocicorp/zero"
import Ably from "ably"

export const serverMutators = (clientMutators: CustomMutatorDefs<typeof schema>) =>
	({
		...clientMutators,
		messages: {
			...clientMutators.messages,
			insert: async (tx, data: Message) => {
				const ably = new Ably.Rest("NY2l4Q._SC2Cw:4EX9XKKwif-URelo-XiW7AuAqAjy8QzOheHhnjocjkk")

				const postNotifications = async () => {
					const channelMembers = await tx.query.channelMembers.where("channelId", "=", data.channelId!)

					const channels = channelMembers.map((member) => `notifications:${member.userId}`)
					for (const member of channelMembers) {
						await tx.mutate.channelMembers.update({
							channelId: member.channelId,
							userId: member.userId,
							notificationCount: member.notificationCount! + 1,
							lastSeenMessageId: member.lastSeenMessageId ?? data.id,
						})
					}

					await ably.batchPublish({
						channels: channels,
						messages: [
							{
								data: {
									...data,
								},
							},
						],
					})
				}

				global.waitUntil(postNotifications())

				// END ASYNC

				await tx.mutate.messages.insert(data)
			},
		},
	}) as const satisfies CustomMutatorDefs<typeof schema>
