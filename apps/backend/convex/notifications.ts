import { Id } from "confect-plus/server"
import { Effect, Option, Schema } from "effect"
import { ConfectMutationCtx } from "./confect"
import { userMutation } from "./middleware/withUserEffect"

export const setNotifcationAsRead = userMutation({
	args: Schema.Struct({
		channelId: Id.Id("channels"),
	}),
	returns: Schema.Null,
	handler: Effect.fn(function* ({ channelId, userData }) {
		const ctx = yield* ConfectMutationCtx

		const channelMember = yield* ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) =>
				q.eq("channelId", channelId).eq("userId", userData.user._id),
			)
			.first()
			.pipe(Effect.map(Option.getOrThrowWith(() => new Error("You are not a member of this channel"))))

		const notifications = yield* ctx.db
			.query("notifications")
			.withIndex("by_accountId_targetedResourceId", (q) =>
				q.eq("accountId", userData.account._id).eq("targetedResourceId", channelId),
			)
			.collect()

		yield* Effect.forEach(
			notifications,
			Effect.fn(function* (notification) {
				yield* ctx.db.delete(notification._id)
			}),
		)

		yield* ctx.db.patch(channelMember._id, { notificationCount: 0, lastSeenMessageId: undefined })

		return null
	}),
})
