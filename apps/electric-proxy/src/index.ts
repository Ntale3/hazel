import {
	HttpMiddleware,
	HttpRouter,
	HttpServer,
	HttpServerRequest,
	HttpServerResponse,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client"
import { Config, Effect, Layer, Redacted } from "effect"

const electricUrl = Config.string("ELECTRIC_URL").pipe(Config.withDefault("https://api.electric-sql.cloud"))
const electricSecret = Config.redacted("ELECTRIC_SECRET")
const electricSourceId = Config.string("ELECTRIC_SOURCE_ID")

const router = HttpRouter.empty.pipe(
	HttpRouter.get(
		"/electric/proxy",
		Effect.gen(function* () {
			const request = yield* HttpServerRequest.HttpServerRequest
			const url = request.url
			const searchParams = new URLSearchParams(url.split("?")[1] || "")

			const table = searchParams.get("table")
			if (!table) {
				return yield* HttpServerResponse.json(
					{ message: "Needs to have a table param" },
					{ status: 400 },
				)
			}

			const [elUrl, elSecret, elSourceId] = yield* Effect.all([
				electricUrl,
				electricSecret,
				electricSourceId,
			])

			const originUrl = new URL("/v1/shape", elUrl)

			searchParams.forEach((value, key) => {
				if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
					originUrl.searchParams.set(key, value)
				}
			})

			originUrl.searchParams.set(`table`, searchParams.get("table")!)

			originUrl.searchParams.set("source_id", elSourceId)
			originUrl.searchParams.set("secret", Redacted.value(elSecret))

			const response = yield* Effect.tryPromise({
				try: () => fetch(originUrl.toString()),
				catch: (error) => new Error(`Proxy fetch failed: ${error}`),
			})

			const headers = new Headers(response.headers)
			headers.delete("content-encoding")
			headers.delete("content-length")
			headers.set("Vary", "Authorization")
			headers.set("Access-Control-Allow-Origin", "*")
			headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
			headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			const body = yield* Effect.tryPromise({
				try: () => response.arrayBuffer(),
				catch: (error) => new Error(`Failed to read response body: ${error}`),
			})

			const headersObject: Record<string, string> = {}
			headers.forEach((value, key) => {
				headersObject[key] = value
			})

			return HttpServerResponse.raw(new Uint8Array(body), {
				status: response.status,
				statusText: response.statusText,
				headers: headersObject,
			})
		}),
	),
)

const app = router.pipe(
	HttpServer.serve(
		HttpMiddleware.cors({
			allowedOrigins: ["*"],
			allowedMethods: ["GET", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	),
	HttpServer.withLogAddress,
)

const ServerLive = BunHttpServer.layer({ port: 3004 })

BunRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)))
