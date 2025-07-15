import type { Id } from "../_generated/dataModel"
import { mutation, query } from "../_generated/server"
import { Account } from "../lib/activeRecords/account"
import { customMutation, customQuery } from "../lib/customFunctions"

export const organizationServerQuery = customQuery(query, {
	args: {},
	input: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const account = await Account.fromIdentity(ctx, identity)

		const organizationId = identity.organizationId as string | undefined

		if (!organizationId) {
			throw new Error("No organization associated with this account")
		}

		const server = await ctx.db
			.query("servers")
			.withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
			.first()

		if (!server) {
			throw new Error("No server found for this organization")
		}

		const serverMember = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", account.doc._id).eq("serverId", server._id),
			)
			.first()

		if (!serverMember) {
			throw new Error("You are not a member of this server")
		}

		return {
			ctx: {
				...ctx,
				account,
				identity,
				server,
				serverId: server._id as Id<"servers">,
				organizationId,
			},
			args,
		}
	},
})

export const organizationServerMutation = customMutation(mutation, {
	args: {},
	input: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const account = await Account.fromIdentity(ctx, identity)

		const organizationId = identity.organizationId as string | undefined

		if (!organizationId) {
			throw new Error("No organization associated with this account")
		}

		const server = await ctx.db
			.query("servers")
			.withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
			.first()

		if (!server) {
			throw new Error("No server found for this organization")
		}

		const serverMember = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", account.doc._id).eq("serverId", server._id),
			)
			.first()

		if (!serverMember) {
			throw new Error("You are not a member of this server")
		}

		return {
			ctx: {
				...ctx,
				account,
				identity,
				server,
				serverId: server._id as Id<"servers">,
				organizationId,
			},
			args,
		}
	},
})
