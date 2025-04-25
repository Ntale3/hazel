import { createZeroSchema } from "drizzle-zero"

import { ANYONE_CAN, type ExpressionBuilder, type PermissionsConfig, type Row, definePermissions } from "@rocicorp/zero"
import * as drizzleSchema from "../drizzle/schema"

export const schema = createZeroSchema(drizzleSchema, {
	casing: "camelCase",
	tables: {
		users: {
			id: true,
			tag: true,
			displayName: true,
			avatarUrl: true,
			lastSeen: true,
			status: true,
		},
		server: {
			id: true,
			ownerId: true,
			name: true,
			slug: true,
			imageUrl: true,
			type: true,
			createdAt: true,
			updatedAt: true,
		},
		serverMembers: {
			id: true,
			userId: true,
			serverId: true,
			role: true,
			joinedAt: true,
		},
		serverChannels: {
			id: true,
			serverId: true,
			name: true,
			channelType: true,
			createdAt: true,
			updatedAt: true,
		},
		channelMembers: {
			userId: true,
			channelId: true,
			joinedAt: true,
		},
		messages: {
			id: true,
			content: true,
			channelId: true,
			authorId: true,
			parentMessageId: true,
			replyToMessageId: true,
			attachedFiles: true,
			createdAt: true,
			updatedAt: true,
		},
		pinnedMessages: {
			id: true,
			messageId: true,
			channelId: true,
		},
		reactions: {
			id: true,
			messageId: true,
			userId: true,
			emoji: true,
			createdAt: true,
		},
	},
	manyToMany: {
		server: {
			users: ["serverMembers", "users"],
		},
		users: {
			servers: ["serverMembers", "server"],
			serverChannels: ["channelMembers", "serverChannels"],
		},
		serverChannels: {
			users: ["channelMembers", "users"],
			// pinnedMessages: ["pinnedMessages", "messages"],
		},
		messages: {
			// pinnedInChannels: ["pinnedMessages", "serverChannels"],
		},
	},
})

export type Schema = typeof schema
export type Message = Row<typeof schema.tables.messages>
export type User = Row<typeof schema.tables.users>
export type Channel = Row<typeof schema.tables.serverChannels>

// The contents of your decoded JWT.
type AuthData = {
	sub: string | null
}

type TableName = keyof Schema["tables"]

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
	const allowIfMessageSender = (authData: AuthData, { cmp }: ExpressionBuilder<Schema, "messages">) =>
		cmp("authorId", "=", authData.sub ?? "")

	const allowIfOwner = (authData: AuthData, { cmp }: ExpressionBuilder<Schema, "users">) =>
		cmp("id", "=", authData.sub ?? "")

	const allowIfRowOwner = (authData: AuthData, { cmpLit }: ExpressionBuilder<Schema, TableName>) =>
		cmpLit("userId", "=", authData.sub ?? "")

	const isChannelParti = (authData: AuthData, eb: ExpressionBuilder<Schema, "serverChannels">) =>
		eb.or(eb.exists("users", (iq) => iq.where("id", "=", authData.sub ?? "")))

	const isChannelPublic = (authData: AuthData, eb: ExpressionBuilder<Schema, "serverChannels">) =>
		eb.and(eb.cmp("channelType", "=", "public"))

	const isChannelParticipant = (authData: AuthData, eb: ExpressionBuilder<Schema, "pinnedMessages" | "messages">) =>
		eb.or(eb.exists("channel", (iq) => iq.whereExists("users", (iq) => iq.where("id", "=", authData.sub ?? ""))))

	const isServerMember = (authData: AuthData, eb: ExpressionBuilder<Schema, "server">) =>
		eb.or(eb.exists("members", (iq) => iq.where("userId", "=", authData.sub ?? "")))

	const isServerOwner = (authData: AuthData, eb: ExpressionBuilder<Schema, "server">) =>
		eb.or(
			eb.exists("members", (iq) =>
				iq.where((eq) => eq.and(eq.cmp("userId", "=", authData.sub ?? ""), eq.cmp("role", "=", "owner"))),
			),
		)

	const isPublicServer = (authData: AuthData, eb: ExpressionBuilder<Schema, "server">) =>
		eb.cmp("type", "=", "public")

	return {
		users: {
			row: {
				select: ANYONE_CAN,
				insert: [allowIfOwner],
				update: {
					preMutation: [allowIfOwner],
					postMutation: [allowIfOwner],
				},
				delete: [allowIfOwner],
			},
		},
		messages: {
			row: {
				insert: [allowIfMessageSender],
				update: {
					preMutation: [allowIfMessageSender],
					postMutation: [allowIfMessageSender],
				},
				delete: [allowIfMessageSender],
				select: ANYONE_CAN,
			},
		},
		pinnedMessages: {
			row: {
				select: [isChannelParticipant],
				update: {
					preMutation: [isChannelParticipant],
					postMutation: [isChannelParticipant],
				},
				insert: [isChannelParticipant],
				delete: [isChannelParticipant],
			},
		},
		server: {
			row: {
				select: [isServerMember, isPublicServer],
				insert: ANYONE_CAN,
				update: {
					preMutation: [isServerOwner],
					postMutation: [isServerOwner],
				},
			},
		},
		serverMembers: {
			row: {
				// TODO:
				select: ANYONE_CAN,
				insert: ANYONE_CAN,
			},
		},
		serverChannels: {
			row: {
				// TODO: isChannelPublic currentl allows access to all channels, even when not in same server
				select: [isChannelParti, isChannelPublic],
				update: {
					preMutation: [isChannelParti],
					postMutation: [isChannelParti],
				},
				insert: [isChannelParti],
				delete: [isChannelParti],
			},
		},
		channelMembers: {
			row: {
				select: ANYONE_CAN,
				insert: ANYONE_CAN,
				delete: [allowIfRowOwner],
			},
		},
		reactions: {
			row: {
				select: ANYONE_CAN,
				insert: ANYONE_CAN,
				delete: ANYONE_CAN,
			},
		},
	} satisfies PermissionsConfig<AuthData, Schema>
})
