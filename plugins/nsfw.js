const path = require("path")
const fs = require('fs');
const axios = require('axios');
const db = require('../libs/database');

module.exports = (bot) => {
const chkgrp = (conn) => {
const chat = conn.chat.id;
const data = db.get();
if (!data.groups || !data.groups[chat] || !data.groups[chat].nsfw) {
conn.reply('❌ Comandos NSFW no permitidos.', { reply_to_message_id: conn.message.message_id });
return false;
}
return true;
};

const chkage = (conn, user) => {
const data = db.get();
const usr = data.users[user];
if (usr.age < 18) {
conn.reply('❌ Comando restringido a mayores de 18 años.', { reply_to_message_id: conn.message.message_id });
return false;
}
return true;
};

const getusr = (conn) => {
const user = conn.from.id;
const data = db.get();
if (!data.users || !data.users[user]) {
conn.reply('❌ Regístrate primero con /reg.', { reply_to_message_id: conn.message.message_id });
return null;
}
return { data, usr: data.users[user] };
};

bot.command('hentai', async (conn) => {
const chat = conn.chat.id;
if (conn.chat.type !== 'private' && !chkgrp(conn)) return;

const user = conn.from.id;
const { data, usr } = getusr(conn);
if (!usr) return;

if (!chkage(conn, user)) return;

if (typeof usr.diamantes !== 'number') {
usr.diamantes = 0;
db.save(data);
}

if (usr.diamantes < 1) {
return conn.reply('❌ No tienes suficientes diamantes.', { reply_to_message_id: conn.message.message_id });
}

usr.diamantes -= 1;
db.save(data);
conn.reply('✅ Usaste 1 diamante.', { reply_to_message_id: conn.message.message_id });

try {
const res = await axios.get('https://eliasar-yt-api.vercel.app/api/nsfw/hentai');
const { data: imgs } = res.data;

if (imgs && imgs.length > 0) {
let idx = 0;

const sendimg = () => {
const img = imgs[idx];
conn.replyWithPhoto(img.url, {
caption: img.title,
reply_to_message_id: conn.message.message_id
});
};

bot.action('next_img', async (conn) => {
idx = (idx + 1) % imgs.length;
sendimg();
conn.answerCbQuery();
});

sendimg();
} else {
conn.reply('❌ No se encontraron imágenes.', { reply_to_message_id: conn.message.message_id });
}
} catch (err) {
conn.reply(`❌ Error al obtener imágenes: ${err.message || err.toString()}`, { reply_to_message_id: conn.message.message_id });
}
});

bot.command('tetas', async (conn) => {
const chat = conn.chat.id;
if (conn.chat.type !== 'private' && !chkgrp(conn)) return;

const user = conn.from.id;
const { data, usr } = getusr(conn);
if (!usr) return;

if (!chkage(conn, user)) return;

if (typeof usr.diamantes !== 'number') {
usr.diamantes = 0;
db.save(data);
}

if (usr.diamantes < 1) {
return conn.reply('❌ No tienes suficientes diamantes.', { reply_to_message_id: conn.message.message_id });
}

usr.diamantes -= 1;
db.save(data);
conn.reply('✅ Usaste 1 diamante.', { reply_to_message_id: conn.message.message_id });

try {
const res = await axios.get('https://api.dorratz.com/nsfw/tetas', { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(res.data, 'binary');

await conn.replyWithPhoto({ source: imageBuffer }, { caption: '🔥 Aquí tienes unas tetas.' });

} catch (err) {
conn.reply(`❌ Error al obtener la imagen: ${err.message || err.toString()}`, { reply_to_message_id: conn.message.message_id });
}
});

bot.command('modocaliente', async (conn) => {
if (conn.chat.type === 'private') return conn.reply('❌ Solo en grupos.');

const chat = conn.chat.id;
const user = conn.from.id;
const args = conn.message.text.split(' ');

if (args.length < 2) return conn.reply('❌ Uso: /nsfw [on|off]', { reply_to_message_id: conn.message.message_id });

const act = args[1].toLowerCase();
const data = db.get();

const admins = await conn.getChatAdministrators();
const isadmin = admins.some(adm => adm.user.id === user);
if (!isadmin) return conn.reply('❌ Solo admins.', { reply_to_message_id: conn.message.message_id });

if (!data.groups) data.groups = {};
if (!data.groups[chat]) data.groups[chat] = { nsfw: false };

if (act === 'on') {
data.groups[chat].nsfw = true;
db.save(data);
return conn.reply('✅ NSFW habilitado.', { reply_to_message_id: conn.message.message_id });
}

if (act === 'off') {
data.groups[chat].nsfw = false;
db.save(data);
return conn.reply('❌ NSFW deshabilitado.', { reply_to_message_id: conn.message.message_id });
}

return conn.reply('❌ Uso: /nsfw [on|off]', { reply_to_message_id: conn.message.message_id });
});

bot.command('xnxdl', async (conn) => {
const args = conn.message.text.split(' ');
if (args.length < 2) {
return conn.reply('❌ Uso: /xnxdl [URL]', { reply_to_message_id: conn.message.message_id });
}

const url = args[1];
try {
const res = await axios.get(`https://eliasar-yt-api.vercel.app/api/download/xnxx?URL=${url}`);
const { status, datos } = res.data;

if (status) {
const vid = datos.datos;
const videoUrl = vid.urlVideo;

const head = await axios.head(videoUrl);
const fileSize = parseInt(head.headers['content-length'], 10);

if (fileSize > 50 * 1024 * 1024) {
const shortUrl = await axios.get(`https://tinyurl.com/api-create.php?url=${videoUrl}`);
return conn.reply(
`❌ El video es demasiado grande para enviarlo directamente. Puedes descargarlo aquí: ${shortUrl.data}`,
{ reply_to_message_id: conn.message.message_id }
);
}

const filePath = path.resolve(__dirname, '../temp', `${vid.titulo.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`);
const writer = fs.createWriteStream(filePath);

const videoStream = await axios({
url: videoUrl,
method: 'GET',
responseType: 'stream',
});

videoStream.data.pipe(writer);

writer.on('finish', async () => {
await conn.replyWithVideo({ source: filePath }, { caption: `✅ Video descargado: ${vid.titulo}` });
fs.unlinkSync(filePath);
});

writer.on('error', () => {
conn.reply('❌ Error al guardar el video.', { reply_to_message_id: conn.message.message_id });
});
} else {
conn.reply('❌ Error al obtener el video.', { reply_to_message_id: conn.message.message_id });
}
} catch (err) {
conn.reply(`❌ Error al obtener el video: ${err.message || err.toString()}`, { reply_to_message_id: conn.message.message_id });
}
});
bot.command('packgirl', async (conn) => {
const chat = conn.chat.id;
if (conn.chat.type !== 'private' && !chkgrp(conn)) return;

const user = conn.from.id;
const { data, usr } = getusr(conn);
if (!usr) return;

if (!chkage(conn, user)) return;

if (typeof usr.diamantes !== 'number') {
usr.diamantes = 0;
db.save(data);
}

if (usr.diamantes < 1) {
return conn.reply('❌ No tienes suficientes diamantes.', { reply_to_message_id: conn.message.message_id });
}

usr.diamantes -= 1;
db.save(data);
conn.reply('✅ Usaste 1 diamante.', { reply_to_message_id: conn.message.message_id });

const randomImage = global.packgirl[Math.floor(Math.random() * global.packgirl.length)];

try {
await conn.replyWithPhoto(randomImage, { caption: 'ufff 🤤' });
} catch (err) {
conn.reply(`❌ Error al enviar la imagen: ${err.message || err.toString()}`, { reply_to_message_id: conn.message.message_id });
}
});
bot.command('pack', async (conn) => {
const chat = conn.chat.id;
if (conn.chat.type !== 'private' && !chkgrp(conn)) return;

const user = conn.from.id;
const { data, usr } = getusr(conn);
if (!usr) return;

if (!chkage(conn, user)) return;

if (typeof usr.diamantes !== 'number') {
usr.diamantes = 0;
db.save(data);
}

if (usr.diamantes < 1) {
return conn.reply('❌ No tienes suficientes diamantes.', { reply_to_message_id: conn.message.message_id });
}

usr.diamantes -= 1;
db.save(data);
conn.reply('✅ Usaste 1 diamante.', { reply_to_message_id: conn.message.message_id });

const randomImage = global.pack[Math.floor(Math.random() * global.packgirl.length)];

try {
await conn.replyWithPhoto(randomImage, { caption: 'que rico 🔥' });
} catch (err) {
conn.reply(`❌ Error al enviar la imagen: ${err.message || err.toString()}`, { reply_to_message_id: conn.message.message_id });
}
});
global.packgirl = [
  'https://telegra.ph/file/c0da7289bee2d97048feb.jpg',
  'https://telegra.ph/file/b8564166f9cac4d843db3.jpg',
  'https://telegra.ph/file/fdefd621a17712be15e0e.jpg',
  'https://telegra.ph/file/6e1a6dcf1c91bf62d3945.jpg',
  'https://telegra.ph/file/0224c1ecf6b676dda3ac0.jpg',
  'https://telegra.ph/file/b71b8f04772f1b30355f1.jpg',
  'https://telegra.ph/file/6561840400444d2d27d0c.jpg',
  'https://telegra.ph/file/37e445df144e1dfcdb744.jpg',
  'https://telegra.ph/file/155b6ac6757bdd9cd05f9.jpg',
  'https://telegra.ph/file/2255a8a013540c2820a2b.jpg',
  'https://telegra.ph/file/450e901ac153765f095c5.jpg',
  'https://telegra.ph/file/f18e421a70810015be505.jpg',
  'https://telegra.ph/file/d3d190691ec399431434e.jpg',
  'https://telegra.ph/file/1fd2b897a1dbc3fdc2a70.jpg',
  'https://telegra.ph/file/607d54a909035bca7444f.jpg',
  'https://telegra.ph/file/818ba7c0ae82876b190b6.jpg',
  'https://telegra.ph/file/0f2bb426951b4a8fe1e5a.jpg',
  'https://telegra.ph/file/7e895b5b933226a07558a.jpg',
  'https://telegra.ph/file/f9d9f0da337512a1b1882.jpg',
  'https://telegra.ph/file/09ff5bfce02f1f78e3861.jpg',
  'https://telegra.ph/file/4ad840d401ab1f90444df.jpg',
  'https://telegra.ph/file/7b4bdcad3dde870355c94.jpg',
  'https://telegra.ph/file/f69a5beaca50fc52a4a71.jpg',
  'https://telegra.ph/file/411d7cdee24669e167adb.jpg',
  'https://telegra.ph/file/36a63288e27e88e2f8e10.jpg',
  'https://telegra.ph/file/1ac7657a5e7b354cd9991.jpg',
  'https://telegra.ph/file/14161eab0c1d919dc3218.jpg',
  'https://telegra.ph/file/810411b9128fe11dd639a.jpg',
  'https://telegra.ph/file/5fe7e98533754b007e7a1.jpg',
   'https://telegra.ph/file/bf303b19b9834f90e9617.jpg',
  'https://telegra.ph/file/36ef2b807251dfccd17c2.jpg',
  'https://telegra.ph/file/bcc34403d16de829ea5d2.jpg',
  'https://telegra.ph/file/5c6b7615662fb53a39e53.jpg',
  'https://telegra.ph/file/1a8183eff48671ea265c2.jpg',
  'https://telegra.ph/file/f9745dcd22f67cbc62e08.jpg',
  'https://telegra.ph/file/02219f503317b0596e101.jpg',
  'https://telegra.ph/file/470c8ec30400a73d03207.jpg',
  'https://telegra.ph/file/c94fa8ed20f2c0cf16786.jpg',
  'https://telegra.ph/file/1b02a1ca6a39e741faec7.jpg',
  'https://telegra.ph/file/eea58bf7043fd697cdb43.jpg',
  'https://telegra.ph/file/ee3db7facdfe73c8df05a.jpg',
  'https://telegra.ph/file/d45b4e4af4f2139507f8c.jpg',
  'https://telegra.ph/file/d176e7fc8720f98f6b182.jpg',
  'https://telegra.ph/file/ce1e072829d1fa5d99f5f.jpg',
  'https://telegra.ph/file/a947933701be6d579c958.jpg',
  'https://telegra.ph/file/9027e5a464ec88e8ab5c1.jpg',
  'https://telegra.ph/file/049a8c611a838ea2f6daa.jpg',
  'https://telegra.ph/file/37b35fbc7e2ee73482ee1.jpg',
  'https://telegra.ph/file/9bcfade24ae85cd417f06.jpg',
  'https://telegra.ph/file/ac0c711585f4300c54355.jpg',
];
global.pack = ['https://telegra.ph/file/957fe4031132ef90b66ec.jpg',
  'https://telegra.ph/file/c4b85bd53030cb648382f.jpg',
  'https://telegra.ph/file/df56f8a76145df9c923ad.jpg',
  'https://telegra.ph/file/d5d1c2c710c4b5ee8bc6c.jpg',
  'https://telegra.ph/file/d0c0cd47e87535373ab68.jpg',
  'https://telegra.ph/file/651a5a9dc96c97c8ef8fc.jpg',
  'https://telegra.ph/file/f857ae461ceab18c38de2.jpg',
  'https://telegra.ph/file/5d2a2aeff5e6fbd229eff.jpg',
  'https://telegra.ph/file/b93573531f898ea875dd0.jpg',
  'https://telegra.ph/file/c798b3959f84d345b0f25.jpg',
  'https://telegra.ph/file/de820647f8cabce533557.jpg',
  'https://telegra.ph/file/e105097d5fadf3e522eb5.jpg',
  'https://telegra.ph/file/8592e352a9ee6c7244737.jpg',
  'https://telegra.ph/file/bb9c7d879b7dc1d86a2ce.jpg',
  'https://telegra.ph/file/83f108601e6105446ad1f.jpg',
  'https://telegra.ph/file/2a6bff14e53ed2533ad25.jpg',
  'https://telegra.ph/file/e37d74aeccc5bdfd6be3e.jpg',
  'https://telegra.ph/file/ca984650af06b951e961d.jpg',
  'https://telegra.ph/file/ebb3ac7f7498dd09f6afc.jpg',
  'https://telegra.ph/file/6192305a24ffb8fa30942.jpg',
  'https://telegra.ph/file/ee67c17d0043b98dc757e.jpg',
  'https://telegra.ph/file/6ae756b686cd2b5950721.jpg',
  'https://telegra.ph/file/b1e1da38d897d117c2aa9.jpg',
  'https://telegra.ph/file/6b759437dc8b863c2fa19.jpg',
  'https://telegra.ph/file/960d8c268aecb5eb117f0.jpg',
  'https://telegra.ph/file/d0dd518bdd147cb10b0b5.jpg',
  'https://telegra.ph/file/31f2d59b5cd68ec5acb21.jpg',
  'https://telegra.ph/file/14ab9bd02f24e0f1a1a03.jpg',
  'https://telegra.ph/file/e02bf6bc9227f7f8b7e2a.jpg',
  'https://telegra.ph/file/ab55fca1d6b602b1a69df.jpg',
  'https://telegra.ph/file/42105cac3666b37da3d1c.jpg',
];
let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
delete require.cache[file];
require(file);
});
};