import { Database } from "@hazel/db"
import type { DatabaseError, TransactionClient } from "@hazel/db/src/services/database"
import { Effect, Schema } from "effect"

export const TransactionId = Schema.Number.pipe(Schema.brand("@Hazel/transactionId"))
export const TransactionIdFromString = Schema.NumberFromString.pipe(Schema.brand("@Hazel/transactionId"))

export const generateTransactionId = Effect.fn("generateTransactionId")(function* (
	tx?: <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, DatabaseError, never>,
) {
	const db = yield* Database.Database
	const executor = tx ?? db.execute
	const result = yield* executor((client) =>
		client.execute(`SELECT pg_current_xact_id()::xid::text as txid`),
	).pipe(
		Effect.map((rows) => rows[0]?.txid as string),
		Effect.flatMap((txid) => Schema.decode(TransactionIdFromString)(txid)),
		Effect.orDie,
	)

	return result
})
