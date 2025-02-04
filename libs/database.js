const fs = require('fs');
const path = './config/database.json';

const get = () => {
if (!fs.existsSync(path)) return {};
return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const save = (data) => {
fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

module.exports = { get, save };