import { Telegraf, Markup } from "telegraf";

const webAppUrl = "https://myfrontend.loca.lt";
const TOKEN = "8199906155:AAEH7o60xmeGbcVW8MJ3R9MgZBe3P79CZcY";
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
