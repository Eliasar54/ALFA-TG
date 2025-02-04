const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
require("../settings");

module.exports = (bot) => {
bot.command('creador', async (conn) => {
await conn.replyWithContact('+50582340051', 'EliasarYT', {
reply_to_message_id: conn.message.message_id,
});
});

bot.command('report', async (conn) => {
const reportMessage = conn.message.text.split(' ').slice(1).join(' ');
if (!reportMessage) {
return conn.reply('❌ Escribe tu reporte después del comando.', {
reply_to_message_id: conn.message.message_id,
});
}
await bot.telegram.sendMessage(CREATOR_ID, `
Nuevo reporte: ✨
${reportMessage}
De: ${conn.from.first_name} (@${conn.from.username || 'Sin usuario'})`);
await conn.reply('✅ Tu reporte ha sido enviado al creador.', {
reply_to_message_id: conn.message.message_id,
});
});
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.greenBright.bold(`Update '${path.basename(file)}'.`));
delete require.cache[file];
require(file);
});