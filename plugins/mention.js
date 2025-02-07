const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const axios = require('axios');

module.exports = async (bot) => {
const botInfo = await bot.telegram.getMe();
const botUsername = botInfo.username;

bot.hears(new RegExp(`^@${botUsername}\\s*(.*)`, "i"), async (conn) => {
const userMessage = conn.match[1] || "Hola";

try {
const { data } = await axios.get(`https://archive-ui.tanakadomp.biz.id/ai/deepseek?text=${encodeURIComponent(userMessage)}`);

if (data.status && data.result) {
await conn.reply(data.result, {
reply_to_message_id: conn.message.message_id,
});
} else {
await conn.reply("❌ Error en la respuesta de la API.", {
reply_to_message_id: conn.message.message_id,
});
}
} catch (error) {
await conn.reply("❌ Error al procesar la solicitud.", {
reply_to_message_id: conn.message.message_id,
});
}
});
};

fs.watchFile(require.resolve(__filename), () => {
fs.unwatchFile(require.resolve(__filename));
const fileName = path.basename(__filename);
console.log(chalk.greenBright.bold(`Update '${fileName}'.`));
delete require.cache[require.resolve(__filename)];
require(__filename);
});
