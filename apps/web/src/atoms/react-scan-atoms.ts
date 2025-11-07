import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Atom } from "@effect-atom/atom-react"
import { Schema } from "effect"

const localStorageRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage)

export const reactScanEnabledAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "react-scan-enabled",
	schema: Schema.NullOr(Schema.Boolean),
	defaultValue: () => false,
})
