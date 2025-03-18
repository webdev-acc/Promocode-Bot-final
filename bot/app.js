import { Telegraf, Markup } from "telegraf";

const webAppUrl = "https://promocode888starzbot.site";
const TOKEN = "7761331474:AAFrYS-1IjADnuRdmEsw74Q2fKtCW-IaY-Q";
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
