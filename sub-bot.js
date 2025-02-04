const { Telegraf } = require('telegraf');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
require("./index");
global.isSubBot = true;
const token = process.argv[2];
if (!token) {
console.error('❌ Token no proporcionado para el sub-bot.');
process.exit(1);
}
const subBot = new Telegraf(token);
const pluginsPath = path.join(__dirname, 'plugins');
if (fs.existsSync(pluginsPath)) {
const pluginFiles = fs.readdirSync(pluginsPath).filter((file) => file !== 'serbot.js' && file !== 'start.js');
if (pluginFiles.length > 0) {
pluginFiles.forEach((file) => {
try {
const plugin = require(`./plugins/${file}`);
if (typeof plugin === 'function') {
plugin(subBot);
//console.log(`✅ Plugin cargado: ${file}`);
} else {
console.warn(`⚠️ El archivo ${file} no exporta una función válida.`);
}
} catch (error) {
console.error(`❌ Error al cargar el plugin "${file}":`, error);
}
});
} else {
console.warn('⚠️ No se encontraron plugins en la carpeta "plugins".');
}
} else {
console.warn('⚠️ La carpeta "plugins" no existe.');
}
subBot.start((conn) => {
conn.replyWithHTML(
`🚀 <b>¡Hola ${conn.from.first_name}!</b>\n\n` +
`🤖 Soy un <u>sub-bot</u> lanzado desde Alfa TG\n` +
`🔍 Usa <code>/menu</code> para más información\n\n` +
`<i>Powered by</i> <b>${botname}</b> 🌈`,
{ reply_to_message_id: conn.message.message_id }
);
});

subBot.command('serbot', async (conn) => {
conn.replyWithHTML(
`⚠️ <b>COMANDO RESTRINGIDO</b> ⚠️\n\n` +
`🔒 Solo el bot principal puede activar el sub-bot\n` +
`🛡️ Bot principal: <code>@ALFA_TG12_BOT</code>\n` +
`✨ Contacta con el equipo de soporte para más detalles`,
{ 
reply_to_message_id: conn.message.message_id,
disable_web_page_preview: true
}
);
});
//subBot.on('text', (conn) => conn.reply(`Recibí tu mensaje: "${conn.message.text}"`));
subBot.on('text', (conn) => {
try {
const isGroup = conn.chat.type !== 'private';
const groupName = isGroup ? conn.chat.title || 'Desconocido' : 'N/A';

console.log(chalk.hex('#0088cc')(`
🌟 ${chalk.hex('#34A4F4').bold('TELEGRAM INFO SUB-BOT')} 🌟
${chalk.hex('#0088cc')('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}
${chalk.hex('#34A4F4')('┃')} 🧑‍💻 Usuario: ${chalk.hex('#FFD700')(conn.from.username || 'Desconocido')} 
${chalk.hex('#34A4F4')('┃')} 🏷️ Nombre: ${chalk.hex('#32CD32')(conn.from.first_name || 'Desconocido')}
${chalk.hex('#34A4F4')('┃')} 🏠 Grupo: ${chalk.hex('#FFA500')(groupName || 'N/A')}
${chalk.hex('#34A4F4')('┃')} ❓ Es grupo?: ${chalk.hex(isGroup ? '#00FF00' : '#FF4500')(isGroup ? '✔️' : '❌')}
${chalk.hex('#0088cc')('┣━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}
${chalk.hex('#34A4F4')('┃')} 💬 Mensaje: ${chalk.hex('#ADD8E6')(conn.message.text)}
${chalk.hex('#0088cc')('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}
`));
} catch (err) {
console.error(chalk.red('❌ Error al procesar mensaje:'), err);
}
});
subBot.launch()
.then(() => console.log(`✅ Sub-bot lanzado con token: ${token}`))
.catch((err) => {
console.error('❌ Error al lanzar el sub-bot:', err);
process.exit(1);
});

process.once('SIGINT', () => subBot.stop('SIGINT'));
process.once('SIGTERM', () => subBot.stop('SIGTERM'));
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})