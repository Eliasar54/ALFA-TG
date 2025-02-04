const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const TicTacToe = require('../libs/tictactoe');
const axios = require('axios');
const crypto = require('crypto');
const db = require('../libs/database');
const { checkLevelUp } = require('../libs/level');
const { obtenerRango } = require('../libs/rangos');
require("../settings")
module.exports = (bot) => {
const cooldowns = new Map();

const addcooldown = (command, userId, cooldowntime) => {
const now = Date.now();
const key = `${command}_${userId}`;
cooldowns.set(key, now + cooldowntime);
};

const checkcooldown = (command, userId) => {
const now = Date.now();
const key = `${command}_${userId}`;
if (cooldowns.has(key) && now < cooldowns.get(key)) {
return Math.ceil((cooldowns.get(key) - now) / 1000);
}
return 0;
};

const getuserdata = (conn) => {
const userId = conn.from.id;
const data = db.get();
if (!data.users || !data.users[userId]) {
conn.reply('❌ debes registrarte primero con /reg.', { reply_to_message_id: conn.message.message_id });
return null;
}
return { data, userId };
};

bot.command('minar', (conn) => {
const userdata = getuserdata(conn);
if (!userdata) return;
const { data, userId } = userdata;
const cooldowntime = 2 * 60 * 1000;
const cooldownremaining = checkcooldown('minar', userId);
if (cooldownremaining > 0) {
return conn.replyWithMarkdown(`⛏️ *debes esperar ${cooldownremaining} segundos antes de minar de nuevo.*`, { reply_to_message_id: conn.message.message_id });
}
const xpgained = Math.floor(Math.random() * 50) + 10;
data.users[userId].xp += xpgained;
if (checkLevelUp(data.users[userId])) {
const { rangoActual, estiloactual } = obtenerRango(data.users[userId].level);
conn.replyWithMarkdown(`🎉 *felicidades ${data.users[userId].name}, subiste al nivel ${data.users[userId].level}!*\n🌟 tu nuevo rango es: ${estiloactual} *${rangoActual}*`, {
reply_to_message_id: conn.message.message_id
});
} else {
conn.replyWithMarkdown(`⛏️ has minado y ganado ${xpgained} xp. total: ${data.users[userId].xp} xp.`, { reply_to_message_id: conn.message.message_id });
}
addcooldown('minar', userId, cooldowntime);
db.save(data);
});

bot.command('lb', (conn) => {
const data = db.get();
if (!data.users) {
return conn.reply('❌ no hay usuarios registrados aún.', { reply_to_message_id: conn.message.message_id });
}
const leaderboard = Object.values(data.users)
.sort((a, b) => b.xp - a.xp)
.slice(0, 10)
.map((user, index) => 
`${index + 1}. ${user.name} - nivel: ${user.level}, xp: ${user.xp}, ` +
`rango: ${user.rango || 'sin rango'}, 💎 diamantes: ${user.diamantes || 0}, 💰 oro: ${user.oro || 0}`
)
.join('\n');
conn.reply(
`🏆 *tabla de clasificación:*\n\n${leaderboard}`,
{ parse_mode: 'markdown', reply_to_message_id: conn.message.message_id }
);
});

bot.command('nivel', (conn) => {
const userId = conn.from.id;
const data = db.get();
if (!data.users || !data.users[userId]) {
return conn.reply('❌ debes registrarte primero con /reg.', { reply_to_message_id: conn.message.message_id });
}
const { name, xp, level, diamantes = 0, oro = 0 } = data.users[userId];
conn.reply(
`📊 *estado actual de ${name}:*\n` +
`🔹 *nivel:* ${level}\n` +
`🌟 *xp:* ${xp}\n` +
`💎 *diamantes:* ${diamantes}\n` +
`💰 *oro:* ${oro}`,
{ parse_mode: 'markdown', reply_to_message_id: conn.message.message_id }
);
});

bot.command('reg', (conn) => {
const message = conn.message.text.trim();
const args = message.split(' ')[1];
if (!args || !args.includes('.')) {
return conn.reply('❌ *formato incorrecto.*\nutiliza: `/reg nombre.edad`\nejemplo: `/reg juan.25`', { reply_to_message_id: conn.message.message_id });
}
const [name, age] = args.split('.');
if (!name || !age || isNaN(age)) {
return conn.reply('❌ *formato inválido.*\nasegúrate de usar el formato correcto: `/reg nombre.edad`', { reply_to_message_id: conn.message.message_id });
}
const userId = conn.from.id;
const data = db.get();
if (!data.users) data.users = {};
if (data.users[userId]) {
return conn.reply(`❌ *ya estás registrado.*\ntu número de serie es: ${data.users[userId].sn}`, { reply_to_message_id: conn.message.message_id });
}
const sn = crypto.createHash('md5').update(userId.toString()).digest('hex').slice(0, 6);
const { rangoActual, estiloactual } = obtenerRango(0);
data.users[userId] = {
name,
age: parseInt(age, 10),
sn,
telegramid: userId,
xp: 500,
level: 0,
rango: rangoActual,
estilo: estiloactual,
diamantes: 5,
oro: 40,
};
db.save(data);
return conn.replyWithPhoto({ source: global.registro }, {
caption: 
`✅ *registro exitoso*\n\n` +
`👤 *nombre:* ${name}\n` +
`🎂 *edad:* ${age}\n` +
`🔢 *número de serie:* ${sn}\n` +
`🏅 *rango inicial:* ${estiloactual} *${rangoActual}*\n` +
`💎 *diamantes iniciales:* 5\n` +
`💰 *oro inicial:* 40\n` +
`⚔️ *xp inicial:* 500`,
parse_mode: 'markdown',
reply_to_message_id: conn.message.message_id,
});
});

bot.command('perfil', (conn) => {
const userId = conn.from.id;
const data = db.get();
if (!data.users || !data.users[userId]) {
return conn.reply('❌ debes registrarte primero con /reg.', { reply_to_message_id: conn.message.message_id });
}
const { name, age, xp, level, rango, estilo, diamantes = 0, oro = 0, sn } = data.users[userId];
conn.reply(
`👤 *perfil de usuario:*\n` +
`- *nombre:* ${name}\n` +
`- *edad:* ${age}\n` +
`- *nivel:* ${level}\n` +
`- *rango:* ${estilo} *${rango}*\n` +
`- *xp:* ${xp}\n` +
`- *diamantes:* ${diamantes}\n` +
`- *oro:* ${oro}\n` +
`- *número de serie:* ${sn}`,
{ parse_mode: 'markdown', reply_to_message_id: conn.message.message_id }
);
});

bot.command('myns', (conn) => {
const userId = conn.from.id;
const data = db.get();
if (!data.users || !data.users[userId]) {
return conn.reply('❌ debes registrarte primero con /reg.', { reply_to_message_id: conn.message.message_id });
}

const { sn } = data.users[userId];

conn.reply(`${sn}`, { parse_mode: 'markdown', reply_to_message_id: conn.message.message_id });
});

bot.command('unreg', (conn) => {
const message = conn.message.text.trim();
const args = message.split(' ')[1];
if (!args) {
return conn.reply('❌ uso incorrecto. formato: /unreg d643d1', { reply_to_message_id: conn.message.message_id });
}

const data = db.get();
const userId = conn.from.id;
if (!data.users || !data.users[userId]) {
return conn.reply('❌ no estás registrado.', { reply_to_message_id: conn.message.message_id });
}

const user = data.users[userId];
if (user.sn !== args) {
return conn.reply('❌ el número de serie proporcionado no coincide con tu número de serie.', { reply_to_message_id: conn.message.message_id });
}

delete data.users[userId];
db.save(data);
conn.reply('🗑️ *tu registro ha sido eliminado correctamente.*', { parse_mode: 'markdown', reply_to_message_id: conn.message.message_id });
});

bot.command('cazar', (conn) => {
const userdata = getuserdata(conn);
if (!userdata) return;
const { data, userId } = userdata;
const cooldowntime = 3 * 60 * 1000;
const cooldownremaining = checkcooldown('cazar', userId);
if (cooldownremaining > 0) {
return conn.replyWithMarkdown(`🏹 *debes esperar ${cooldownremaining} segundos antes de cazar de nuevo.*`, { reply_to_message_id: conn.message.message_id });
}
const rewards = [
{ type: 'oro', amount: Math.floor(Math.random() * 100) + 50 },
{ type: 'diamantes', amount: Math.floor(Math.random() * 10) + 1 },
];
const reward = rewards[Math.floor(Math.random() * rewards.length)];
const messages = [
`🏹 encontraste un campamento abandonado y obtuviste ${reward.amount} ${reward.type}.`,
`🐗 cazaste un jabalí y recuperaste ${reward.amount} ${reward.type}.`,
`🦌 derrotaste a un venado y obtuviste ${reward.amount} ${reward.type}.`,
`🦅 capturaste un ave rara y conseguiste ${reward.amount} ${reward.type}.`,
`🦊 atrapas a un astuto zorro y recuperas ${reward.amount} ${reward.type}.`,
];
const randommessage = messages[Math.floor(Math.random() * messages.length)];
data.users[userId][reward.type] = (data.users[userId][reward.type] || 0) + reward.amount;
addcooldown('cazar', userId, cooldowntime);
db.save(data);
conn.replyWithMarkdown(`${randommessage} *total: ${data.users[userId][reward.type]} ${reward.type}.*`, { reply_to_message_id: conn.message.message_id });
});

bot.command('buy', (conn) => {
const userdata = getuserdata(conn);
if (!userdata) return;
const { data, userId } = userdata;
const cost = 20;
const args = conn.message.text.split(' ');
if (args.length !== 2 || isNaN(parseInt(args[1]))) {
return conn.reply('uso: /buy <cantidad>', { reply_to_message_id: conn.message.message_id });
}

const qty = parseInt(args[1]);
const total = qty * cost;
if (data.users[userId].oro < total) {
return conn.replyWithMarkdown(`no tienes suficiente oro. necesitas ${total} oro para comprar ${qty} diamantes.`, { reply_to_message_id: conn.message.message_id });
}
data.users[userId].oro -= total;
data.users[userId].diamantes = (data.users[userId].diamantes || 0) + qty;
db.save(data);
conn.replyWithMarkdown(`compraste ${qty} diamantes por ${total} oro. oro restante: ${data.users[userId].oro}. diamantes: ${data.users[userId].diamantes}.`, { reply_to_message_id: conn.message.message_id });
});

bot.command('buyall', (conn) => {
const userdata = getuserdata(conn);
if (!userdata) return;
const { data, userId } = userdata;
const cost = 20;

const maxdiamonds = Math.floor(data.users[userId].oro / cost);
if (maxdiamonds < 1) {
return conn.replyWithMarkdown('no tienes suficiente oro para comprar diamantes.', { reply_to_message_id: conn.message.message_id });
}
const total = maxdiamonds * cost;
data.users[userId].oro -= total;
data.users[userId].diamantes = (data.users[userId].diamantes || 0) + maxdiamonds;
db.save(data);
conn.replyWithMarkdown(`compraste ${maxdiamonds} diamantes por ${total} oro. oro restante: ${data.users[userId].oro}. diamantes: ${data.users[userId].diamantes}.`, { reply_to_message_id: conn.message.message_id });
});

bot.command('rob', (conn) => {
const userdata = getuserdata(conn);
if (!userdata) return;
const { data, userId } = userdata;
const targetmessage = conn.message.reply_to_message;
if (!targetmessage || !data.users[targetmessage.from.id]) {
return conn.reply('debes responder al mensaje de un usuario registrado para robarle.', { reply_to_message_id: conn.message.message_id });
}

const targetid = targetmessage.from.id;
if (targetid === userId) {
return conn.reply('no puedes robarte a ti mismo.', { reply_to_message_id: conn.message.message_id });
}
const key = `rob_${userId}_${targetid}`;
const now = Date.now();
const cooldown = 24 * 60 * 60 * 1000;
if (cooldowns.has(key) && now < cooldowns.get(key)) {
const remaining = Math.ceil((cooldowns.get(key) - now) / 1000 / 60);
return conn.replyWithMarkdown(`ya intentaste robar a este usuario. intenta de nuevo en ${remaining} minutos.`, { reply_to_message_id: conn.message.message_id });
}
if (data.users[targetid].oro < 1) {
return conn.reply('el usuario no tiene suficiente oro para ser robado.', { reply_to_message_id: conn.message.message_id });
}
const stolen = Math.min(data.users[targetid].oro, Math.floor(Math.random() * 50) + 1);
data.users[targetid].oro -= stolen;
data.users[userId].oro = (data.users[userId].oro || 0) + stolen;
addcooldown('rob', `${userId}_${targetid}`, cooldown);
db.save(data);
conn.replyWithMarkdown(`robaste ${stolen} oro a ${data.users[targetid].name}. tu oro: ${data.users[userId].oro}. oro restante de ${data.users[targetid].name}: ${data.users[targetid].oro}.`, { reply_to_message_id: conn.message.message_id });
});

bot.command('prest', (conn) => {
const u = getuserdata(conn);
if (!u) return;
const { data, userId } = u;
const tmsg = conn.message.reply_to_message;
if (!tmsg || !data.users[tmsg.from.id]) return conn.reply('📌 responde al mensaje de un usuario registrado para prestarle diamantes.', { reply_to_message_id: conn.message.message_id });
const tid = tmsg.from.id;
if (tid === userId) return conn.reply('❌ no puedes prestarte diamantes a ti mismo.', { reply_to_message_id: conn.message.message_id });
const msg = conn.message.text.split(' ');
if (!msg[2].startsWith('--')) return conn.reply('📌 formato incorrecto. usa: /prest <cantidad> --<tiempo en horas>\nejemplo: /prest 12 --7', { reply_to_message_id: conn.message.message_id });
const am = parseInt(msg[1]);
const t = parseInt(msg[2].replace('--', ''));
if (am <= 0 || t <= 0) return conn.reply('❌ ingresa una cantidad y tiempo válidos mayores a 0.', { reply_to_message_id: conn.message.message_id });
if (data.users[userId].diamantes < am) return conn.reply(`❌ no tienes suficientes diamantes para prestar. necesitas al menos ${am}.`, { reply_to_message_id: conn.message.message_id });
const id = crypto.createHash('md5').update(userId.toString() + Date.now().toString()).digest('hex').slice(0, 4);
const interestrate = 0.05;
const totalinterest = Math.ceil(am * interestrate);
const totaldebt = am + totalinterest;
data.loans = data.loans || {};
data.loans[id] = {
id,
from: userId,
to: tid,
amount: am,
totaldebt: totaldebt,
interest: totalinterest,
remaininghours: t,
createdat: Date.now(),
lendername: data.users[userId].name
};
db.save(data);
conn.replyWithMarkdown(`📌 *@${data.users[userId].name} desea prestarte ${am} diamantes por ${t} horas.*\ncon un interés del 5%, deberás pagar un total de ${totaldebt} diamantes.\nresponde con /si ${id} para aceptar el préstamo.\nla oferta expirará en 2 minutos.`, { reply_to_message_id: tmsg.message_id });
setTimeout(() => {
const updateduserdata = getuserdata(conn);
if (!updateduserdata) return;
const { data: updateddata } = updateduserdata;
const loan = updateddata.loans?.[id];
const debtor = updateddata.users?.[tid];
if (!loan) return;
const hasdebt = debtor?.deudas?.some((d) => d.id === id);
if (hasdebt) return;
delete updateddata.loans[id];
db.save(updateddata);
conn.telegram.sendmessage(conn.chat.id, `⏳ *la oferta de préstamo con id ${id} expiró.*`, { parse_mode: 'markdown' });
}, 2 * 60 * 1000);
});

bot.command('si', (conn) => {
const u = getuserdata(conn);
if (!u) return;
const { data, userId } = u;
const msg = conn.message.text.split(' ');
if (msg.length < 2) return conn.reply('📌 usa: /si <id del préstamo>', { reply_to_message_id: conn.message.message_id });
const id = msg[1];
const loan = data.loans?.[id];
if (!loan) return conn.reply('❌ préstamo no encontrado o ya expiró.', { reply_to_message_id: conn.message.message_id });
if (loan.to !== userId) return conn.reply('❌ no puedes aceptar un préstamo que no es para ti.', { reply_to_message_id: conn.message.message_id });

data.users[userId].deudas = data.users[userId].deudas || [];
data.users[userId].deudas.push({
id: loan.id,
from: loan.from,
fromname: loan.lendername,
amount: loan.amount,
totaldebt: loan.totaldebt,
interest: loan.interest,
remaininghours: loan.remaininghours,
createdat: Date.now()
});

data.users[loan.to].diamantes += loan.amount;
data.users[loan.from].diamantes -= loan.amount;
delete data.loans[id];
db.save(data);

conn.replyWithMarkdown(`✅ *has aceptado el préstamo de @${loan.amount} diamantes de ${loan.lendername}.*\nrecuerda pagar ${loan.totaldebt} en ${loan.remaininghours} horas para evitar embargos.`);

setTimeout(() => {
const updateduserdata = getuserdata(conn);
if (!updateduserdata) return;
const { data: updateddata } = updateduserdata;
const updateduser = updateddata.users?.[loan.to];
if (!updateduser) return;

const debtindex = updateduser.deudas?.findIndex(d => d.id === loan.id);
if (debtindex === -1) return;

const debt = updateduser.deudas[debtindex];
if (!debt) return;

const penalty = Math.ceil(debt.totaldebt * 0.05);
const newtotaldebt = debt.totaldebt + penalty;

updateduser.deudas[debtindex].totaldebt = newtotaldebt;
updateddata.users[loan.from].diamantes += penalty;
updateddata.users[loan.to].diamantes -= penalty;

db.save(updateddata);

conn.telegram.sendmessage(conn.chat.id, `⏳ *@${updateduser.username} tu tiempo de préstamo ha vencido.*\nel banco te ha embargado, aplicando un 5% de intereses. ahora debes ${newtotaldebt} diamantes a *@${debt.fromname}*.\npaga o la deuda seguirá creciendo.`, { parse_mode: 'markdown' });
}, loan.remaininghours * 60 * 60 * 1000);
});

const partidasPendientes = new Map();
const partidas = new Map();
bot.command('pvp', (conn) => {
const sId = conn.from.id;
const tMsg = conn.message.reply_to_message;

if (!tMsg) return conn.reply('❌ Responde a un jugador para retarlo.', { reply_to_message_id: conn.message.message_id });
if (sId === tMsg.from.id) return conn.reply('❌ No puedes jugar contra ti mismo.', { reply_to_message_id: conn.message.message_id });
if (partidas.has(sId) || partidas.has(tMsg.from.id)) return conn.reply('❌ Uno de los jugadores ya está en una partida.', { reply_to_message_id: conn.message.message_id });

partidasPendientes.set(tMsg.from.id, sId);

conn.replyWithMarkdown(
`⚔️ *𝗗𝗘𝗦𝗔𝗙𝗜𝗢 𝗣𝗩𝗣* ⚔️\n━━━━━━━━━━━━━━\n✨ @${conn.from.username} 𝚁𝙴𝚃𝙰 𝙰 @${tMsg.from.username}!\n\n▸ 🕹️ _Juego_: Tres en raya\n▸ 🏆 _Recompensa_: 5 💎\n▸ ⏳ _Tiempo límite_: 5 minutos\n\n@${tMsg.from.username}, 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴 𝙲𝙾𝙽 "𝚊𝚌𝚎𝚙𝚝𝚘" 𝙿𝙰𝚁𝙰 𝙹𝚄𝙶𝙰𝚁!`,
{ reply_to_message_id: tMsg.message_id }
);
});

bot.hears(/^acepto$/i, async (conn) => {
const oId = conn.from.id;
const tMsg = conn.message.reply_to_message;

if (!tMsg || !partidasPendientes.has(oId)) return;

const sId = partidasPendientes.get(oId);
partidasPendientes.delete(oId);

const g = new TicTacToe(sId, oId);
partidas.set(sId, g);
partidas.set(oId, g);

const sUser = await bot.telegram.getChat(sId);
const oUser = await bot.telegram.getChat(oId);

conn.replyWithMarkdown(
`🎮 *𝗣𝗔𝗥𝗧𝗜𝗗𝗔 𝗜𝗡𝗜𝗖𝗜𝗔𝗗𝗔* 🎮\n━━━━━━━━━━━━━━━━\n⚡ @${sUser.username} ❌ 𝚅𝚂 @${oUser.username} 🔵\n\n${dibujarTablero(g)}\n\n📌 _Turno actual_: ${g.currentTurn === sId ? '❌' : '🔵'}\n💡 𝙸𝙽𝚂𝚃𝚁𝚄𝙲𝙲𝙸𝙾𝙽𝙴𝚂:\nResponde a este mensaje con el número (1️⃣-9️⃣) de la casilla donde quieres jugar.`,
{ reply_to_message_id: tMsg.message_id }
);
});

bot.hears(/^[1-9]$/, async (conn) => {
const sId = conn.from.id;
const tMsg = conn.message.reply_to_message;

if (!tMsg || !partidas.has(sId)) return;

const g = partidas.get(sId);
const pos = parseInt(conn.match[0]) - 1;
const p = sId === g.playerX ? 0 : 1;
const r = g.turn(p, pos);

if (r === -3) return conn.reply('🎮 La partida terminó.', { reply_to_message_id: tMsg.message_id });
if (r === -2) return conn.reply('❌ No es tu turno.', { reply_to_message_id: tMsg.message_id });
if (r === -1) return conn.reply('❌ Posición inválida.', { reply_to_message_id: tMsg.message_id });
if (r === 0) return conn.reply('❌ Posición ocupada. Elige otra.', { reply_to_message_id: tMsg.message_id });

if (g.winner) {
const wId = g.winner === g.playerX ? g.playerX : g.playerO;
const d = db.get();
d.users[wId].diamantes = (d.users[wId].diamantes || 0) + 5;
db.save(d);

partidas.delete(g.playerX);
partidas.delete(g.playerO);
const winner = await bot.telegram.getChat(wId);

return conn.replyWithMarkdown(
`🏆 *𝗩𝗜𝗖𝗧𝗢𝗥𝗜𝗔* 🏆\n━━━━━━━━━━━━━━\n🎉 ¡@${winner.username} 𝙶𝙰𝙽𝙾́ 𝙻𝙰 𝙿𝙰𝚁𝚃𝙸𝙳𝙰! 🎉\n\n💰 𝚁𝚎𝚌𝚘𝚖𝚙𝚎𝚗𝚜𝚊: +5 💎\n${dibujarTablero(g)}\n\n▸ 𝚄𝚂𝙰 /pvp 𝙿𝙰𝚁𝙰 𝙾𝚃𝚁𝙰 𝙿𝙰𝚁𝚃𝙸𝙳𝙰`,
{ reply_to_message_id: tMsg.message_id }
);
}

const currentPlayer = await bot.telegram.getChat(g.currentTurn);
conn.replyWithMarkdown(
`🔄 *𝗧𝗨𝗥𝗡𝗢 𝗔𝗖𝗧𝗨𝗔𝗟* 🔄\n━━━━━━━━━━━━━━\n⏳ 𝙹𝚞𝚐𝚊𝚍𝚘𝚛 𝚊𝚌𝚝𝚞𝚊𝚕: ${g.currentTurn === g.playerX ? '❌' : '🔵'}\n\n${dibujarTablero(g)}\n\n📌 𝙴𝚜𝚙𝚎𝚛𝚊𝚗𝚍𝚘 𝚓𝚞𝚐𝚊𝚍𝚊 𝚍𝚎: @${currentPlayer.username}`,
{ reply_to_message_id: tMsg.message_id }
);
});
function dibujarTablero(g) {
const simbolos = { 'X': '❌', 'O': '🔵' };
let b = g.render();

return `
🎮 𝚃𝙰𝙱𝙻𝙴𝚁𝙾 🎮
┏━━━┳━━━┳━━━┓
┃ ${simbolos[b[0]] || '1️⃣'} ┃ ${simbolos[b[1]] || '2️⃣'} ┃ ${simbolos[b[2]] || '3️⃣'} ┃
┣━━━╋━━━╋━━━┫
┃ ${simbolos[b[3]] || '4️⃣'} ┃ ${simbolos[b[4]] || '5️⃣'} ┃ ${simbolos[b[5]] || '6️⃣'} ┃
┣━━━╋━━━╋━━━┫
┃ ${simbolos[b[6]] || '7️⃣'} ┃ ${simbolos[b[7]] || '8️⃣'} ┃ ${simbolos[b[8]] || '9️⃣'} ┃
┗━━━┻━━━┻━━━┛`;
}
bot.command('deudas', (conn) => {
const u = getuserdata(conn);
if (!u) return;
const { data, userId } = u;

if (!data.users || !data.users[userId]) {
return conn.reply('❌ no se encontró información de usuario.');
}

const user = data.users[userId];

if (!user.deudas || user.deudas.length === 0) {
return conn.reply('✅ no tienes deudas pendientes.');
}

let mensaje = '📋 *tus deudas pendientes:*\n\n';
user.deudas.forEach((d) => {
mensaje += `🔹 *id:* ${d.id}\n`;
mensaje += `💰 *monto inicial:* ${d.amount} diamantes\n`;
mensaje += `📈 *total a pagar:* ${d.totaldebt} diamantes\n`;
mensaje += `⏳ *horas restantes:* ${d.remaininghours}h\n`;
mensaje += `👤 *prestamista:* @${d.fromname}\n`;
mensaje += `recuerda pagar a tiempo❗❗\n\n`;
});

conn.replyWithMarkdown(mensaje);
});

/*bot.command('si', (conn) => {
const u = getuserdata(conn);
if (!u) return;
const { data, userId } = u;
const msg = conn.message.text.split(' ');
if (msg.length < 2) return conn.reply('📌 formato incorrecto. usa: /si <id>\nejemplo: /si 626224', { reply_to_message_id: conn.message.message_id });
const id = msg[1];
if (!data.loans || !data.loans[id]) return conn.reply('❌ id de préstamo no encontrado o ya expirado.', { reply_to_message_id: conn.message.message_id });
const loan = data.loans[id];
if (loan.to !== userId) return conn.reply('❌ no puedes aceptar un préstamo destinado a otro usuario.', { reply_to_message_id: conn.message.message_id });

data.users[userId].diamantes = (data.users[userId].diamantes || 0) + loan.amount;
data.users[loan.from].diamantes -= loan.amount;
data.users[userId].deudas = data.users[userId].deudas || [];
data.users[userId].deudas.push({
id,
from: loan.from,
amount: loan.amount,
totaldebt: loan.totaldebt,
interest: loan.interest,
remaininghours: loan.remaininghours,
createdat: loan.createdat
});
delete data.loans[id];
db.save(data);

conn.replyWithMarkdown(`✅ *préstamo aceptado.*\n📤 *${data.users[loan.from].name}* prestó ${loan.amount} diamantes a *${data.users[userId].name}*.\n💰 deuda total: ${loan.totaldebt} diamantes con un interés de ${loan.interest}.`, { reply_to_message_id: conn.message.message_id });
});*/

/*bot.command('billar', async (conn) => {
const message = conn.message.text.trim();
const args = message.split(' ');

if (args.length < 2 || isNaN(parseInt(args[1]))) {
return conn.reply('❌ Uso incorrecto. Formato: /billar <diamantes a apostar>\nEjemplo: /billar 3', {
reply_to_message_id: conn.message.message_id
});
}

const bet = parseInt(args[1]);
const userId = conn.from.id;
const data = db.get();

if (!data.users || !data.users[userId]) {
return conn.reply('❌ Debes registrarte primero con /reg.', { reply_to_message_id: conn.message.message_id });
}

if (data.users[userId].diamantes < bet) {
return conn.reply('❌ No tienes suficientes diamantes para apostar.', { reply_to_message_id: conn.message.message_id });
}

const frutas = ['🍒', '🍋', '🍎', '🍉', '🍍', '🍌', '🥝', '🍇', '🍊'];
let animacion = '🎱 Jugando billar...\n';
let mensaje = await conn.reply(animacion, { reply_to_message_id: conn.message.message_id });

let resultado = [];
for (let i = 0; i < 3; i++) {
resultado.push(frutas[Math.floor(Math.random() * frutas.length)]);
}

for (let i = 0; i < 3; i++) {
animacion += resultado[i] + ' ';
await new Promise(res => setTimeout(res, 1000));
await conn.telegram.editMessageText(conn.chat.id, mensaje.message_id, null, animacion);
}

let chance = Math.random();
let ganancia = 0;

if (chance < 0.2) {  
let frutaGanadora = frutas[Math.floor(Math.random() * frutas.length)];
resultado = [frutaGanadora, frutaGanadora, frutaGanadora];
ganancia = Math.floor(Math.random() * 30) + 1;
data.users[userId].diamantes += ganancia;
animacion += `\n🎉 ¡Ganaste ${ganancia} diamantes!`;
} else if (chance < 0.3) {  
let frutaCoincidente = frutas[Math.floor(Math.random() * frutas.length)];
resultado = [frutaCoincidente, frutaCoincidente, frutas[Math.floor(Math.random() * frutas.length)]];
ganancia = Math.floor(Math.random() * 3) + 2;
data.users[userId].diamantes += ganancia;
animacion += `\n✨ Dos frutas coinciden, ganas ${ganancia} diamantes!`;
} else {  
data.users[userId].diamantes -= bet;
animacion += `\n💔 Perdiste ${bet} diamantes...`;
}

db.save(data);
await new Promise(res => setTimeout(res, 1000));
await conn.telegram.editMessageText(conn.chat.id, mensaje.message_id, null, animacion);
});
*/
bot.command('rw', async (conn) => {  
try {  
const charPath = path.join(__dirname, '../config/character.json');  
if (!fs.existsSync(charPath)) fs.writeFileSync(charPath, JSON.stringify({ characters: [] }, null, 2));  
const charData = JSON.parse(fs.readFileSync(charPath));  

let character;  
let attempts = 0;  
do {  
if (attempts++ >= 10) return conn.reply('❌ No se encontró un personaje disponible.', { reply_to_message_id: conn.message.message_id });  
const res = await axios.get('https://eliasar-yt-api.vercel.app/api/rw');  
character = res.data.character;  
} while (charData.characters.some(c => c.name === character.name));  

const predefinedPrices = [9, 16, 14, 15, 23, 19, 6, 8, 12, 18, 20, 22, 25, 7, 10, 11, 13, 17, 21, 24];
const closestPrice = predefinedPrices[Math.floor(Math.random() * predefinedPrices.length)];

character.value = closestPrice;  

const id = crypto.createHash('md5').update(conn.from.id.toString() + Date.now().toString()).digest('hex').slice(0, 3);

charData.characters.push({ 
id: id, 
name: character.name, 
price: character.value, 
status: 'available' 
});

fs.writeFileSync(charPath, JSON.stringify(charData, null, 2));

const msg = await conn.replyWithPhoto(character.url, {  
caption: `
🔹 *${character.name}*
💎 *${character.value} diamantes*
Responde con /c ${id}
para adquirirlo.
mira mas personajes con /available`,  
parse_mode: 'markdown',  
reply_to_message_id: conn.message.message_id  
});

} catch (e) {  
console.error('Error en rw:', e);  
conn.reply('❌ Error al obtener el personaje.', { reply_to_message_id: conn.message.message_id });  
}  
});

bot.command('c', async (ctx) => {  
const characterId = ctx.message.text.split(' ')[1];  
if (!characterId) return ctx.reply('❌ Debes proporcionar un ID de personaje.', { reply_to_message_id: ctx.message.message_id });

try {
const charPath = path.join(__dirname, '../config/character.json');
if (!fs.existsSync(charPath)) return ctx.reply('❌ No se encontró el archivo de personajes.', { reply_to_message_id: ctx.message.message_id });

const charData = JSON.parse(fs.readFileSync(charPath));
const character = charData.characters.find(c => c.id === characterId);

if (!character) {
return ctx.reply('❌ No se encontró un personaje con ese ID.', { reply_to_message_id: ctx.message.message_id });
}

const u = getuserdata(ctx);  
if (!u) return;  
const { data, userId } = u;  
const user = data.users[userId];  

if (!user || user.diamantes < character.price) {  
return ctx.reply('❌ No tienes suficientes diamantes.', { reply_to_message_id: ctx.message.message_id });  
}  

if (character.status === 'purchased') {
return ctx.reply('❌ Este personaje ya ha sido adquirido por otro usuario.', { reply_to_message_id: ctx.message.message_id });
}

user.diamantes -= character.price;  

character.status = 'purchased';
character.ownerId = userId;
character.ownerName = user.name;

if (!data.users[userId].ownedCharacters) {
data.users[userId].ownedCharacters = [];
}
data.users[userId].ownedCharacters.push({
id: character.id,
name: character.name,
price: character.price
});

fs.writeFileSync(charPath, JSON.stringify(charData, null, 2));  
db.save(data);  

ctx.reply(`
✅ *Compraste a ${character.name}*
por ${character.price} diamantes.💎
Diamantes restantes: ${user.diamantes}
mira tus personajes con /mycharacters`, { parse_mode: 'markdown', reply_to_message_id: ctx.message.message_id });  

} catch (e) {  
console.error('Error en c:', e);  
ctx.reply('❌ Error al procesar la compra.', { reply_to_message_id: ctx.message.message_id });  
}  
});

bot.command('mycharacters', async (ctx) => {
try {
const charPath = path.join(__dirname, '../config/character.json');
if (!fs.existsSync(charPath)) {
return ctx.reply('❌ No se encontró el archivo de personajes.', { reply_to_message_id: ctx.message.message_id });
}

const charData = JSON.parse(fs.readFileSync(charPath));
const u = getuserdata(ctx);
if (!u) return;

const { data, userId } = u;
const user = data.users[userId];

if (!user || !user.ownedCharacters || user.ownedCharacters.length === 0) {
return ctx.reply('❌ No tienes personajes adquiridos aún. ¡Ve a la tienda a comprar uno! 🛒', { reply_to_message_id: ctx.message.message_id });
}

let message = '✨ *Tus personajes adquiridos:* ✨\n\n';
user.ownedCharacters.forEach(c => {
message += `💎 *${c.name}*\n`;
message += '---------------------\n';
});

ctx.reply(message, { parse_mode: 'markdown', reply_to_message_id: ctx.message.message_id });

} catch (e) {
console.error('Error en mycharacters:', e);
ctx.reply('❌ Ocurrió un error al obtener tus personajes adquiridos.', { reply_to_message_id: ctx.message.message_id });
}
});

bot.command('available', async (ctx) => {
try {
const charPath = path.join(__dirname, '../config/character.json');
if (!fs.existsSync(charPath)) {
return ctx.reply('❌ No se encontró el archivo de personajes.', { reply_to_message_id: ctx.message.message_id });
}

const charData = JSON.parse(fs.readFileSync(charPath));
const availableCharacters = charData.characters.filter(c => c.status === 'available');

if (availableCharacters.length === 0) {
return ctx.reply('❌ No hay personajes disponibles a la venta en este momento.', { reply_to_message_id: ctx.message.message_id });
}

let message = '🌟 *Personajes disponibles a la venta:* 🌟\n\n';
availableCharacters.forEach(c => {
message += `🔥 *ID:* ${c.id}\n`;
message += `💎 *${c.name}* por *${c.price} diamantes*\n`;
message += '---------------------\n';
});

ctx.reply(message, { parse_mode: 'markdown', reply_to_message_id: ctx.message.message_id });

} catch (e) {
console.error('Error en available:', e);
ctx.reply('❌ Ocurrió un error al obtener los personajes disponibles.', { reply_to_message_id: ctx.message.message_id });
}
});

let lastRaceTime = 0;
bot.command('pag', (conn) => {
const u = getuserdata(conn);
if (!u) return;
const { data, userId } = u;
const msg = conn.message.text.split(' ');
if (msg.length < 2) return conn.reply('📌 formato incorrecto. usa: /pag <id>\nejemplo: /pag 626224', { reply_to_message_id: conn.message.message_id });
const id = msg[1];
const deuda = data.users[userId].deudas?.find((d) => d.id === id);
if (!deuda) return conn.reply('❌ no se encontró la deuda con ese id.', { reply_to_message_id: conn.message.message_id });
if (data.users[userId].diamantes < deuda.totaldebt) return conn.reply(`❌ no tienes suficientes diamantes para pagar esta deuda. necesitas ${deuda.totaldebt}.`, { reply_to_message_id: conn.message.message_id });

data.users[userId].diamantes -= deuda.totaldebt;
data.users[deuda.from].diamantes += deuda.totaldebt;
data.users[userId].deudas = data.users[userId].deudas.filter((d) => d.id !== id);
db.save(data);

conn.replyWithMarkdown(`✅ *deuda pagada con éxito.*\n💰 se transfirieron ${deuda.totaldebt} diamantes a @*${data.users[deuda.from].name}*.\ngracias por cumplir con tu compromiso.`, { reply_to_message_id: conn.message.message_id });
});

bot.command('explorar', (conn) => {
const userdata = getuserdata(conn);
if (!userdata) return;

const { data, userId } = userdata;
const cooldowntime = 5 * 60 * 1000;
const cooldownremaining = checkcooldown('explorar', userId);
if (cooldownremaining > 0) {
return conn.replyWithMarkdown(`🗺️ *debes esperar ${cooldownremaining} segundos antes de explorar de nuevo.*`, { reply_to_message_id: conn.message.message_id });
}

const findings = [
{ type: 'xp', amount: Math.floor(Math.random() * 100) + 20, message: 'encontraste unas ruinas antiguas y ganaste' },
{ type: 'diamantes', amount: Math.floor(Math.random() * 5) + 1, message: 'descubriste un tesoro escondido y ganaste' },
{ type: 'oro', amount: Math.floor(Math.random() * 200) + 50, message: 'encontraste una mina abandonada y ganaste' },
];
const finding = findings[Math.floor(Math.random() * findings.length)];

data.users[userId][finding.type] = (data.users[userId][finding.type] || 0) + finding.amount;

let response = `🗺️ mientras explorabas, ${finding.message} ${finding.amount} ${finding.type}.`;
if (finding.type === 'xp' && checkLevelUp(data.users[userId])) {
const { rangoActual, estiloactual } = obtenerRango(data.users[userId].level);
response += ` 🎉 *felicidades ${data.users[userId].name}, subiste al nivel ${data.users[userId].level}!*\n🌟 tu nuevo rango es: ${estiloactual} *${rangoActual}*`;
}

addcooldown('explorar', userId, cooldowntime);
db.save(data);

conn.replyWithMarkdown(response, { reply_to_message_id: conn.message.message_id });
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
const fileName = path.basename(file);
console.log(chalk.greenBright.bold(`Update '${fileName}'.`));
delete require.cache[file];
require(file);
});
};