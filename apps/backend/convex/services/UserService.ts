import type { Doc, Id } from "@hazel/backend"
import type { UserIdentity } from "convex/server"
import { Context, Effect, Layer, Option, Schema } from "effect"
import { type ConfectQueryCtx, type ConfectMutationCtx } from "../confect"

// Context union type for both query and mutation operations
type ConfectContext = ConfectQueryCtx | ConfectMutationCtx

// User data types
export interface UserData {
	readonly user: Doc<"users">
	readonly account: Doc<"accounts">
}

// UserService interface
export interface UserService {
	readonly fromIdentity: (
		ctx: ConfectContext,
		identity: UserIdentity,
		serverId: Id<"servers">,
	) => Effect.Effect<UserData, Error>

	readonly isMemberOfChannel: (
		ctx: ConfectContext,
		userData: UserData,
		channelId: Id<"channels">,
	) => Effect.Effect<boolean, Error>

	readonly validateIsMemberOfChannel: (
		ctx: ConfectContext,
		userData: UserData,
		channelId: Id<"channels">,
	) => Effect.Effect<void, Error>

	readonly canViewChannel: (
		ctx: ConfectContext,
		userData: UserData,
		channelId: Id<"channels">,
	) => Effect.Effect<boolean, Error>

	readonly validateCanViewChannel: (
		ctx: ConfectContext,
		userData: UserData,
		channelId: Id<"channels">,
	) => Effect.Effect<void, Error>

	readonly ownsMessage: (
		ctx: ConfectContext,
		userData: UserData,
		messageId: Id<"messages">,
	) => Effect.Effect<boolean, Error>

	readonly validateOwnsMessage: (
		ctx: ConfectContext,
		userData: UserData,
		messageId: Id<"messages">,
	) => Effect.Effect<void, Error>
}

// Service tag
export const UserService = Context.GenericTag<UserService>("@app/UserService")

// Implementation
const UserServiceLive = Layer.succeed(
	UserService,
	UserService.of({
		fromIdentity: (ctx: ConfectContext, identity: UserIdentity, serverId: Id<"servers">) =>
			Effect.gen(function* () {
				// Get account from identity
				const accountOption = yield* ctx.db
					.query("accounts")
					.withIndex("bg_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
					.unique()

				if (Option.isNone(accountOption)) {
					return yield* Effect.fail(new Error("Account not found"))
				}

				const account = accountOption.value

				// Get user from account and server
				const userOption = yield* ctx.db
					.query("users")
					.withIndex("by_accountId_serverId", (q) => q.eq("accountId", account._id))
					.filter((q) => q.eq(q.field("serverId"), serverId))
					.unique()

				if (Option.isNone(userOption)) {
					return yield* Effect.fail(new Error("User not found"))
				}

				const user = userOption.value

				return { user, account }
			}),

		isMemberOfChannel: (ctx: ConfectContext, userData: UserData, channelId: Id<"channels">) =>
			Effect.gen(function* () {
				const channelMemberOption = yield* ctx.db
					.query("channelMembers")
					.filter((q) => q.eq(q.field("userId"), userData.user._id))
					.filter((q) => q.eq(q.field("channelId"), channelId))
					.first()

				return Option.isSome(channelMemberOption)
			}),

		validateIsMemberOfChannel: (ctx: ConfectContext, userData: UserData, channelId: Id<"channels">) =>
			Effect.gen(function* () {
				const channelMemberOption = yield* ctx.db
					.query("channelMembers")
					.filter((q) => q.eq(q.field("userId"), userData.user._id))
					.filter((q) => q.eq(q.field("channelId"), channelId))
					.first()

				if (Option.isNone(channelMemberOption)) {
					return yield* Effect.fail(new Error("You are not a member of this channel"))
				}
			}),

		canViewChannel: (ctx: ConfectContext, userData: UserData, channelId: Id<"channels">) =>
			Effect.gen(function* () {
				const channelOption = yield* ctx.db.get(channelId)

				if (Option.isNone(channelOption)) {
					return yield* Effect.fail(new Error("Channel not found"))
				}

				const channel = channelOption.value

				if (channel.type === "public") {
					return true
				}

				// Check membership directly instead of using userService to avoid recursion
				const channelMemberOption = yield* ctx.db
					.query("channelMembers")
					.filter((q) => q.eq(q.field("userId"), userData.user._id))
					.filter((q) => q.eq(q.field("channelId"), channelId))
					.first()

				return Option.isSome(channelMemberOption)
			}),

		validateCanViewChannel: (ctx: ConfectContext, userData: UserData, channelId: Id<"channels">) =>
			Effect.gen(function* () {
				const channelOption = yield* ctx.db.get(channelId)

				if (Option.isNone(channelOption)) {
					return yield* Effect.fail(new Error("Channel not found"))
				}

				const channel = channelOption.value

				if (channel.type === "public") {
					return
				}

				// Check membership for private channels
				const channelMemberOption = yield* ctx.db
					.query("channelMembers")
					.filter((q) => q.eq(q.field("userId"), userData.user._id))
					.filter((q) => q.eq(q.field("channelId"), channelId))
					.first()

				if (Option.isNone(channelMemberOption)) {
					return yield* Effect.fail(new Error("You do not have access to this channel"))
				}
			}),

		ownsMessage: (ctx: ConfectContext, userData: UserData, messageId: Id<"messages">) =>
			Effect.gen(function* () {
				const messageOption = yield* ctx.db.get(messageId)

				if (Option.isNone(messageOption)) {
					return yield* Effect.fail(new Error("Message not found"))
				}

				const message = messageOption.value

				return message.authorId === userData.user._id
			}),

		validateOwnsMessage: (ctx: ConfectContext, userData: UserData, messageId: Id<"messages">) =>
			Effect.gen(function* () {
				const messageOption = yield* ctx.db.get(messageId)

				if (Option.isNone(messageOption)) {
					return yield* Effect.fail(new Error("Message not found"))
				}

				const message = messageOption.value

				if (message.authorId !== userData.user._id) {
					return yield* Effect.fail(new Error("You do not have permission to update this message"))
				}
			}),
	}),
)

export { UserServiceLive }