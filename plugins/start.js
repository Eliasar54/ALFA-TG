const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
require("../settings");

module.exports = (bot) => {
bot.telegram.setMyCommands([
{ command: 'start', description: 'Inicia la interacción con Alfa TG 💫' },
{ command: 'report', description: 'Reporta un error 🧐' }
]);

bot.command('start', async (conn) => {
const user = conn.from;
const userName = user.first_name;
const botInfo = await bot.telegram.getMe();
const botUsername = botInfo.username;

const responseMessage = 
`🎉 <b>¡Hola <u>${userName}</u>!</b>\n\n` +
`🤖 Soy <code>${botUsername}</code>, tu asistente en Telegram.\n` +
`📌 Comando disponible: <code>/menu</code> para funciones\n` +
`🔗 Soporte: <code>@EliasarYT</code>\n\n` +
`<i>Powered by</i> <b>Alfa-TG</b> ✨`;

conn.replyWithHTML(responseMessage, {
reply_to_message_id: conn.message.message_id,
disable_web_page_preview: true
});
});
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.greenBright.bold(`Update '${path.basename(file)}'`));
delete require.cache[file];
require(file);
});