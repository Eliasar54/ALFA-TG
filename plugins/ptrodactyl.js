const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { exec } = require('child_process');
const axios = require('axios');
const { isCreator } = require('../utils');
require('../settings');

module.exports = (bot) => {
const appKey = '';
const clientKey = '';
const panelUrl = '';

const req = async (endpoint, isClient = false) => {
const key = isClient ? clientKey : appKey;

if (!key || !panelUrl) {
throw new Error('⚠️ API Key o URL no configuradas correctamente.');
}

try {
const res = await axios.get(`${panelUrl}${endpoint}`, {
headers: { Authorization: `Bearer ${key}` },
});
return res.data;
} catch (e) {
throw new Error(`❌ Error al obtener datos: ${e.response?.status} - ${e.response?.statusText}\n\n${e.stack}`);
}
};

bot.command('users', async (conn) => {
try {
if (!isCreator(conn.from.id.toString())) return conn.reply('🔒 Acceso denegado.', { reply_to_message_id: conn.message.message_id });

const d = await req('/application/users');
conn.reply(`👥 **Total de usuarios en Pterodactyl Panel**: ${d.meta.pagination.total}`, { reply_to_message_id: conn.message.message_id });
} catch (error) {
conn.reply(`⚠️ **Error:**\n\n${error.stack || error}`, { reply_to_message_id: conn.message.message_id });
}
});

bot.command('servers', async (conn) => {
try {
if (!isCreator(conn.from.id.toString())) return conn.reply('🔒 Acceso denegado.', { reply_to_message_id: conn.message.message_id });

const d = await req('/application/servers');
conn.reply(`🖥️ **Total de servidores en Pterodactyl Panel**: ${d.meta.pagination.total}`, { reply_to_message_id: conn.message.message_id });
} catch (error) {
conn.reply(`⚠️ **Error:**\n\n${error.stack || error}`, { reply_to_message_id: conn.message.message_id });
}
});

bot.command('status', async (conn) => {
try {
if (!isCreator(conn.from.id.toString())) return conn.reply('🔒 Acceso denegado.', { reply_to_message_id: conn.message.message_id });

const d = await req('/client', true);
const status = d.data.map(s => `🔹 **${s.attributes.name}**: ${s.attributes.status}`).join('\n');
conn.reply(`🌐 **Estado de los servidores en Pterodactyl Panel**:\n${status}`, { reply_to_message_id: conn.message.message_id });
} catch (error) {
conn.reply(`⚠️ **Error:**\n\n${error.stack || error}`, { reply_to_message_id: conn.message.message_id });
}
});

bot.command('backup', async (conn) => {
try {
if (!isCreator(conn.from.id.toString())) return conn.reply('🔒 Acceso denegado.', { reply_to_message_id: conn.message.message_id });

const d = await req('/application/users');
const filePath = path.join(__dirname, '../backups', `users_backup_${Date.now()}.json`);
fs.mkdirSync(path.join(__dirname, '../backups'), { recursive: true });
fs.writeFileSync(filePath, JSON.stringify(d, null, 2));
conn.replyWithDocument({ source: filePath, filename: path.basename(filePath) });
} catch (error) {
conn.reply(`⚠️ **Error:**\n\n${error.stack || error}`, { reply_to_message_id: conn.message.message_id });
}
});

fs.watchFile(require.resolve(__filename), () => {
fs.unwatchFile(require.resolve(__filename));
const fileName = path.basename(__filename);
console.log(chalk.greenBright.bold(`Update '${fileName}'.`));
delete require.cache[require.resolve(__filename)];
require(__filename);
});
};