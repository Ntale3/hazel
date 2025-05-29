import { v } from "convex/values"
import { userMutation, userQuery } from "./middleware/withUser"

export const getPinnedMessages = userQuery({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateCanViewChannel({ ctx, channelId: args.channelId })

		return await ctx.db
			.query("pinnedMessages")
			.withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
			.collect()
	},
})

export const createPinnedMessage = userMutation({
	args: {
		messageId: v.id("messages"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateIsMemberOfChannel({ ctx, channelId: args.channelId })

		const pinnedMessage = await ctx.db
			.query("pinnedMessages")
			.filter((q) => q.eq(q.field("messageId"), args.messageId))
			.first()
		if (pinnedMessage) throw new Error("Message already pinned")

		return await ctx.db.insert("pinnedMessages", {
			messageId: args.messageId,
			channelId: args.channelId,
		})
	},
})

export const deletePinnedMessage = userMutation({
	args: {
		id: v.id("pinnedMessages"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateCanAccessPinnedMessage({ ctx, pinnedMessageId: args.id })

		return await ctx.db.delete(args.id)
	},
})
