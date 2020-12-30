const User = require('../models').User;
const Order = require('../models').Order;

module.exports = {
  create(req, res) {
    return User
      .create({
        firstName: req.body.firstName || 'Jon',
        lastName: req.body.lastName || 'Jim',
        email: req.body.email,
        password: req.body.password || 'password'
      })
      .then(user => res.status(201).send(user))
      .catch(error => res.status(400).send(error));
  },

  list(req, res) {
    return User
      .findAll({
        include: [{
          model: Order,
          as: 'orders',
        }],
      })
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error));
  },

  // takes an object from function calling it, e.g:
  // {'email': email}
  // where the first is a string to match DB column name, second is the object to compare
};

async function checkDbForUser (lookup) {
  return User
    .findOne({
      where: [lookup],
    })
    .then((foundUser) => foundUser)
    .catch((error) => console.error(error));
}

module.exports.checkDbForUser = checkDbForUser;