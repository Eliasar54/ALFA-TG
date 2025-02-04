const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100));

const checkLevelUp = (user) => {
const currentLevel = user.level || 0;
const newLevel = calculateLevel(user.xp || 0);
if (newLevel > currentLevel) {
user.level = newLevel;
return true;
}
return false;
};

module.exports = {
calculateLevel,
checkLevelUp,
};