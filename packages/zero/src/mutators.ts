import type { CustomMutatorDefs } from "@rocicorp/zero"
import type { Message, schema } from "./schema"

import type { UserId } from "@maki-chat/api-schema/schema/user.js"

export interface AuthData {
	userId: typeof UserId.Type
}

export function createMutators(authData: AuthData) {
	return {
		messages: {
			insert: async (tx, data: Message) => {
				if (data.authorId !== authData.userId) {
					throw new Error("Unauthorized")
				}

				await tx.mutate.messages.insert(data)
			},
		},
	} as const satisfies CustomMutatorDefs<typeof schema>
}
