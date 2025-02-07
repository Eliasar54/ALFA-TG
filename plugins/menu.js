const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const si = require('systeminformation');
const moment = require('moment-timezone');
const { Markup } = require('telegraf');
require("../settings");

const prefixes = ['!', '.', '/', '#', '@', '$', '%', '^', '&', '*', '+', '-', '=', '~'];
const getCommandRegex = (cmd) => new RegExp(`^(${prefixes.map(p => `\\${p}`).join('|')})${cmd}$`, 'i');
const configFile = path.resolve(__dirname, '../config/menu.json');

const getConfig = () => {
try {
if (!fs.existsSync(configFile)) {
fs.writeFileSync(configFile, JSON.stringify({}));
}
const data = fs.readFileSync(configFile, 'utf-8');
return JSON.parse(data);
} catch (error) {
console.error(chalk.red("Error al leer el archivo de configuración: "), error);
return {};
}
};

const saveConfig = (config) => {
try {
fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
} catch (error) {
console.error(chalk.red("Error al guardar la configuración: "), error);
}
};

const getBio = async (conn) => {
try {
const cpuSpeed = (await si.cpu()).speed + " GHz";
const memory = await si.mem();
const totalMemory = (memory.total / 1024 / 1024).toFixed(2) + "MB";
const usedMemory = (memory.active / 1024 / 1024).toFixed(2) + "MB";
const uptime = moment.duration(await si.time().uptime, 'seconds').humanize();
const platform = await si.osInfo();
const host = platform.hostname;
const config = getConfig();
const userConfig = config[conn.from.id] || {};
const customZone = userConfig.timezone || 'America/Managua';
const userMoment = moment().tz(customZone);
const paisTime = userMoment.format('dddd, DD MMMM YYYY, HH:mm:ss Z');
const userHour = userMoment.hour();

let greeting = '';
if (userHour >= 5 && userHour < 12) {
greeting = `Buenos días 🌅: ${conn.from.username ? `@${conn.from.username}` : conn.from.first_name}`;
} else if (userHour >= 12 && userHour < 18) {
greeting = `Buenas tardes 🌇: ${conn.from.username ? `@${conn.from.username}` : conn.from.first_name}`;
} else {
greeting = `Buenas noches 🌙: ${conn.from.username ? `@${conn.from.username}` : conn.from.first_name}`;
}
const botInfo = await bot.telegram.getMe();
const botUsername = botInfo.username;
const owner = "@EliasarYT";
const botType = global.isSubBot ? "ѕυв-вфт 💫" : "вфт фғιcιal 👾";
return `
╭━〔 ALFA-TG 〕━⊱
┃ ➤ Soy un: ${botType}
┃ ➤ Fecha (${paisTime}):
┃ ➤ Prefijo: /  
┃ ➤ Velocidad: ${cpuSpeed}  
┃ ➤ Memoria: ${usedMemory} / ${totalMemory}  
┃ ➤ Host: ${host}  
┃ ➤ Plataforma: ${platform.platform}  
┃ ➤ Uptime: ${uptime}  
┃ ➤ ${greeting}  
┃ ➤ Owner: (${owner})  
┃ ➤ pregúntame algo ejemplo @${botUsername} cuanto es 2+1
┃ 「sσρσrτє」
┃ ➤ /report (reporta un error)
┃ ➤ /tutorialserbot (tutorial de como ser un sub bot)
┃ ➤ /creador (contacto de owener)
┃ ➤ /settime (pon tu hora personalidada)
╰━━━━━━━━━━━⊱`;
} catch (error) {
console.error(chalk.red("Error al obtener la información base: "), error);
return "Hubo un problema al obtener los datos. Por favor, inténtalo de nuevo más tarde.";
}
};

const sendMenu = async (conn, menuContent) => {
try {
const bio = await getBio(conn);
let menu = `${bio}\n${menuContent}\nᵉˢᶜʳᶤᵇᵉ ᵉˡ ᶜᵒᵐᵃᶰᵈᵒ ᵈᵉˡ ᵐᵉᶰᵘ ᵐᵃᶰᵘᵃˡᵐᵉᶰᵗᵉ`;

await conn.replyWithPhoto({ source: global.img }, {
caption: menu,
parse_mode: 'Markdown',
reply_to_message_id: conn.message.message_id,
...Markup.inlineKeyboard([
[Markup.button.url('📞 SOPORTE', 'https://t.me/EliasarYT')],
[Markup.button.url('✅ CANAL', 'https://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36')],
]),
});
} catch (error) {
console.error(chalk.red("Error al procesar el menú: "), error);
await conn.reply("Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.", {
reply_to_message_id: conn.message.message_id
});
}
};
module.exports = (bot) => {
bot.hears(getCommandRegex('menu'), async (conn) => {
let menuContent = `
╭━〔𝙈𝙀𝙉𝙐 𝙋𝙍𝙄𝙉𝘾𝙄𝙋𝘼𝙇 〕━⊱
┃ ➤ /menu1 (menu RPG)
┃ ➤ /menu2 (menu grupos)
┃ ➤ /menu3 (menu Dl)
┃ ➤ /menu18 (menu para adultos)
┃ ➤ /menu4 (menu de buscadores)
┃ ➤ /menu8 (cómando avansados ptrodactyl panel)
┃ ➤ /menu11 (menu del owener)
╰━━━━━━━━━━━⊱`;
await sendMenu(conn, menuContent);
});

bot.hears(getCommandRegex('menu3'), async (conn) => {
let menuContent = `
╭━〔𝘾𝙊𝙈𝘼𝙉𝘿𝙊𝙎 𝘿𝙡〕━⊱
┃ ➤ /play
┃ ➤ /fb
┃ ➤ /tiktok
┃ ➤ /apkdl
┃ ➤ /xnxxdl
┃ ➤ /pinterest
┃ ➤ /playaudio
┃ ➤ /spotify
╰━━━━━━━━━━━⊱`;
await sendMenu(conn, menuContent);
});

bot.hears(getCommandRegex('menu2'), async (conn) => {
let menuContent = `
╭━〔𝘾𝙊𝙈𝘼𝙉𝘿𝙊𝙎 𝙂𝙍𝙐𝙋𝙊𝙎〕━⊱
┃ ➤ /pin
┃ ➤ /unpin
┃ ➤ /ban
┃ ➤ /welcome 
┃ ➤ /antilink
┃ ➤ /modocaliente 
┃ ➤ /admins
╰━━━━━━━━━━━⊱`;
await sendMenu(conn, menuContent);
});

bot.hears(getCommandRegex('menu1'), async (conn) => {
let menuContent = `
╭━〔𝘾𝙊𝙈𝘼𝙉𝘿𝙊𝙎 𝙍𝙋𝙂〕━⊱
┃ ➤ /minar
┃ ➤ /lb
┃ ➤ /nivel
┃ ➤ /reg  
┃ ➤ /perfil  
┃ ➤ /myns
┃ ➤ /unreg
┃ ➤ /cazar  
┃ ➤ /buy 
┃ ➤ /buyall
┃ ➤ /prest
┃ ➤ /rob 
┃ ➤ /si 
┃ ➤ /deudas
┃ ➤ /pag
┃ ➤ /pvp
┃ ➤ /rw   
┃ ➤ /c 
┃ ➤ /mycharacters
┃ ➤ /available
┃ ➤ /explorar 
╰━━━━━━━━━━━⊱`;
await sendMenu(conn, menuContent);
});

bot.hears(getCommandRegex('menu2'), async (conn) => {
let menuContent = `
╭━〔𝘾𝙊𝙈𝘼𝙉𝘿𝙊𝙎 𝙄𝘼〕━⊱
┃ ➤ /dalle
┃ ➤ /ia
┃ ➤ /bing
╰━━━━━━━━━━━⊱`;
await sendMenu(conn, menuContent);
});

bot.hears(getCommandRegex('menu18'), async (conn) => {
let menuContent = `
╭━〔𝘾𝙊𝙈𝘼𝙉𝘿𝙊𝙎 𝙋𝘼𝙍𝘼 𝘼𝘿𝙐𝙇𝙏𝙊𝙎〕━⊱
┃ ➤ /hentai
┃ ➤ /tetas
┃ ➤ /packgirl
┃ ➤ /pack
╰━━━━━━━━━━━⊱`;
await sendMenu(conn, menuContent);
});

bot.hears(getCommandRegex('menu8'), async (conn) => {
let menuContent = `
╭━〔𝘾𝙊𝙈𝘼𝙉𝘿𝙊𝙎 𝙥𝙩𝙧𝙤𝙙𝙖𝙘𝙩𝙮𝙡〕━⊱
┃ ➤ /status
┃ ➤ /users 
┃ ➤ /backup
╰━━━━━━━━━━━⊱`;
await sendMenu(conn, menuContent);
});

const setTimezone = (conn) => {
const config = getConfig();
const input = conn.message.text.split(' ');
const zone = input[1];

if (!zone || !moment.tz.zone(zone)) {
conn.reply("Por favor, ingresa una zona horaria válida como 'America/Managua'.", {
reply_to_message_id: conn.message.message_id
});
return;
}

config[conn.from.id] = { timezone: zone };
saveConfig(config);

conn.reply(`Tu zona horaria personalizada es ${zone}. Ahora el saludo será ajustado a tu zona horaria.`, {
reply_to_message_id: conn.message.message_id
});
};

bot.command('settime', setTimezone);

const file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
const fileName = path.basename(file);
console.log(chalk.greenBright.bold(`El archivo '${fileName}' fue actualizado exitosamente.`));
delete require.cache[file];
require(file);
});
}
