import { code } from "telegraf/format";
const INITIAL_SESSION = {
    messages: [],
  };

class chatReply{
    iThinkMsg(ctx){
        return ctx.reply(code("Думаю что ответить тебе..."));
    }
    iListenMsg(ctx){
        return ctx.reply(code("Я слушаю..."));
    }
    youQnIs(ctx, text){
        return ctx.reply(code(`Твой вопрос: ${text}`));
    }

    newSession(ctx){
        ctx.session = INITIAL_SESSION;
        ctx.reply(code("Поговорим о чем то новом!"));
    }

   
}

export const ctxReply = new chatReply();