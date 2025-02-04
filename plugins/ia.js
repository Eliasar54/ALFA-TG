const fs = require('fs');
const axios = require('axios');
const db = require('../libs/database');
const { checkLevelUp } = require('../libs/level');
const { obtenerRango } = require('../libs/rangos');
module.exports = (bot) => {
bot.command('ia', async (conn) => {
const getUserData = (conn) => {
const userId = conn.from.id;
const data = db.get();
if (!data.users || !data.users[userId]) {
conn.reply('❌ Debes registrarte primero con /reg.', { reply_to_message_id: conn.message.message_id });
return null;
}
return { data, userId };
};

const userData = getUserData(conn);
if (!userData) return;

const { userId } = userData;
const args = conn.message.text.split(' ').slice(1);

if (args.length === 0) {
return conn.reply('Uso incorrecto. Proporciona un prompt para la IA.', { reply_to_message_id: conn.message.message_id });
}

const prompt = args.join(' ');
const act = `actuaras como ALFA-TG un bot de telegram desarrollado por EliasarYT te encargaras de ser buena persona`
const url = `https://eliasar-yt-api.vercel.app/api/ia/gemini?prompt=${act}   ${encodeURIComponent(prompt)}`;

try {
const response = await axios.get(url);
if (response.data.status) {
await conn.reply(response.data.content, { reply_to_message_id: conn.message.message_id });
} else {
await conn.reply('Hubo un error al obtener la respuesta de la IA.', { reply_to_message_id: conn.message.message_id });
}
} catch (error) {
await conn.reply('Error al hacer la solicitud a la IA.', { reply_to_message_id: conn.message.message_id });
}
});

bot.command('bing', async (conn) => {
const getUserData = (conn) => {
const userId = conn.from.id;
const data = db.get();
if (!data.users || !data.users[userId]) {
conn.reply('❌ Debes registrarte primero con /reg.', { reply_to_message_id: conn.message.message_id });
return null;
}
return { data, userId };
};

const userData = getUserData(conn);
if (!userData) return;

const args = conn.message.text.split(' ').slice(1);
if (args.length === 0) {
return conn.reply('❌ Proporciona un prompt para la IA.', { reply_to_message_id: conn.message.message_id });
}

const prompt = args.join(' ');
const url = `https://api.dorratz.com/ai/bing?prompt=${encodeURIComponent(prompt)}`;

try {
const response = await axios.get(url);
if (response.data.status) {
const aiResponse = response.data.result.ai_response;
await conn.reply(aiResponse, { reply_to_message_id: conn.message.message_id });
} else {
await conn.reply('❌ Hubo un error al obtener la respuesta de la IA.', { reply_to_message_id: conn.message.message_id });
}
} catch (error) {
console.error(error);
conn.reply('❌ Error al hacer la solicitud a la API.', { reply_to_message_id: conn.message.message_id });
}
});

bot.command('dalle', async (conn) => {
const getUserData = (conn) => {
const userId = conn.from.id;
const data = db.get();
if (!data.users || !data.users[userId]) {
conn.reply('❌ Debes registrarte primero con /reg.', { reply_to_message_id: conn.message.message_id });
return null;
}
return { data, userId };
};

const userData = getUserData(conn);
if (!userData) return;

const { userId, data } = userData;
const user = data.users[userId];

if (user.diamantes < 1) {
return conn.reply('❌ No tienes suficientes diamantes para acceder a las imágenes.', { reply_to_message_id: conn.message.message_id });
}

const args = conn.message.text.split(' ').slice(1);
if (args.length === 0) {
return conn.reply('❌ Proporciona un prompt para generar la imagen.', { reply_to_message_id: conn.message.message_id });
}

const prompt = args.join(' ');
const url = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(prompt)}`;

try {
const response = await axios.get(url, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(response.data, 'binary');

user.diamantes -= 1;
db.save(data);

await conn.replyWithPhoto({ source: imageBuffer }, { reply_to_message_id: conn.message.message_id });
conn.reply('✅ Has utilizado 1 diamante para acceder a las imágenes.', { reply_to_message_id: conn.message.message_id });
} catch (error) {
conn.reply('❌ Error al generar la imagen.', { reply_to_message_id: conn.message.message_id });
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