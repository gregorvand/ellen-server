const bcrypt = require('bcrypt');
const User = require('../models').User;
const usersController = require('../controllers/users');


async function registerForm (req, res) {
  let { firstName, lastName, email, password, password2 } = req.body;

  console.log('register creds', {
    firstName,
    lastName,
    email,
    password,
    password2
  })

  let errors = [];

  if (!(firstName || lastName || email || password || !password2)) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  // errors or not
  if (errors.length > 0) {
    res.render("register", { errors, firstName, lastName, email, password, password2 });
  } else {
    let hashedPassword = await bcrypt.hash(password, 15);
    console.log('hashed happened..', hashedPassword);

    // TODO: change this to a keyup function to do lookup while user entering password
    // wait on getting result from DB lookup with entered email
    const currentUser = await checkDbForUser(email);

    if (currentUser) {
      errors.push({ message: "Already found a user with that email" });
      res.render("register", { errors, firstName, lastName, email, password, password2 });
      console.log(`already found a user called ${currentUser.firstName} ${currentUser.lastName}`)
    } else {
      console.log('new user!');
      createUserFromRegister(firstName, lastName, email, hashedPassword);
    }
  }
}


// internal functions
async function checkDbForUser (registerEmail) {
    return User
      .findOne({
        where: [{
          email: registerEmail
        }],
      })
      .then((foundUser) => foundUser)
      .catch((error) => console.error(error));
}

async function createUserFromRegister (firstName, lastName, email, hashedPassword) {
  return User
    .create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword
    })
    .then(user => console.log(user))
    .catch(error => console.log(error));
}

module.exports.registerForm = registerForm;