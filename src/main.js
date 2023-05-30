import { Telegraf, session } from "telegraf";
import config from "config";
import { message } from "telegraf/filters";
import { ogg } from "./ogg.js";
import { ctxReply } from "./chating.js";


//console.log(config.get('TEST_ENV'))
const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.use(session());

bot.command("new", async (ctx) => {
  ctxReply.newSession(ctx);

  ctx.reply("Обсудим что то новое!");
});

bot.command("start", async (ctx) => {
  ctxReply.newSession(ctx);
  ctx.reply("Шо надо? Спрашивай");
});

bot.on(message("voice"), async (ctx) => {
  if (!ctx.session) {
    ctxReply.newSession(ctx);
  }

  let text;

  let reply = await ctxReply.iListenMsg(ctx);
  text = await ogg.voiceToText(ctx);
  await ctx.deleteMessage(reply.message_id);
  ctxReply.youQnIs(ctx, text);
  reply = await ctxReply.iThinkMsg(ctx);
  const responce = await ogg.askChat(ctx, text);
  await ctx.deleteMessage(reply.message_id);
  ctx.reply(responce);
});

bot.on(message("text"), async (ctx) => {
  if (!ctx.session) {
    ctxReply.newSession(ctx);
  }
  let text = ctx.message.text;
  ctxReply.youQnIs(ctx, text);
  let reply = await ctxReply.iThinkMsg(ctx);
  const responce = await ogg.askChat(ctx, text);
  await ctx.deleteMessage(reply.message_id);
  ctx.reply(responce);
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
