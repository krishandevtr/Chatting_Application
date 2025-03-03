"use server";

import { Message } from "@/db/dummy";
import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { pusherServer } from "@/lib/pusher";

type SendMessageActionArgs = {
	content: string;
	receiverId: string;
	messageType: "text" | "image";
};

export async function sendMessageAction({ content, messageType, receiverId }: SendMessageActionArgs) {
	console.log("sendMessageAction called with:", { content, messageType, receiverId });
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		console.log("User not authenticated");
		return { success: false, message: "User not authenticated" };
	}

	const senderId = user.id;
	console.log("Authenticated user:", senderId);

	const conversationId = `conversation:${[senderId, receiverId].sort().join(":")}`;
	console.log("Generated conversationId:", conversationId);

	const conversationExists = await redis.exists(conversationId);
	console.log("Conversation exists:", conversationExists);

	if (!conversationExists) {
		console.log("Creating new conversation");
		await redis.hset(conversationId, {
			participant1: senderId,
			participant2: receiverId,
		});

		await redis.sadd(`user:${senderId}:conversations`, conversationId);
		await redis.sadd(`user:${receiverId}:conversations`, conversationId);
	}

	const messageId = `message:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
	const timestamp = Date.now();
	console.log("Generated messageId:", messageId, "with timestamp:", timestamp);

	await redis.hset(messageId, {
		senderId,
		content,
		timestamp,
		messageType,
	});
	console.log("Message stored in Redis with messageId:", messageId);

	await redis.zadd(`${conversationId}:messages`, { score: timestamp, member: JSON.stringify(messageId) });
	console.log("Message added to sorted set in Redis for conversationId:", conversationId);

	const channelName = `${senderId}__${receiverId}`.split("__").sort().join("__");
	console.log("Pusher channel name:", channelName);

	console.log("Triggering Pusher event for new message");
	try {
		await pusherServer.trigger(channelName, "newMessage", {
			message: { senderId, content, timestamp, messageType },
		});
		console.log("Pusher event triggered successfully");
	} catch (error) {
		console.error("Error triggering Pusher event:", error);
	}

	console.log("Pusher event triggered for new message");

	console.log('Goanna return the conversationId and messageId');

	return { success: true, conversationId, messageId };
}

export async function getMessages(selectedUserId: string, currentUserId: string) {
	// conversation:kp_87f4a115d5f34587940cdee58885a58b:kp_a6bc2324e26548fcb5c19798f6459814:messages

	const conversationId = `conversation:${[selectedUserId, currentUserId].sort().join(":")}`;

	console.log("conversationId______", conversationId);
	const messageIds = await redis.zrange(`${conversationId}:messages`, 0, -1);
	console.log("messageIds______", messageIds);
	if (messageIds.length === 0) return [];

	const pipeline = redis.pipeline();
	messageIds.forEach((messageId) => pipeline.hgetall(messageId as string));
	const messages = (await pipeline.exec()) as Message[];
	console.log(...messages, "___________________________________")
	return messages;
}
