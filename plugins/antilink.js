const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const db = require('../libs/database');

module.exports = (bot) => {
const chkAntilink = (conn) => {
const chat = conn.chat.id;
const data = db.get();
return data.groups?.[chat]?.antilink || false;
};

bot.command('antilink', async (conn) => {
if (conn.chat.type === 'private') return conn.reply('❌ Solo en grupos.');

const chat = conn.chat.id;
const user = conn.from.id;
const args = conn.message.text.split(' ');

if (args.length < 2) return conn.reply('❌ Uso: /antilink [on|off]', { reply_to_message_id: conn.message.message_id });

const botMember = await conn.telegram.getChatMember(chat, conn.botInfo.id);
if (!botMember.status.includes("administrator")) {
return conn.reply('❌ No soy administrador. No puedo gestionar antilink.', { reply_to_message_id: conn.message.message_id });
}

const data = db.get();
const admins = await conn.getChatAdministrators();
const isadmin = admins.some(adm => adm.user.id === user);
if (!isadmin) return conn.reply('❌ Solo admins.', { reply_to_message_id: conn.message.message_id });

if (!data.groups) data.groups = {};
if (!data.groups[chat]) data.groups[chat] = { antilink: false };

data.groups[chat].antilink = args[1].toLowerCase() === 'on';
db.save(data);

return conn.reply(`✅ Antilink ${data.groups[chat].antilink ? 'activado' : 'desactivado'}.`, { reply_to_message_id: conn.message.message_id });
});

bot.hears(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi, async (conn) => {
if (!chkAntilink(conn)) return;

const chat = conn.chat.id;
const user = conn.from.id;
const messageId = conn.message.message_id;

const botMember = await conn.telegram.getChatMember(chat, conn.botInfo.id);
if (!botMember.can_delete_messages) {
return conn.reply('❌ No tengo permiso para eliminar mensajes.', { reply_to_message_id: messageId });
}

const isAdmin = (await conn.getChatAdministrators()).some(adm => adm.user.id === user);
if (isAdmin) return;

try {
await conn.telegram.deleteMessage(chat, messageId);
await conn.reply(`❌ @${conn.from.username || conn.from.first_name}, los enlaces no están permitidos.`, { reply_to_message_id: messageId });
} catch (err) {
try {
await conn.telegram.restrictChatMember(chat, user, {
permissions: { can_send_messages: false },
until_date: Math.floor(Date.now() / 1000) + 60,
});

await conn.reply(`🔇 @${conn.from.username || conn.from.first_name}, has sido silenciado 1 minuto por enviar enlaces.`, { reply_to_message_id: messageId });

} catch (muteErr) {}
}
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.greenBright.bold(`Update '${path.basename(file)}'.`));
delete require.cache[file];
require(file);
});
};