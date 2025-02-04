const fs = require('fs');
const path = require('path');

module.exports = (bot) => {
bot.hears(/uwu/i, async (conn) => {
const audioPath = path.join(__dirname, '../audios/a.mp3');
try {
await conn.replyWithAudio({ source: audioPath }, { caption: 'Uwu 😆' });
} catch (error) {
await conn.reply('❌ Error al enviar el audio.', { reply_to_message_id: conn.message.message_id });
}
});

bot.hears(/bot feo/i, async (conn) => {
const audioPath = path.join(__dirname, '../audios/bot feo.mp3');
try {
await conn.replyWithAudio({ source: audioPath }, { caption: 'y vos que pedaso de mrd 🤡' });
} catch (error) {
await conn.reply('❌ Error al enviar el audio.', { reply_to_message_id: conn.message.message_id });
}
});

bot.hears(/no soy gay/i, async (conn) => {
const audioPath = path.join(__dirname, '../audios/no soy gay pero soy peruano.mp3');
try {
await conn.replyWithAudio({ source: audioPath }, { caption: 'soy peruano 😆' });
} catch (error) {
await conn.reply('❌ Error al enviar el audio.', { reply_to_message_id: conn.message.message_id });
}
});

bot.hears(/omaga/i, async (conn) => {
const audioPath = path.join(__dirname, '../audios/omaga.mp3');
try {
await conn.replyWithAudio({ source: audioPath }, { caption: 'omaga 🙀' });
} catch (error) {
await conn.reply('❌ Error al enviar el audio.', { reply_to_message_id: conn.message.message_id });
}
});

fs.watchFile(require.resolve(__filename), () => {
fs.unwatchFile(require.resolve(__filename));
delete require.cache[require.resolve(__filename)];
require(__filename);
});
};