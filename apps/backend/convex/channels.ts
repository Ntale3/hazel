import { v } from "convex/values"
import { asyncMap } from "convex-helpers"
import type { Id } from "./_generated/dataModel"
import { organizationServerMutation, organizationServerQuery } from "./middleware/withOrganizationServer"
import { userMutation, userQuery } from "./middleware/withUser"

export const getChannelForOrganization = organizationServerQuery({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")
		if (channel.serverId !== ctx.serverId) throw new Error("Channel not in this server")

		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		// Check if user is member of channel
		const channelMembers = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", channel._id))
			.collect()

		const currentUser = channelMembers.find((member) => member.userId === user._id)

		if (!currentUser && channel.type !== "public") {
			throw new Error("You are not a member of this channel")
		}

		const members = await asyncMap(channelMembers, async (member) => {
			const memberUser = await ctx.db.get(member.userId)

			if (!memberUser) return null

			return {
				...member,
				user: memberUser,
			}
		})

		return {
			...channel,
			members: members.filter((member) => member !== null),
			isMuted: currentUser?.isMuted || false,
			isHidden: currentUser?.isHidden || false,
			isFavorite: currentUser?.isFavorite || false,
			currentUser,
		}
	},
})

export const getChannelsForOrganization = organizationServerQuery({
	args: {
		favoriteFilter: v.optional(v.object({ favorite: v.boolean() })),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		const channels = await ctx.db
			.query("channels")
			.withIndex("by_serverId_and_participantHash", (q) => q.eq("serverId", ctx.serverId))
			.filter((q) => q.neq(q.field("type"), "thread"))
			.collect()

		const channelsWithMembers = await asyncMap(channels, async (channel) => {
			const channelMembers = await ctx.db
				.query("channelMembers")
				.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", channel._id))
				.collect()

			const currentUser = channelMembers.find((member) => member.userId === user._id)

			if (!currentUser) return null

			const members = await asyncMap(channelMembers, async (member) => {
				const memberUser = await ctx.db.get(member.userId)

				if (!memberUser) return null

				return {
					...member,
					user: memberUser,
				}
			})

			return {
				...channel,
				members: members.filter((member) => member !== null),
				isMuted: currentUser?.isMuted || false,
				isHidden: currentUser?.isHidden || false,
				isFavorite: currentUser?.isFavorite || false,
				currentUser,
			}
		})

		const filteredChannels = channelsWithMembers
			.filter((channel) => channel !== null)
			.filter((channel) => {
				if (args.favoriteFilter?.favorite !== undefined) {
					return channel.isFavorite === args.favoriteFilter.favorite
				}
				return true
			})

		const dmChannels = filteredChannels.filter(
			(channel) => channel.type !== "private" && channel.type !== "public",
		)
		const serverChannels = filteredChannels.filter(
			(channel) => channel.type === "private" || channel.type === "public",
		)

		return {
			dmChannels,
			serverChannels,
		}
	},
})

export const getChannels = userQuery({
	args: {
		serverId: v.id("servers"),
		favoriteFilter: v.optional(v.object({ favorite: v.boolean() })),
	},
	handler: async (ctx, args) => {
		const channels = await ctx.db
			.query("channels")
			.withIndex("by_serverId_and_participantHash", (q) => q.eq("serverId", args.serverId))
			.filter((q) => q.neq(q.field("type"), "thread"))
			.collect()

		const channelsWithMembers = await asyncMap(channels, async (channel) => {
			const channelMembers = await ctx.db
				.query("channelMembers")
				.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", channel._id))
				.collect()

			const currentUser = channelMembers.find((member) => member.userId === ctx.user.id)

			if (!currentUser) return null

			const members = await asyncMap(channelMembers, async (member) => {
				const user = await ctx.db.get(member.userId)

				if (!user) return null

				return {
					...member,
					user,
				}
			})

			return {
				...channel,
				members: members.filter((member) => member !== null),
				isMuted: currentUser?.isMuted || false,
				isHidden: currentUser?.isHidden || false,
				isFavorite: currentUser?.isFavorite || false,
				currentUser,
			}
		})

		const filteredChannels = channelsWithMembers
			.filter((channel) => channel !== null)
			.filter((channel) =>
				args.favoriteFilter
					? args.favoriteFilter.favorite
						? channel.currentUser?.isFavorite
						: !channel.currentUser?.isFavorite
					: true,
			)

		const dmChannels = filteredChannels.filter(
			(channel) => channel.type !== "private" && channel.type !== "public",
		)
		const serverChannels = filteredChannels.filter(
			(channel) => channel.type === "private" || channel.type === "public",
		)

		return {
			dmChannels,
			serverChannels,
		}
	},
})

export const getChannel = userQuery({
	args: {
		channelId: v.id("channels"),
		serverId: v.id("servers"),
	},
	handler: async (ctx, args) => {
		const channel = await ctx.db.get(args.channelId)

		if (!channel) throw new Error("Channel not found")

		const channelMembers = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", args.channelId))
			.collect()

		const currentUser = channelMembers.find((member) => member.userId === ctx.user.id)

		if (!currentUser) {
			throw new Error("You are not a member of this channel")
		}

		const members = await asyncMap(channelMembers, async (member) => {
			const user = await ctx.db.get(member.userId)

			if (!user) return null

			return {
				...member,
				user,
			}
		})

		const channelWithMembers = {
			...channel,
			members: members.filter((member) => member !== null),
			isMuted: currentUser?.isMuted || false,
			isHidden: currentUser?.isHidden || false,
			currentUser,
		}

		return channelWithMembers
	},
})

export const getPublicChannels = userQuery({
	args: {
		serverId: v.id("servers"),
	},
	handler: async (ctx, args) => {
		const publicChannels = await ctx.db
			.query("channels")
			.withIndex("by_serverId_and_participantHash", (q) => q.eq("serverId", args.serverId))
			.filter((q) => q.eq(q.field("type"), "public"))
			.collect()

		return publicChannels
	},
})

export const getUnjoinedPublicChannelsForOrganization = organizationServerQuery({
	args: {},
	handler: async (ctx) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		const channels = await ctx.db
			.query("channels")
			.withIndex("by_serverId_and_participantHash", (q) => q.eq("serverId", ctx.serverId))
			.filter((q) => q.eq(q.field("type"), "public"))
			.collect()

		const unjoinedChannels = await asyncMap(channels, async (channel) => {
			const channelMember = await ctx.db
				.query("channelMembers")
				.withIndex("by_channelIdAndUserId", (q) =>
					q.eq("channelId", channel._id).eq("userId", user._id),
				)
				.first()

			if (channelMember) return null

			return channel
		})

		return unjoinedChannels.filter((channel) => channel !== null)
	},
})

export const getUnjoinedPublicChannels = userQuery({
	args: {
		serverId: v.id("servers"),
	},
	handler: async (ctx, args) => {
		const publicChannels = await ctx.db
			.query("channels")
			.withIndex("by_serverId_and_participantHash", (q) => q.eq("serverId", args.serverId))
			.filter((q) => q.eq(q.field("type"), "public"))
			.collect()

		const channelsWithMembers = await asyncMap(publicChannels, async (channel) => {
			const channelMembers = await ctx.db
				.query("channelMembers")
				.withIndex("by_channelIdAndUserId", (q) =>
					q.eq("channelId", channel._id).eq("userId", ctx.user.id),
				)
				.first()

			if (!channelMembers) return channel

			return null
		})

		return channelsWithMembers.filter((channel) => channel !== null)
	},
})

export const createChannelForOrganization = organizationServerMutation({
	args: {
		name: v.string(),
		type: v.union(v.literal("public"), v.literal("private")),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		const channelId = await ctx.db.insert("channels", {
			name: args.name,
			serverId: ctx.serverId,
			type: args.type,
			updatedAt: Date.now(),
			pinnedMessages: [],
		})

		// Add creator as member
		await ctx.db.insert("channelMembers", {
			channelId,
			userId: user._id,
			joinedAt: Date.now(),
			isHidden: false,
			isMuted: false,
			isFavorite: false,
			notificationCount: 0,
		})

		return channelId
	},
})

export const createChannel = userMutation({
	args: {
		serverId: v.id("servers"),

		name: v.string(),
		type: v.union(v.literal("public"), v.literal("private"), v.literal("thread"), v.literal("direct")),
		userIds: v.optional(v.array(v.id("users"))),
		parentChannelId: v.optional(v.id("channels")),

		threadMessageId: v.optional(v.id("messages")),
	},
	handler: async (ctx, args) => {
		const channelId = await ctx.db.insert("channels", {
			name: args.name,
			serverId: args.serverId,
			type: args.type,
			parentChannelId: args.parentChannelId,
			updatedAt: Date.now(),
			pinnedMessages: [],
		})

		await ctx.db.insert("channelMembers", {
			channelId,
			userId: ctx.user.id,
			joinedAt: Date.now(),
			isHidden: false,
			isMuted: false,
			isFavorite: false,
			notificationCount: 0,
		})

		if (args.userIds) {
			// TODO: Validate that user can add userIds to channel?
			await asyncMap(args.userIds, async (userId) => {
				await ctx.db.insert("channelMembers", {
					channelId,
					userId: userId,
					joinedAt: Date.now(),
					isHidden: false,
					isMuted: false,
					isFavorite: false,
					notificationCount: 0,
				})
			})
		}

		if (args.type === "thread") {
			if (!args.threadMessageId) throw new Error("Thread message id is required")

			await ctx.db.patch(args.threadMessageId, {
				threadChannelId: channelId,
			})
		}

		return channelId
	},
})

function createParticipantHash(userIds: Id<"users">[]) {
	return userIds.sort().join(":")
}

export const createDmChannelForOrganization = organizationServerMutation({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		// Check if DM channel already exists
		const existingChannel = await ctx.db
			.query("channels")
			.withIndex("by_serverId_and_participantHash", (q) => q.eq("serverId", ctx.serverId))
			.filter((q) => q.eq(q.field("type"), "dm"))
			.collect()

		for (const channel of existingChannel) {
			const members = await ctx.db
				.query("channelMembers")
				.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", channel._id))
				.collect()

			if (
				members.length === 2 &&
				members.some((m) => m.userId === user._id) &&
				members.some((m) => m.userId === args.userId)
			) {
				return channel._id
			}
		}

		// Create new DM channel
		const channelId = await ctx.db.insert("channels", {
			serverId: ctx.serverId,
			name: "Direct Message",
			type: "single",
			updatedAt: Date.now(),
			pinnedMessages: [],
		})

		// Add both users as members
		await ctx.db.insert("channelMembers", {
			channelId,
			userId: user._id,
			joinedAt: Date.now(),
			isHidden: false,
			isMuted: false,
			isFavorite: false,
			notificationCount: 0,
		})

		await ctx.db.insert("channelMembers", {
			channelId,
			userId: args.userId,
			joinedAt: Date.now(),
			isHidden: false,
			isMuted: false,
			isFavorite: false,
			notificationCount: 0,
		})

		return channelId
	},
})

export const creatDmChannel = userMutation({
	args: {
		serverId: v.id("servers"),
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const participantHash = createParticipantHash([args.userId, ctx.user.id])

		const existingChannel = await ctx.db
			.query("channels")
			.withIndex("by_serverId_and_participantHash", (q) =>
				q.eq("serverId", args.serverId).eq("participantHash", participantHash),
			)
			.first()

		if (existingChannel) {
			return existingChannel._id
		}

		const channelId = await ctx.db.insert("channels", {
			serverId: args.serverId,
			name: "Direct Message",
			type: "single",
			participantHash,
			updatedAt: Date.now(),
			pinnedMessages: [],
		})

		await Promise.all([
			ctx.db.insert("channelMembers", {
				channelId,
				userId: ctx.user.id,
				joinedAt: Date.now(),
				isHidden: false,
				isMuted: false,
				isFavorite: false,
				notificationCount: 0,
			}),
			ctx.db.insert("channelMembers", {
				channelId,
				userId: args.userId,
				joinedAt: Date.now(),
				isHidden: false,
				isMuted: false,
				isFavorite: false,
				notificationCount: 0,
			}),
		])

		return channelId
	},
})

export const leaveChannelForOrganization = organizationServerMutation({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")
		if (channel.serverId !== ctx.serverId) throw new Error("Channel not in this server")

		const channelMember = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) =>
				q.eq("channelId", args.channelId).eq("userId", user._id),
			)
			.first()

		if (!channelMember) {
			throw new Error("You are not a member of this channel")
		}

		await ctx.db.delete(channelMember._id)
	},
})

export const leaveChannel = userMutation({
	args: {
		serverId: v.id("servers"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		const channelMember = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) =>
				q.eq("channelId", args.channelId).eq("userId", ctx.user.id),
			)
			.first()

		if (!channelMember) throw new Error("You are not a member of this channel")

		await ctx.db.delete(channelMember._id)
	},
})

export const joinChannelForOrganization = organizationServerMutation({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")
		if (channel.serverId !== ctx.serverId) throw new Error("Channel not in this server")

		const existingMember = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) =>
				q.eq("channelId", args.channelId).eq("userId", user._id),
			)
			.first()

		if (existingMember) {
			throw new Error("Already a member of this channel")
		}

		await ctx.db.insert("channelMembers", {
			channelId: args.channelId,
			userId: user._id,
			joinedAt: Date.now(),
			isHidden: false,
			isMuted: false,
			isFavorite: false,
			notificationCount: 0,
		})
	},
})

export const joinChannel = userMutation({
	args: {
		serverId: v.id("servers"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		const channelMember = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) =>
				q.eq("channelId", args.channelId).eq("userId", ctx.user.id),
			)
			.first()

		if (channelMember) throw new Error("You are already a member of this channel")

		await ctx.db.insert("channelMembers", {
			userId: ctx.user.id,
			channelId: args.channelId,
			joinedAt: Date.now(),
			isHidden: false,
			isMuted: false,
			isFavorite: false,
			notificationCount: 0,
		})
	},
})

export const updateChannelPreferencesForOrganization = organizationServerMutation({
	args: {
		channelId: v.id("channels"),
		isMuted: v.optional(v.boolean()),
		isHidden: v.optional(v.boolean()),
		isFavorite: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		const channelMember = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) =>
				q.eq("channelId", args.channelId).eq("userId", user._id),
			)
			.first()

		if (!channelMember) {
			throw new Error("You are not a member of this channel")
		}

		await ctx.db.patch(channelMember._id, {
			isMuted: args.isMuted ?? channelMember.isMuted,
			isHidden: args.isHidden ?? channelMember.isHidden,
			isFavorite: args.isFavorite ?? channelMember.isFavorite,
		})
	},
})

export const updateChannelPreferences = userMutation({
	args: {
		serverId: v.id("servers"),
		channelId: v.id("channels"),
		isMuted: v.optional(v.boolean()),
		isHidden: v.optional(v.boolean()),
		isFavorite: v.optional(v.boolean()),
	},
	handler: async (ctx, { serverId, channelId, ...args }) => {
		const channelMember = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", channelId).eq("userId", ctx.user.id))
			.first()

		if (!channelMember) throw new Error("You are not a member of this channel")

		await ctx.db.patch(channelMember._id, args)
	},
})
