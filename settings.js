const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const axios = require('axios');

const ownersPath = path.join(__dirname, './config/owners.json');

function loadOwners() {
try {
const data = fs.readFileSync(ownersPath, 'utf-8');
global.owner = JSON.parse(data).owners;
console.log(chalk.greenBright('Lista de propietarios actualizada correctamente.'));
} catch (error) {
console.error(chalk.red('Error al cargar el archivo de propietarios:'), error);
}
}

loadOwners();

fs.watchFile(ownersPath, (curr, prev) => {
if (curr.mtime !== prev.mtime) {
console.log(chalk.yellow('Detectado cambio en owners.json, recargando...'));
loadOwners();
}
});

//---------[ NOMBRE/INFO ]---------
global.botname = "ALFA TG";
global.wm = 'ALFA TG';
global.vs = '1.1.0';
global.CREATOR_ID = 6990618983;
//---------[ FECHA/IDIOMAS ]---------
global.place = 'America/Managua';

//---------[ APIS GLOBAL ]---------
global.API = (name, path = '/', query = {}, apikeyqueryname) => 
(name in global.APIs ? global.APIs[name] : name) + path + 
(query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({
...query,
...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {})
})) : '');

global.apis = 'https://deliriussapi-oficial.vercel.app';
global.eliasarapi = 'EliasarYT';
global.keysZens = ['LuOlangNgentot', 'c2459db922', '37CC845916', '6fb0eff124', 'hdiiofficial', 'fiktod', 'BF39D349845E', '675e34de8a', '0b917b905e6f'];
global.keysxxx = global.keysZens[Math.floor(global.keysZens.length * Math.random())];
global.keysxteammm = ['29d4b59a4aa687ca', '5LTV57azwaid7dXfz5fzJu', 'cb15ed422c71a2fb', '5bd33b276d41d6b4', 'HIRO', 'kurrxd09', 'ebb6251cc00f9c63'];
global.keysxteam = global.keysxteammm[Math.floor(global.keysxteammm.length * Math.random())];
global.keysneoxrrr = ['5VC9rvNx', 'cfALv5'];
global.keysneoxr = global.keysneoxrrr[Math.floor(global.keysneoxrrr.length * Math.random())];
global.lolkeysapi = ['GataDios']; 
global.itsrose = ['4b146102c4d500809da9d1ff'];

global.APIs = {
CFROSAPI: 'https://api.cafirexos.com',
nrtm: 'https://fg-nrtm.ddns.net',
fgmods: 'https://api.fgmods.xyz',
xteam: 'https://api.xteam.xyz',
dzx: 'https://api.dhamzxploit.my.id',
lol: 'https://api.lolhuman.xyz',
neoxr: 'https://api.neoxr.my.id',
zenzapis: 'https://api.zahwazein.xyz',
akuari: 'https://api.akuari.my.id',
akuari2: 'https://apimu.my.id',
botcahx: 'https://api.botcahx.biz.id',
ibeng: 'https://api.ibeng.tech/docs',
rose: 'https://api.itsrose.site',
popcat: 'https://api.popcat.xyz',
xcoders: 'https://api-xcoders.site',
vihangayt: 'https://vihangayt.me',
erdwpe: 'https://api.erdwpe.com',
xyroinee: 'https://api.xyroinee.xyz',
nekobot: 'https://nekobot.xyz'
};

global.APIKeys = {
'https://api.xteam.xyz': `${global.keysxteam}`,
'https://api.lolhuman.xyz': 'GataDios',
'https://api.neoxr.my.id': `${global.keysneoxr}`,
'https://api.zahwazein.xyz': `${global.keysxxx}`,
'https://api.fgmods.xyz': 'DRLg5kY7',
'https://api-fgmods.ddns.net': 'fg-dylux',
'https://api.botcahx.biz.id': 'Admin',
'https://api.ibeng.tech/docs': 'tamvan',
'https://api.itsrose.site': 'Rs-Zeltoria',
'https://api-xcoders.site': 'Frieren',
'https://api.xyroinee.xyz': 'uwgflzFEh6'
};

//---------[ ENLACES ]---------
global.md = 'https://github.com/Eliasar54/ALFA-TG';
global.yt = 'https://www.youtube.com/@Eliasar_yt';
global.tiktok = 'https://www.tiktok.com/@eliasar_yt?_t=8mjJpoJfOBK&_r=1';
global.fb = 'https://www.facebook.com/EliasarYT2';
global.faceb = 'https://www.facebook.com/EliasarYT2';
global.paypal = 'https://www.paypal.me/EliasarMoncada72';

//---------[ MULTIMEDIA ]---------
global.videoUrl = 'https://qu.ax/TurdU.mp4';
global.img = path.join(__dirname, './media/menu.jpg')
global.registro = path.join(__dirname, './media/registro.jpg');

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
const fileName = path.basename(file);
console.log(chalk.greenBright.bold(`Update '${fileName}'.`));
delete require.cache[file];
require(file);
});