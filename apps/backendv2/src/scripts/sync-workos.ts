import { Effect } from "effect"
import { WorkOSSync } from "../services/workos-sync"

const syncWorkos = Effect.gen(function* () {
	const workOsSync = yield* WorkOSSync

	yield* workOsSync.syncAll
}).pipe(Effect.provide(WorkOSSync.Default))

Effect.runPromise(syncWorkos)
