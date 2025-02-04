const { Telegraf } = require('telegraf');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require("./settings");

const configPath = './config/config.json';
let cfg = { token: '' };

if (fs.existsSync(configPath)) {
try {
cfg = require(configPath);
} catch (err) {
console.error(chalk.red('❌ Error al cargar configuración:'), err);
cfg = { token: '' };
}
}

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

checkToken();

function checkToken() {
if (!cfg.token || cfg.token.trim() === '') {
showMenu();
} else {
startBot();
}
}

function showMenu() {
console.log(chalk.magentaBright('Seleccione una opción:'));
console.log(chalk.cyanBright('1. Ver tutorial de cómo obtener el token'));
console.log(chalk.cyanBright('2. Ingresar el token directamente\n'));

rl.question(chalk.yellow('Ingrese una opción (1 o 2): '), (opt) => {
if (opt === '1') showTutorial();
else if (opt === '2') inputToken();
else {
console.log(chalk.red('Opción inválida. Intente de nuevo.'));
showMenu();
}
});
}

function showTutorial() {
console.log(chalk.blue(`
1. Busca BotFather en Telegram y ábrelo.
2. Escribe /newbot y sigue las instrucciones para nombrar tu bot.
3. Recibirás un token al finalizar.
(ingréselo cuando se le solicite)
`));
showMenu();
}

function inputToken() {
rl.question(chalk.green('Ingrese su token de bot: '), (token) => {
if (token.trim() === '') {
console.log(chalk.red('El token no puede estar vacío. Intente de nuevo.'));
inputToken();
} else {
cfg.token = token;
try {
fs.writeFileSync(configPath, JSON.stringify(cfg, null, 4));
console.log(chalk.green('✅ Token guardado correctamente.'));
} catch (err) {
console.error(chalk.red('❌ Error al guardar token:'), err);
}
startBot();
}
});
}

async function startBot() {
let bot;

try {
bot = new Telegraf(cfg.token);
} catch (err) {
console.error(chalk.red('❌ Error al inicializar bot:'), err);
return;
}

figlet.text('ALFA TG', { font: 'ANSI Shadow' }, (err, data) => {
if (!err) {
console.log(chalk.blueBright(data));
console.log(chalk.greenBright('             EliasarYT\n'));
}
});

try {
const pluginsPath = path.join(__dirname, 'plugins');
const pluginFiles = fs.readdirSync(pluginsPath);

pluginFiles.forEach((file) => {
try {
const plugin = require(`./plugins/${file}`);
if (typeof plugin === 'function') plugin(bot);
} catch (err) {
console.error(chalk.red(`❌ Error al cargar plugin ${file}:`), err);
}
});
} catch (err) {
console.error(chalk.red('❌ Error al leer plugins:'), err);
}

try {
const botInfo = await bot.telegram.getMe();
const botUsername = botInfo.username;

console.log(chalk.green('✅ Bot iniciado con éxito'));
console.log(chalk.cyan(`🌐 Enlace para iniciar el bot: https://t.me/${botUsername}`));
} catch (err) {
console.error(chalk.red('❌ Error al obtener información del bot:'), err);
return;
}

bot.on('text', (conn) => {
try {
const isGroup = conn.chat.type !== 'private';
const groupName = isGroup ? conn.chat.title || 'Desconocido' : 'N/A';

console.log(chalk.hex('#0088cc')(`
🌟 ${chalk.hex('#34A4F4').bold('TELEGRAM INFO')} 🌟
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

bot.launch()
.catch((err) => console.error(chalk.red('❌ Error al iniciar bot:'), err));

setInterval(() => cleanTemp(), 2 * 60 * 1000);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

rl.close();
}

function cleanTemp() {
const tempPath = path.join(__dirname, 'temp');
fs.readdir(tempPath, (err, files) => {
if (err) {
console.error(chalk.red('❌ Error al limpiar carpeta temp:'), err);
return;
}

files.forEach((file) => {
fs.unlink(path.join(tempPath, file), (err) => {
if (err) console.error(chalk.red(`❌ Error al eliminar archivo ${file}:`), err);
else console.log(chalk.green(`✅ Archivo eliminado: ${file}`));
});
});
});
}