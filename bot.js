const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

const whitelist = ["username1", "username2"]; //without "@"
const TelegramToken = "telegram-token"; //without "bot"
const OpenAIToken = "openai-token";

const bot = new TelegramBot(TelegramToken, {polling: true});

bot.on("message", async msg => {
	const chatId = msg.chat.id;
	const text = msg.text;
	const messages = [];

	if (!whitelist.includes(msg.from.username)) return;
	
	if (text.startsWith("!")) return;
	
	if (msg.reply_to_message) {
		messages.push({
			"role": "user",
			"content": msg.reply_to_message.text
		});
	}

	messages.push({
		"role": "user",
		"content": text
	});
	
	const r = await chatgpt(messages);

	bot.sendMessage(chatId, r);
});

async function chatgpt(messages) {
	const r = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${OpenAIToken}`
		},
		body: JSON.stringify({
			"model": "gpt-3.5-turbo",
			"messages": messages
		})
	});
	
	const j = await r.json();
	
	if (r.status != 200) {
		return j;
	}
	
	return j.choices[0].message.content;
}