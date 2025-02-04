const { Telegraf } = require('telegraf');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const localtunnel = require('localtunnel');
const os = require('os');
const si = require('systeminformation');
const { exec } = require('child_process');
require("./settings");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
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

function getIPv4() {
const interfaces = os.networkInterfaces();
for (const iface of Object.values(interfaces)) {
for (const config of iface) {
if (config.family === 'IPv4' && !config.internal) {
return config.address;
}
}
}
return 'No disponible';
}

async function startBot() {
const bot = new Telegraf(cfg.token);

figlet.text('ALFA TG', { font: 'ANSI Shadow' }, (err, data) => {
if (!err) console.log(chalk.blueBright(data), chalk.greenBright('             EliasarYT\n'));
});

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

const { io, tunnelUrl } = await startMonitoringServer(bot);

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

io.emit('newMessage', { user: conn.from.username || 'Desconocido', text: conn.message.text });
} catch (err) {
console.error(chalk.red('❌ Error al procesar mensaje:'), err);
}
});

bot.launch().catch((err) => console.error(chalk.red('❌ Error al iniciar bot:'), err));

const botInfo = await bot.telegram.getMe();
const botUsername = botInfo.username;
console.log(chalk.green('✅ Bot iniciado con éxito'));
console.log(chalk.cyan(`🌐 Enlace para iniciar el bot: https://t.me/${botUsername}`));
console.log(chalk.blueBright(`🌍 Web de monitoreo en: ${tunnelUrl}`));
exec('curl https://loca.lt/mytunnelpassword', (error, stdout, stderr) => {
if (error) {
console.log(chalk.red(`❌ Error al ejecutar curl: ${error.message}`));
return;
}
if (stderr) {
// console.log(chalk.yellow(`⚠️ stderr: ${stderr}`));
}
if (stdout) {
console.log(chalk.green(`✅ contraseña del monitor:\n${stdout}`));
}
});
}
async function startMonitoringServer(bot) {
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AlfaBot Monitor</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<style>
body {
background: linear-gradient(135deg, #1a1a2e, #16213e);
color: white;
text-align: center;
font-family: 'Arial', sans-serif;
padding: 20px;
animation: fadeIn 1s ease-in-out;
}

.container {
max-width: 900px;
margin: auto;
}

.card {
background: rgba(50, 50, 100, 0.9);
padding: 15px;
margin: 10px 0;
color: #00d9ff;
border-radius: 10px;
box-shadow: 0px 0px 10px #00d9ff;
transition: transform 0.3s ease-in-out;
}

.card:hover {
transform: scale(1.05);
}

.log-console {
background: black;
color: #0f0;
padding: 10px;
height: 200px;
overflow-y: auto;
font-size: 0.9em;
text-align: left;
border: 2px solid #00d9ff;
box-shadow: 0px 0px 15px #00d9ff;
animation: flicker 1.5s infinite alternate;
}

h1 {
font-size: 28px;
color: #fff;
text-shadow: 0px 0px 10px #ff00ff;
animation: glow 1.5s infinite alternate;
}

@keyframes fadeIn {
from { opacity: 0; }
to { opacity: 1; }
}

@keyframes glow {
from { text-shadow: 0px 0px 10px #ff00ff; }
to { text-shadow: 0px 0px 20px #ff00ff; }
}

@keyframes flicker {
0% { box-shadow: 0px 0px 15px #00d9ff; }
100% { box-shadow: 0px 0px 30px #00d9ff; }
}

@media (max-width: 768px) {
body { padding: 10px; }
.card { padding: 10px; }
h1 { font-size: 24px; }
}
</style>
</head>
<body>
<div class="container">
<h1 class="mt-3"><i class="fas fa-robot"></i> ALFA-TG Monitor</h1>

<div class="card">
<h3><i class="fas fa-server"></i> Servidor: <span id="ipv4">Cargando...</span></h3>
</div>

<div class="card">
<h3><i class="fas fa-microchip"></i> CPU: <span id="cpu">Cargando...</span></h3>
</div>

<div class="card">
<h3><i class="fas fa-memory"></i> Memoria: <span id="memory">Cargando...</span></h3>
</div>

<div class="card">
<h3><i class="fas fa-comments"></i> Mensajes Recibidos:</h3>
<div id="messages"></div>
</div>

<div class="card">
<h3><i class="fas fa-terminal"></i> Consola:</h3>
<div class="log-console" id="console-log"></div>
</div>
</div>

<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();

socket.on('sysinfo', (data) => {
document.getElementById('ipv4').textContent = data.ip;
document.getElementById('cpu').textContent = data.cpu;
document.getElementById('memory').textContent = data.memory;
});

socket.on('newMessage', (data) => {
const div = document.createElement('div');
div.innerHTML = '<strong><i class="fas fa-user"></i> ' + data.user + ':</strong> ' + data.text;
div.style.padding = "5px";
div.style.animation = "fadeIn 0.5s ease-in-out";
document.getElementById('messages').appendChild(div);
});

socket.on('consoleLog', (msg) => {
const logDiv = document.getElementById('console-log');
logDiv.innerHTML += "<i class='fas fa-angle-right'></i> " + msg + '<br>';
logDiv.scrollTop = logDiv.scrollHeight;
});
</script>
</body>
</html>
`);
});

setInterval(async () => {
const cpu = await si.cpu();
const memory = await si.mem();
io.emit('sysinfo', {
ip: getIPv4(),
cpu: cpu.brand + " " + cpu.speed + "GHz",
memory: (memory.used / 1024 / 1024 / 1024).toFixed(2) + " GB / " + (memory.total / 1024 / 1024 / 1024).toFixed(2) + " GB"
});
}, 1000);

const PORT = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
server.listen(PORT);

const tunnel = await localtunnel({ port: PORT, subdomain: `alfa-tg-${Math.random().toString(36).substring(7)}` });

return { io, tunnelUrl: tunnel.url };
}