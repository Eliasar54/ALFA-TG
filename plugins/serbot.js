const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Telegraf } = require('telegraf');

const cfgPath = './config/sub-bot.json';
let bots = {};

if (fs.existsSync(cfgPath)) {
try {
bots = require(cfgPath);
} catch (err) {
bots = {};
}
} else {
fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
fs.writeFileSync(cfgPath, JSON.stringify(bots, null, 4));
}

function saveBots() {
try {
fs.writeFileSync(cfgPath, JSON.stringify(bots, null, 4));
} catch (err) {}
}

function startBot(token, userId, conn = null) {
try {
const proc = spawn('node', ['./sub-bot.js', token], {
stdio: 'inherit',
detached: true,
});
proc.unref();
if (conn) {
conn.reply(`✅ Sub-bot lanzado con éxito.`, {
reply_to_message_id: conn.message.message_id,
});
}
bots[token] = { token, user: userId };
saveBots();
} catch (err) {
if (conn) {
conn.reply('❌ Error al iniciar el sub-bot.', {
reply_to_message_id: conn.message.message_id,
});
}
}
}

function stopBot(token, conn) {
delete bots[token];
saveBots();
conn.reply(`✅ Sub-bot eliminado.`, {
reply_to_message_id: conn.message.message_id,
});
}

async function getBotName(token) {
try {
const bot = new Telegraf(token);
const info = await bot.telegram.getMe();
return `@${info.username}`;
} catch {
return 'Desconocido';
}
}

function restartSubBots() {
for (const token in bots) {
startBot(token, bots[token].user);
}
}

module.exports = (bot) => {
bot.command('serbot', async (conn) => {
if (conn.chat.type !== 'private') {
return conn.reply('❌ Solo en privado.', {
reply_to_message_id: conn.message.message_id,
});
}
const args = conn.message.text.split(' ').slice(1);
if (args.length === 0) {
return conn.reply('❌ Proporciona el token. Ejemplo: /serbot <TOKEN>', {
reply_to_message_id: conn.message.message_id,
});
}
const token = args[0];
if (bots[token]) {
return conn.reply('⚠️ Este sub-bot ya está registrado.', {
reply_to_message_id: conn.message.message_id,
});
}
startBot(token, conn.from.id, conn);
});

bot.command('tutorialserbot', async (conn) => {
    const tutorial = `
╔💡 𝐓𝐔𝐓𝐎𝐑𝐈𝐀𝐋 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 💡╗
║                                                       
║  📌 <b>Cómo crear y administrar Sub-Bots</b> 🤖       
║                                                       
╟🛠️ <i>Paso a paso detallado</i> 🛠️
╚═════════════════╝
╔<b>🔷 1. Obtener Token de Bot</b>╗
│ 1. Abre <a href="https://t.me/BotFather">@BotFather</a> en Telegram              
│ 2. Envía: <code>/newbot</code>                          
│ 3. Elige nombre y username (debe terminar en <i>bot</i>) 
│ 4. <b>Guarda el token</b> recibido:                      
│    <code>123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</code> 
╚═════════════════╝

╔═══<b>🔷 2. Iniciar Sub-Bot</b>═══╗
│ Usa el comando:                             
│ <code>/serbot &lt;TOKEN&gt;</code>         
│                                             
│ 🎯 <i>Ejemplo:</i>                       
│ <code>/serbot 123456:ABC-DEF...</code> 
╚═════════════════╝

╔<b>🔷 3. Detener Sub-Bot</b>╗
│ Usa el comando:                           
│ <code>/stopsubbot &lt;TOKEN&gt;</code>      
│                                             
│ 🚫 <i>Solo el creador puede detenerlo</i> 
╚═════════════════╝

╔<b>🔷 4. Listar Bots Activos</b>╗
│ Consulta con:                               
│ <code>/listbots</code>                        
│                                             
│ 📜 <i>Muestra todos tus bots en funcionamiento</i>
╚═════════════════╝
╔═⚠️<b>ADVERTENCIAS</b>⚠️═╗
║ • No compartas tu token 🔐.        
║ • Máximo 1 sub-bot por usuario👤  
║ • Usa tokens válidos de @BotFather
╚═════════════════╝

🚀 <i>¡©2024 SUB-BOT/TG by EliasarYT!</i> ✨
    `;
    
    conn.reply(tutorial, { 
        parse_mode: 'HTML', 
        disable_web_page_preview: true, 
        reply_to_message_id: conn.message.message_id 
    });
});

bot.command('stopsubbot', async (conn) => {
if (conn.chat.type !== 'private') {
return conn.reply('❌ Solo en privado.', {
reply_to_message_id: conn.message.message_id,
});
}
const args = conn.message.text.split(' ').slice(1);
if (args.length === 0) {
return conn.reply('❌ Proporciona el token. Ejemplo: /stopsubbot <TOKEN>', {
reply_to_message_id: conn.message.message_id,
});
}
const token = args[0];
const botData = bots[token];
if (!botData) {
return conn.reply('❌ Sub-bot no encontrado.', {
reply_to_message_id: conn.message.message_id,
});
}
if (botData.user !== conn.from.id) {
return conn.reply('❌ No tienes permisos.', {
reply_to_message_id: conn.message.message_id,
});
}
stopBot(token, conn);
});

bot.command('listbots', async (conn) => {
const total = Object.keys(bots).length;
if (total === 0) {
return conn.reply('❌ No hay sub-bots registrados.', {
reply_to_message_id: conn.message.message_id,
});
}
let msg = `📋 Total de sub-bots: ${total}\nBots:\n`;
for (const token in bots) {
const name = await getBotName(token);
msg += `- ${name}\n`;
}
conn.reply(msg, {
reply_to_message_id: conn.message.message_id,
});
});
let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
delete require.cache[file];
require(file)(bot);
});
restartSubBots();
};