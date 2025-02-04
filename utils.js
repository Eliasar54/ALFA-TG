const fs = require('fs');
const chalk = require('chalk');
const db = require('./libs/database');
require('./settings');

const isCreator = (userId) => global.owner.some(owner => owner.id === String(userId));
const isAdmin = async (conn) => {
try {
if (conn.chat.type !== 'private') {
const member = await conn.telegram.getChatMember(conn.chat.id, conn.from.id);
return ['administrator', 'creator'].includes(member.status);
}
return false;
} catch {
return false;
}
};

const isBotAdmin = async (conn) => {
try {
const botId = (await conn.telegram.getMe()).id;
const botMember = await conn.telegram.getChatMember(conn.chat.id, botId);
return ['administrator', 'creator'].includes(botMember.status);
} catch {
return false;
}
};

const isGroup = (conn) => conn.chat.type === 'group' || conn.chat.type === 'supergroup';

const getGroupAdmins = async (conn) => {
try {
const members = await conn.telegram.getChatAdministrators(conn.chat.id);
return members.map((member) => member.user.id);
} catch {
return [];
}
};

const getMemberStatus = async (conn, userId) => {
try {
const member = await conn.telegram.getChatMember(conn.chat.id, userId);
return member.status;
} catch {
return 'left';
}
};

const getAllMembers = async (conn) => {
try {
const chatMembers = await conn.telegram.getChat(conn.chat.id);
return chatMembers;
} catch {
return null;
}
};

const banMember = async (conn, userId) => {
try {
await conn.telegram.banChatMember(conn.chat.id, userId);
return true;
} catch {
return false;
}
};

const unbanMember = async (conn, userId) => {
try {
await conn.telegram.unbanChatMember(conn.chat.id, userId);
return true;
} catch {
return false;
}
};

const restrictMember = async (conn, userId, permissions) => {
try {
await conn.telegram.restrictChatMember(conn.chat.id, userId, {
can_send_messages: permissions.canSendMessages || false,
can_send_media_messages: permissions.canSendMedia || false,
can_send_polls: permissions.canSendPolls || false,
can_change_info: permissions.canChangeInfo || false,
can_invite_users: permissions.canInviteUsers || false,
can_pin_messages: permissions.canPinMessages || false,
can_add_web_page_previews: permissions.canAddPreviews || false,
});
return true;
} catch {
return false;
}
};

const promoteMember = async (conn, userId, rights) => {
try {
await conn.telegram.promoteChatMember(conn.chat.id, userId, {
can_change_info: rights.canChangeInfo || false,
can_post_messages: rights.canPostMessages || false,
can_edit_messages: rights.canEditMessages || false,
can_delete_messages: rights.canDeleteMessages || false,
can_invite_users: rights.canInviteUsers || false,
can_restrict_members: rights.canRestrictMembers || false,
can_pin_messages: rights.canPinMessages || false,
can_promote_members: rights.canPromoteMembers || false,
});
return true;
} catch {
return false;
}
};

const getGroupInfo = async (conn) => {
try {
const chat = await conn.telegram.getChat(conn.chat.id);
return {
id: chat.id,
title: chat.title,
description: chat.description || 'Sin descripción',
memberCount: chat.all_members_are_administrators
? 'Todos son administradores'
: 'Miembros normales',
};
} catch {
return null;
}
};

const setGroupDescription = async (conn, description) => {
try {
await conn.telegram.setChatDescription(conn.chat.id, description);
return true;
} catch {
return false;
}
};

const setGroupTitle = async (conn, title) => {
try {
await conn.telegram.setChatTitle(conn.chat.id, title);
return true;
} catch {
return false;
}
};

const pinMessage = async (conn, messageId) => {
try {
await conn.telegram.pinChatMessage(conn.chat.id, messageId);
return true;
} catch {
return false;
}
};

const unpinMessage = async (conn, messageId) => {
try {
await conn.telegram.unpinChatMessage(conn.chat.id, messageId);
return true;
} catch {
return false;
}
};

const unpinAllMessages = async (conn) => {
try {
await conn.telegram.unpinAllChatMessages(conn.chat.id);
return true;
} catch {
return false;
}
};

const phrases = {
notAdmin: '⚠️ No eres administrador del grupo.',
botNotAdmin: '⚠️ No puedo ejecutar esta acción porque no soy administrador.',
onlyCreator: '⚠️ Solo el creador del bot puede usar este comando.',
notGroup: '⚠️ Este comando solo se puede usar en grupos.',
banned: 'El usuario fue baneado con éxito.',
unbanned: 'El usuario fue desbaneado con éxito.',
restricted: 'El usuario fue restringido con éxito.',
promoted: 'El usuario fue promovido con éxito.',
groupInfo: 'Información del grupo obtenida correctamente.',
};

const getUserData = (conn) => {
const userId = conn.from.id;
const data = db.get();
if (!data.users || !data.users[userId]) {
conn.reply('❌ Debes registrarte primero con /reg.', { reply_to_message_id: conn.message.message_id });
return null;
}
return { data, userId };
};

const checkGroupRestrictions = (conn) => {
const chatId = conn.chat.id;
const data = db.get();
if (!data.groups || !data.groups[chatId] || !data.groups[chatId].allowNSFW) {
return conn.reply('❌ El uso de comandos +18 no está permitido en este grupo.', { reply_to_message_id: conn.message.message_id });
}
return true;
};

const checkAgeRestriction = (conn, userId) => {
const data = db.get();
const user = data.users[userId];
if (user.age < 18) {
return conn.reply('❌ Este comando está restringido a mayores de 18 años.', { reply_to_message_id: conn.message.message_id });
}
return true;
};

module.exports = {
isCreator,
isAdmin,
isBotAdmin,
isGroup,
getGroupAdmins,
getMemberStatus,
getAllMembers,
banMember,
unbanMember,
restrictMember,
promoteMember,
getGroupInfo,
setGroupDescription,
setGroupTitle,
pinMessage,
unpinMessage,
unpinAllMessages,
phrases,
getUserData,
checkGroupRestrictions,
checkAgeRestriction,
};
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})