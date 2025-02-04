const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const db = require('../libs/database');
const si = require('systeminformation');
require("../settings");

module.exports = (bot) => {
bot.command('ping', async (conn) => {
try {
const startTime = Date.now();

const systemData = await si.get({
osInfo: '*',
cpu: '*',
mem: '*',
diskLayout: '*',
currentLoad: '*',
system: '*',
uptime: '*',
processes: '*',
versions: '*'
});

const formatValue = (value, unit = '') => value ? `${value}${unit}` : 'Desconocido';
const formatBytesToGB = (bytes) => bytes ? (bytes / 1024 ** 3).toFixed(2) + ' GB' : '0.00 GB';

const formatUptimeDetailed = (seconds) => {
if (isNaN(seconds) || seconds <= 0) return "Desconocido";
const days = Math.floor(seconds / 86400);
const hours = Math.floor((seconds % 86400) / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
return [days > 0 && `${days}d`, `${hours}h`, `${minutes}m`].filter(Boolean).join(' ');
};

const data = db.get();
const totalUsers = data.users ? Object.keys(data.users).length : 0;
const user = conn.message.from;
const username = user.username ? `@${user.username}` : 'Usuario';
const totalDiskSize = systemData.diskLayout.reduce((acc, disk) => acc + (disk.size || 0), 0);
const serverUptime = formatUptimeDetailed(systemData.uptime);
const botUptime = formatUptimeDetailed(process.uptime());
const responseTime = Date.now() - startTime;
const cpuLoad = systemData.currentLoad.currentLoad.toFixed(2);
const ramUsage = ((systemData.mem.used / systemData.mem.total) * 100).toFixed(1);

const systemInfo = `
┏┅┅▣ INFORME DEL SISTEMA ▣┅≫
┇Hola ${username}
┇❐ Servidor: ${formatValue(systemData.system.manufacturer)} ${formatValue(systemData.system.model)}
┇❐ Hostname: ${formatValue(systemData.system.hostname)}
┇❐ Plataforma: ${formatValue(systemData.osInfo.platform)} (${formatValue(systemData.osInfo.arch)})
┇❐ Distribución: ${formatValue(systemData.osInfo.distro)} ${formatValue(systemData.osInfo.release)}
┇❐ Kernel: ${formatValue(systemData.osInfo.kernel)}
┇
┇⚙️ Hardware:
┇❐ CPU: ${formatValue(systemData.cpu.manufacturer)} ${formatValue(systemData.cpu.brand)}
┇❐ Núcleos: ${systemData.cpu.cores} (${systemData.cpu.physicalCores} físicos)
┇❐ Velocidad: ${formatValue(systemData.cpu.speed, ' GHz')}
┇❐ RAM Usada: ${formatBytesToGB(systemData.mem.used)} / ${formatBytesToGB(systemData.mem.total)}
┇❐ Almacenamiento: ${formatBytesToGB(totalDiskSize)}
┇
┇📊 Rendimiento:
┇❐ Carga CPU: ${cpuLoad}%
┇❐ Carga RAM: ${ramUsage}%
┇❐ Procesos: ${systemData.processes.all}
┇❐ T. Respuesta: ${responseTime}ms
┇
┇⏳ Tiempos de actividad:
┇❐ Servidor: ${serverUptime}
┇❐ Bot: ${botUptime}
┇
┇👤 Usuarios registrados: ${totalUsers}
┇🌐 Versión Node.js: ${process.version}
┇🤖 Versión Bot: ${vs}
┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅≫`.trim();

const imagePath = path.join(__dirname, '../media/menu.jpg');
conn.replyWithPhoto({ source: imagePath }, {
caption: systemInfo,
parse_mode: 'Markdown',
reply_to_message_id: conn.message.message_id
});

} catch (error) {
console.error(error);
conn.reply('❌ Error al obtener la información del sistema', { reply_to_message_id: conn.message.message_id });
}
});

const file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.greenBright.bold(`Actualizado: ${path.basename(file)}`));
delete require.cache[file];
require(file);
});
};