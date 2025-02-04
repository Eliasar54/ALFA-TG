const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');
const yts = require('yt-search');
const acrcloud = require('acrcloud');
const path = require('path');
module.exports = (bot) => {
bot.command('play', async (conn) => {
const query = conn.message.text.split(' ').slice(1).join(' ');
if (!query) {
return conn.reply('❌ Por favor ingresa un término de búsqueda después de /play.', {
reply_to_message_id: conn.message.message_id
});
}
try {
const searchResults = await yts(query);
const video = searchResults.videos[0];
if (!video) {
return conn.reply('❌ No se encontraron resultados para tu búsqueda.', {
reply_to_message_id: conn.message.message_id
});
}
const { title, url, image, timestamp, views } = video;
await conn.replyWithPhoto(image, {
caption: `🎬 *${title}*\n\n` +
`⏱ Duración: *${timestamp}*\n` +
`👁‍🗨 Vistas: *${views.toLocaleString()}*\n` +
`🔗 URL (${url})\n\n` +
`_Procesando descarga del video..._`,
parse_mode: 'Markdown',
reply_to_message_id: conn.message.message_id
});
const apiUrl = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`;
const response = await axios.get(apiUrl);
if (!response.data.status || !response.data.data) {
return conn.reply('❌ No se pudo generar el enlace de descarga. Intenta nuevamente más tarde.', {
reply_to_message_id: conn.message.message_id
});
}
const { dl: videoUrl } = response.data.data;
const tempFilePath = path.resolve(__dirname, '../temp', `${Date.now()}.mp4`);
const writer = fs.createWriteStream(tempFilePath);
const videoResponse = await axios({
url: videoUrl,
method: 'GET',
responseType: 'stream'
});
videoResponse.data.pipe(writer);
writer.on('finish', async () => {
await conn.replyWithVideo({ source: tempFilePath });
fs.unlinkSync(tempFilePath);
});
writer.on('error', (error) => {
fs.unlinkSync(tempFilePath);
conn.reply(`\n\n${error.stack || error}`, {
reply_to_message_id: conn.message.message_id
});
});
} catch (error) {
const errorDetails = error.response
? `Status: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}\nHeaders: ${JSON.stringify(error.response.headers, null, 2)}`
: error.stack || error.message || error;
conn.reply(`\n\n${errorDetails}`, {
reply_to_message_id: conn.message.message_id
});
}
});

const handleFacebookDownload = async (conn) => {
const query = conn.message.text.split(' ').slice(1).join(' ');
if (!query) {
return conn.reply('❌ Por favor ingresa una URL de Facebook después del comando.', {
reply_to_message_id: conn.message.message_id
});
}
try {
await conn.reply('🔄 Procesando descarga del video...');
const apiUrl = `https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encodeURIComponent(query)}`;
const response = await axios.get(apiUrl);

if (!response.data.status || !response.data.data || response.data.data.length === 0) {
return conn.reply('❌ No se pudo descargar el video. Verifica la URL e intenta nuevamente.', {
reply_to_message_id: conn.message.message_id
});
}

const videoUrl = response.data.data[0].url;

await conn.replyWithVideo({ url: videoUrl }, { reply_to_message_id: conn.message.message_id });
} catch (error) {
conn.reply(`❌ Ocurrió un error: ${error.message || error}`, {
reply_to_message_id: conn.message.message_id
});
}
};

bot.command('fb', handleFacebookDownload);
bot.command('fasebok', handleFacebookDownload);

bot.command('quemusica', async (conn) => {
const message = conn.message;
const repliedMessage = message.reply_to_message;

if (repliedMessage && (repliedMessage.voice || repliedMessage.video || repliedMessage.audio)) {
let file = repliedMessage.voice || repliedMessage.video || repliedMessage.audio;
const fileId = file.file_id;
let tempFilePath;

try {
const fileData = await conn.telegram.getFile(fileId);
const fileUrl = `https://api.telegram.org/file/bot7507120891:AAERXUfv1dOaZvBZdHrt6LJ4PyluoA5COLc/${fileData.file_path}`;
const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });

const ext = path.extname(fileData.file_path).slice(1);
tempFilePath = path.resolve(__dirname, '../temp', `${Date.now()}.${ext}`);
fs.writeFileSync(tempFilePath, fileResponse.data);

const acr = new acrcloud({
host: 'identify-eu-west-1.acrcloud.com',
access_key: 'c33c767d683f78bd17d4bd4991955d81',
access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu',
});

const res = await acr.identify(fs.readFileSync(tempFilePath));
const { code, msg } = res.status;

if (code !== 0) {
throw new Error(msg);
}

const { title, artists, album, genres, release_date } = res.metadata.music[0];
const txt = `
• 📌 𝐓𝐢𝐭𝐮𝐥𝐨: ${title}
• 👨‍🎤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: ${artists ? artists.map((v) => v.name).join(', ') : 'No encontrado'}
• 💾 𝐀𝐥𝐛𝐮𝐦: ${album?.name || 'No encontrado'}
• 🌐 𝐆𝐞𝐧𝐞𝐫𝐨: ${genres ? genres.map((v) => v.name).join(', ') : 'No encontrado'}
• 📆 𝐅𝐞𝐜𝐡𝐚 𝐝𝐞 𝐥𝐚𝐧𝐳𝐚𝐦𝐢𝐞𝐧𝐭𝐨: ${release_date || 'No encontrado'}
`.trim();

const search = await yts(title);
const video = search.videos.length > 0 ? search.videos[0] : null;

if (!video) {
return conn.reply('⚠️ No se encontró ningún video relacionado en YouTube.', {
reply_to_message_id: repliedMessage.message_id
});
}

await conn.replyWithPhoto(video.thumbnail, {
caption: txt,
parse_mode: 'Markdown',
reply_to_message_id: repliedMessage.message_id
});

} catch (error) {
conn.reply(`⚠️ Error al identificar la música: ${error.message}`, {
reply_to_message_id: repliedMessage.message_id
});
} finally {
if (tempFilePath && fs.existsSync(tempFilePath)) {
fs.unlinkSync(tempFilePath);
}
}
} else {
conn.reply('⚠️ Por favor, responde a un archivo de audio o video para identificar la música.', {
reply_to_message_id: message.message_id
});
}
});

bot.command('tiktok', async (conn) => {
const query = conn.message.text.split(' ').slice(1).join(' ');
if (!query) {
return conn.reply('❌ Por favor ingresa una URL de TikTok después de /tiktok.', {
reply_to_message_id: conn.message.message_id
});
}
try {
await conn.reply('🔄 Procesando descarga del video...');
const apiUrl = `https://eliasar-yt-api.vercel.app/api/search/tiktok?query=${encodeURIComponent(query)}`;
const response = await axios.get(apiUrl);
if (!response.data.status || !response.data.results) {
return conn.reply('❌ No se pudo descargar el video. Verifica la URL e intenta nuevamente.', {
reply_to_message_id: conn.message.message_id
});
}
const { nowm: videoUrl } = response.data.results;
await conn.replyWithVideo({ url: videoUrl }, { reply_to_message_id: conn.message.message_id });
} catch (error) {
conn.reply(`❌ Ocurrió un error: ${error.message || error}`, {
reply_to_message_id: conn.message.message_id
});
}
});

bot.command('apkdl', async (conn) => {
const query = conn.message.text.split(' ').slice(1).join(' ');

if (!query) {
return conn.reply('❌ 𝗣𝗿𝗼𝘃𝗲𝗲 𝗲𝗹 𝗻𝗼𝗺𝗯𝗿𝗲 𝗱𝗲 𝗹𝗮 𝗮𝗽𝗽.\n👉 𝗨𝘀𝗼: /apkdl <𝗻𝗼𝗺𝗯𝗿𝗲>');
}

try {
const apkDlResponse = await axios.get(`https://api.dorratz.com/v2/apk-dl?text=${encodeURIComponent(query)}`);
const apkData = apkDlResponse.data;

if (!apkData.dllink) {
return conn.reply('⚠️ 𝗔𝗣𝗞 𝗻𝗼 𝗲𝗻𝗰𝗼𝗻𝘁𝗿𝗮𝗱𝗼 𝗼 𝗶𝗻𝗮𝗰𝗰𝗲𝘀𝗶𝗯𝗹𝗲.');
}

const apkHeadResponse = await axios.head(apkData.dllink);
const apkSizeInMB = parseInt(apkHeadResponse.headers['content-length'], 10) / (1024 * 1024);

if (apkSizeInMB > 50) {
return conn.reply(`📦 𝗧𝗮𝗺𝗮ñ𝗼 𝗲𝘅𝗰𝗲𝗱𝗶𝗱𝗼 (${apkSizeInMB.toFixed(2)}𝗠𝗕)\n│\n└📌 𝗟í𝗺𝗶𝘁𝗲: 𝟱𝟬𝗠𝗕 (𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺)`);
}

const tmpDir = path.resolve(__dirname, '../temp');
if (!fs.existsSync(tmpDir)) {
fs.mkdirSync(tmpDir, { recursive: true });
}

const apkPath = path.join(tmpDir, `${apkData.name.replace(/[^a-zA-Z0-9]/g, '_')}.apk`);
const writer = fs.createWriteStream(apkPath);

const apkResponse = await axios({ url: apkData.dllink, method: 'GET', responseType: 'stream' });
apkResponse.data.pipe(writer);

writer.on('finish', async () => {
try {
await conn.replyWithPhoto({ url: apkData.icon }, {
caption: `📲 𝗔𝗣𝗞: *${apkData.name}*\n📦 𝗧𝗮𝗺𝗮ñ𝗼: ${apkData.size}\n🆔 𝗣𝗮𝗾𝘂𝗲𝘁𝗲: \`${apkData.package}\`\n🕒 𝗔𝗰𝘁𝘂𝗮𝗹𝗶𝘇𝗮𝗱𝗼: ${apkData.lastUpdate}`,
parse_mode: 'Markdown'
});

await conn.replyWithDocument({ source: apkPath, filename: `${apkData.name}.apk` });
fs.unlinkSync(apkPath);
} catch (sendError) {
fs.existsSync(apkPath) && fs.unlinkSync(apkPath);
conn.reply('🌀 𝗘𝗿𝗿𝗼𝗿 𝗮𝗹 𝗲𝗻𝘃𝗶𝗮𝗿 𝗲𝗹 𝗔𝗣𝗞.');
}
});

writer.on('error', (error) => {
fs.existsSync(apkPath) && fs.unlinkSync(apkPath);
conn.reply('⚠️ 𝗙𝗮𝗹𝗹𝗼 𝗲𝗻 𝗹𝗮 𝗱𝗲𝘀𝗰𝗮𝗿𝗴𝗮.\n' + String(error).slice(0, 100));
});

} catch (error) {
conn.reply('💥 𝗘𝗿𝗿𝗼𝗿 𝗶𝗻𝘁𝗲𝗿𝗻𝗼:\n' + String(error).split(':')[0]);
}
});
bot.command('playaudio', async (conn) => {
const query = conn.message.text.split(' ').slice(1).join(' ');
if (!query) {
return conn.reply('❌ Por favor ingresa un término de búsqueda después de /play.', {
reply_to_message_id: conn.message.message_id
});
}
try {
const searchResults = await yts(query);
const video = searchResults.videos[0];
if (!video) {
return conn.reply('❌ No se encontraron resultados para tu búsqueda.', {
reply_to_message_id: conn.message.message_id
});
}
const { title, url, image, timestamp, views } = video;
await conn.replyWithPhoto(image, {
caption: `🎬 *${title}*\n\n` +
`⏱ Duración: *${timestamp}*\n` +
`👁‍🗨 Vistas: *${views.toLocaleString()}*\n` +
`🔗 URL (${url})\n\n` +
`*Procesando descarga de MP3...*`,
parse_mode: 'Markdown',
reply_to_message_id: conn.message.message_id
});

const apiUrl = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`;
const response = await axios.get(apiUrl);

if (!response.data.status || !response.data.data) {
return conn.reply('❌ No se pudo generar el enlace de descarga. Intenta nuevamente más tarde.', {
reply_to_message_id: conn.message.message_id
});
}

const { title: audioTitle, dl: audioUrl } = response.data.data;

const tempFilePath = path.resolve(__dirname, '../temp', `${Date.now()}.mp3`);
const writer = fs.createWriteStream(tempFilePath);
const audioResponse = await axios({
url: audioUrl,
method: 'GET',
responseType: 'stream'
});

audioResponse.data.pipe(writer);

writer.on('finish', async () => {
await conn.replyWithAudio({
source: tempFilePath,
filename: `${audioTitle}.mp3`
});
fs.unlinkSync(tempFilePath);
});

writer.on('error', (error) => {
fs.unlinkSync(tempFilePath);
conn.reply(`\n\n${error.stack || error}`, {
reply_to_message_id: conn.message.message_id
});
});

} catch (error) {
const errorDetails = error.response
? `Status: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}\nHeaders: ${JSON.stringify(error.response.headers, null, 2)}`
: error.stack || error.message || error;
conn.reply(`\n\n${errorDetails}`, {
reply_to_message_id: conn.message.message_id
});
}
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
const fileName = path.basename(file);
console.log(chalk.greenBright.bold(`Update '${fileName}'.`));
delete require.cache[file];
require(file);
});
};
