const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');
const path = require('path');
const yts = require('yt-search');
const FormData = require('form-data');

module.exports = (bot) => {
const sendMeme = async (conn) => {
try {
const response = await axios.get('https://eliasar-yt-api.vercel.app/api/random/meme');
const memeData = response.data;

if (memeData.status !== 'success' || !memeData.data) {
return conn.reply('❌ No se pudo obtener un meme. Intenta nuevamente más tarde.', {
reply_to_message_id: conn.message.message_id
});
}

const { title, image } = memeData.data;
await conn.replyWithPhoto(image, {
caption: `🖼️ *${title}*`,
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [[{ text: '🔄 Siguiente', callback_data: 'next_meme' }]],
},
reply_to_message_id: conn.message.message_id
});
} catch {
conn.reply('❌ Ocurrió un error al obtener el meme. Intenta nuevamente más tarde.', {
reply_to_message_id: conn.message.message_id
});
}
};

bot.hears('/meme', (conn) => sendMeme(conn));

bot.on('callback_query', async (conn) => {
if (conn.callbackQuery.data === 'next_meme') {
await sendMeme(conn);
await conn.answerCbQuery();
}
});

bot.command('pinterest', async (conn) => {
const query = conn.message.text.split(' ').slice(1).join(' ');
if (!query) return conn.reply('❌ Ingresa un término de búsqueda después de /pinterest.', {
reply_to_message_id: conn.message.message_id
});

try {
const response = await axios.get(`https://itzpire.com/search/pinterest?query=${encodeURIComponent(query)}`);
const imageData = response.data;

if (imageData.status !== 'success' || !imageData.data.length) {
return conn.reply(`❌ No se encontraron imágenes para: *${query}*.`, {
parse_mode: 'Markdown',
reply_to_message_id: conn.message.message_id
});
}

const randomImage = imageData.data[Math.floor(Math.random() * imageData.data.length)];
await conn.replyWithPhoto(randomImage.image, {
caption: `🖼️ *${randomImage.caption || 'Sin título'}*\n🔗 [Fuente](${randomImage.source})`,
parse_mode: 'Markdown',
reply_to_message_id: conn.message.message_id
});
} catch {
conn.reply('❌ Error al buscar imágenes. Intenta nuevamente más tarde.', {
reply_to_message_id: conn.message.message_id
});
}
});

bot.command('yts', async (conn) => {
const query = conn.message.text.split(' ').slice(1).join(' ');
if (!query) {
return conn.reply('❌ Ingresa un término de búsqueda después de /yts.', {
reply_to_message_id: conn.message.message_id
});
}

try {
const results = await yts(query);
const videos = results.videos.slice(0, 5);

if (!videos.length) {
return conn.reply(`❌ No se encontraron resultados para: *${query}*.`, {
parse_mode: 'Markdown',
reply_to_message_id: conn.message.message_id
});
}

let messageText = `🔍 Resultados para: *${query}*:\n\n`;
videos.forEach((video, i) => {
messageText += `\n**${i + 1}. ${video.title}**\n`;
messageText += `🔗 ${video.url}\n`;
messageText += `👍 Likes: ${video.likes}\n`;
});

await conn.replyWithPhoto(videos[0].thumbnail, {
caption: messageText,
parse_mode: 'Markdown',
reply_to_message_id: conn.message.message_id
});

} catch {
conn.reply('❌ Error al realizar la búsqueda.', {
reply_to_message_id: conn.message.message_id
});
}
});

bot.command('s', async (conn) => {
if (!conn.message.reply_to_message || !conn.message.reply_to_message.photo) {
return conn.reply('❌ Responde a una imagen para convertirla en sticker.', {
reply_to_message_id: conn.message.message_id
});
}

try {
const fileId = conn.message.reply_to_message.photo.pop().file_id;
const fileLink = await conn.telegram.getFileLink(fileId);
const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(response.data);

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const tempImagePath = path.join(tempDir, `temp_image_${Date.now()}.jpg`);
fs.writeFileSync(tempImagePath, imageBuffer);

await conn.replyWithSticker({ source: tempImagePath }, {
reply_to_message_id: conn.message.message_id
});

fs.unlinkSync(tempImagePath);
} catch {
conn.reply('❌ Error al crear el sticker.', {
reply_to_message_id: conn.message.message_id
});
}
});

bot.command('tourl', async (conn) => {
const message = conn.message.reply_to_message;
if (!message || (!message.document && !message.photo && !message.video && !message.audio)) {
return conn.reply('❌ Responde a un archivo, imagen, video o audio para obtener una URL.', {
reply_to_message_id: conn.message.message_id
});
}

try {
let fileId, fileName;

if (message.document) {
fileId = message.document.file_id;
fileName = message.document.file_name;
} else if (message.photo) {
fileId = message.photo[message.photo.length - 1].file_id;
fileName = `photo_${Date.now()}.jpg`;
} else if (message.video) {
fileId = message.video.file_id;
fileName = message.video.file_name || `video_${Date.now()}.mp4`;
} else if (message.audio) {
fileId = message.audio.file_id;
fileName = message.audio.file_name || `audio_${Date.now()}.mp3`;
}

const fileLink = await conn.telegram.getFileLink(fileId);
const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });

const formData = new FormData();
const buffer = Buffer.from(response.data);
formData.append('file', buffer, { filename: fileName });

const uploadResponse = await axios.post('https://api.ryzendesu.vip/api/uploader/ryzencdn', formData, {
headers: formData.getHeaders(),
});

if (uploadResponse.data.success) {
await conn.reply(`✅ Archivo subido con éxito:\n🌐 URL: ${uploadResponse.data.url}`, {
reply_to_message_id: conn.message.message_id
});
} else {
await conn.reply('❌ Error al subir el archivo.', {
reply_to_message_id: conn.message.message_id
});
}
} catch (error) {
await conn.reply(`❌ Error en el proceso. Verifica el archivo e intenta de nuevo.\n\n${error.stack || error}`, {
reply_to_message_id: conn.message.message_id
});
}
});
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.greenBright.bold(`Update '${path.basename(file)}'.`));
delete require.cache[file];
require(file);
});