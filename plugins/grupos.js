const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = (bot) => {
const isAdmin = async (conn) => {
try {
if (conn.chat.type === 'private') {
conn.reply('Este comando solo se puede usar en grupos o supergrupos.');
return false;
}
const chatId = conn.chat.id;
const userId = conn.from.id;
const admins = await conn.telegram.getChatAdministrators(chatId);
return admins.some(admin => admin.user.id === userId);
} catch {
conn.reply('Hubo un error al verificar los permisos.');
return false;
}
};

const isBotAdmin = async (conn) => {
try {
const chatId = conn.chat.id;
const botId = (await conn.telegram.getMe()).id;
const admins = await conn.telegram.getChatAdministrators(chatId);
return admins.some(admin => admin.user.id === botId);
} catch {
conn.reply('Hubo un error al verificar si el bot es administrador.');
return false;
}
};

bot.command('ban', async (conn) => {
if (await isBotAdmin(conn) && await isAdmin(conn)) {
if (conn.message.reply_to_message) {
const userId = conn.message.reply_to_message.from.id;
try {
await conn.telegram.kickChatMember(conn.chat.id, userId);
conn.reply('Usuario baneado.');
} catch {
conn.reply('No se pudo banear al usuario.');
}
} else {
conn.reply('Responde al mensaje de la persona que quieres banear.');
}
}
});

bot.command('todos', async (conn) => {
if (await isBotAdmin(conn) && await isAdmin(conn)) {

const admins = await conn.getChatAdministrators();
const participantList = admins.map(admin => `@${admin.user.username}`);

if (participantList.length === 0) {
return conn.reply('No se encontraron administradores con nombre de usuario.');
}

await conn.reply(`𝘼𝙏𝙀𝙉𝘾𝙄𝙊𝙉 𝙐𝙎𝙐𝘼𝙍𝙄𝙊𝙎 🗣️:\n\n${participantList.join('\n')}`);

} else {
conn.reply('❌ Solo los administradores pueden usar este comando.');
}
});

bot.command('pin', async (conn) => {
if (await isBotAdmin(conn) && await isAdmin(conn)) {
if (conn.message.reply_to_message) {
try {
await conn.telegram.pinChatMessage(conn.chat.id, conn.message.reply_to_message.message_id);
conn.reply('Mensaje fijado.');
} catch {
conn.reply('No se pudo fijar el mensaje.');
}
} else {
conn.reply('Responde al mensaje que quieres fijar.');
}
}
});

bot.command('unpin', async (conn) => {
if (await isBotAdmin(conn) && await isAdmin(conn)) {
try {
await conn.telegram.unpinChatMessage(conn.chat.id);
conn.reply('Mensaje desfigado.');
} catch {
conn.reply('No se pudo desfigar el mensaje.');
}
}
});

bot.command('promote', async (conn) => {
if (await isBotAdmin(conn) && await isAdmin(conn)) {
if (conn.message.reply_to_message) {
const userId = conn.message.reply_to_message.from.id;
try {
await conn.telegram.promoteChatMember(conn.chat.id, userId, {
can_manage_chat: true,
can_change_info: true,
can_delete_messages: true,
can_invite_users: true,
can_restrict_members: true,
can_pin_messages: true,
can_promote_members: false,
});
conn.reply('Usuario promocionado a administrador.');
} catch {
conn.reply('No se pudo promocionar al usuario.');
}
} else {
conn.reply('Responde al mensaje de la persona que quieres promocionar.');
}
}
});

bot.command('demote', async (conn) => {
if (await isBotAdmin(conn) && await isAdmin(conn)) {
if (conn.message.reply_to_message) {
const userId = conn.message.reply_to_message.from.id;
try {
await conn.telegram.promoteChatMember(conn.chat.id, userId, {
can_manage_chat: false,
can_change_info: false,
can_delete_messages: false,
can_invite_users: false,
can_restrict_members: false,
can_pin_messages: false,
can_promote_members: false,
});
conn.reply('Usuario degradado.');
} catch {
conn.reply('No se pudo degradar al usuario.');
}
} else {
conn.reply('Responde al mensaje de la persona que quieres degradar.');
}
}
});
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
const fileName = path.basename(file);
console.log(chalk.greenBright.bold(`Update '${fileName}'.`));
delete require.cache[file];
require(file);
});