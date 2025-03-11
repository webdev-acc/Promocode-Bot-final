import { Telegraf, Markup } from "telegraf";

// const webAppUrl = "https://warm-rabbit-69.loca.lt";
const webAppUrl = "https://myfrontend.loca.lt";
const TOKEN = "7924776903:AAFSP4CPeYtblPpUHnuDAw1Bg5439k5ueSI";
const bot = new Telegraf(TOKEN);

bot.command("start", (ctx) => {
  ctx.reply(
    `Hello ! Press to start`,
    Markup.inlineKeyboard([Markup.button.webApp("Launch app", webAppUrl)])
  );
});

bot.on("message", (ctx) => {
  ctx.reply(ctx.message.chat.id);
});
bot.launch();
