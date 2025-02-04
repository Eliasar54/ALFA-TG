const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const db = require('../libs/database');

module.exports = (bot) => {
const chkWelcome = (conn) => {
const chat = conn.chat.id;
const data = db.get();
return data.groups?.[chat]?.welcome ?? true;
};

bot.command('welcome', async (conn) => {
if (conn.chat.type === 'private') return conn.reply('❌ Solo en grupos.');

const chat = conn.chat.id;
const user = conn.from.id;
const args = conn.message.text.split(' ');

if (args.length < 2) return conn.reply('❌ Uso: /welcome [on|off]', { reply_to_message_id: conn.message.message_id });

const act = args[1].toLowerCase();
const data = db.get();
const admins = await conn.getChatAdministrators();
const isadmin = admins.some(adm => adm.user.id === user);
if (!isadmin) return conn.reply('❌ Solo admins.', { reply_to_message_id: conn.message.message_id });

if (!data.groups) data.groups = {};
if (!data.groups[chat]) data.groups[chat] = { welcome: false };

data.groups[chat].welcome = act === 'on';
db.save(data);

return conn.reply(`✅ Bienvenida ${act === 'on' ? 'activada' : 'desactivada'}.`, { reply_to_message_id: conn.message.message_id });
});

bot.on('new_chat_members', async (conn) => {
if (!chkWelcome(conn)) return;

const newMembers = conn.message.new_chat_members;

for (const member of newMembers) {
try {
const profilePics = await conn.telegram.getUserProfilePhotos(member.id);
const profileUrl = profilePics.total_count > 0
? await conn.telegram.getFileLink(profilePics.photos[0][0].file_id)
: 'https://i.ibb.co/FXFhnvb/1727991425099.png';

const chatPhoto = await conn.telegram.getChat(conn.chat.id);
const groupPhoto = chatPhoto.photo
? await conn.telegram.getFileLink(chatPhoto.photo.small_file_id)
: 'https://i.ibb.co/FXFhnvb/1727991425099.png';

const memberCount = await conn.telegram.getChatMembersCount(conn.chat.id);
const username = encodeURIComponent(member.first_name);
const groupName = encodeURIComponent(conn.chat.title);

const apiUrl = `https://eliasar-yt-api.vercel.app/api/welcome4?user=${username}&server=${groupName}&icon=${groupPhoto}&count=${memberCount}&avatar=${encodeURIComponent(profileUrl)}&bg=https://i.ibb.co/Dkx27RS/8ee83bdc5d63979844cf522316f0d56e.jpg`;

await conn.replyWithPhoto(apiUrl, { caption: `🎉 ¡Bienvenido/a, @${member.first_name}!` });
} catch {
await conn.reply(`🎉 ¡Bienvenido/a, @${member.first_name}!`);
}
}
});

bot.on('left_chat_member', async (conn) => {
if (!chkWelcome(conn)) return;

const member = conn.message.left_chat_member;

try {
const profilePics = await conn.telegram.getUserProfilePhotos(member.id);
const profileUrl = profilePics.total_count > 0
? await conn.telegram.getFileLink(profilePics.photos[0][0].file_id)
: 'https://i.ibb.co/FXFhnvb/1727991425099.png';

const memberCount = await conn.telegram.getChatMembersCount(conn.chat.id);
const farewellMessage = `👋 ¡Adiós, @${member.first_name}!\nActualmente somos ${memberCount} miembros.`;

await conn.replyWithPhoto(profileUrl, { caption: farewellMessage });
} catch {
await conn.reply(`👋 ¡Adiós, @${member.first_name}!`);
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