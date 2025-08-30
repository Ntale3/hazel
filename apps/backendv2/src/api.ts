import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { Message } from "@hazel/db"
import { Schema } from "effect"
import { Authorization } from "./lib/auth"
import { TransactionId } from "./lib/create-transactionId"
import { InternalServerError, UnauthorizedError } from "./lib/errors"

export class RootGroup extends HttpApiGroup.make("root").add(
	HttpApiEndpoint.get("root")`/`.addSuccess(Schema.String),
) {}

export class CreateMessageResponse extends Schema.Class<CreateMessageResponse>("CreateMessageResponse")({
	data: Message.Model.json,
	transactionId: TransactionId,
}) {}

export class MessageNotFoundError extends Schema.TaggedError<MessageNotFoundError>("MessageNotFoundError")(
	"MessageNotFoundError",
	{
		messageId: Schema.UUID,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {}

export class ChannelNotFoundError extends Schema.TaggedError<ChannelNotFoundError>("ChannelNotFoundError")(
	"MessageNotFoundError",
	{
		channelId: Schema.UUID,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {}

export class MessageGroup extends HttpApiGroup.make("messages")
	.add(
		HttpApiEndpoint.post("create")`/`
			.setPayload(Message.Model.jsonCreate)
			.addSuccess(CreateMessageResponse)
			.addError(ChannelNotFoundError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Create Message",
					description: "Create a new message in a channel",
					summary: "Create a new message",
				}),
			),
	)
	.prefix("/messages")
	.middleware(Authorization) {}

export class HazelApi extends HttpApi.make("HazelApp")
	.add(MessageGroup)
	.add(RootGroup)
	.annotateContext(
		OpenApi.annotations({
			title: "Hazel Chat API",
			description: "API for the Hazel chat application",
			version: "1.0.0",
		}),
	) {}
