function makeEmailId(length) {
  let result           = '';
  const characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');

function makeUsername() {
  return uniqueNamesGenerator({ dictionaries: [adjectives, animals] }); // big_red_donkey
}

module.exports.makeEmailId = makeEmailId;
module.exports.makeUsername = makeUsername;