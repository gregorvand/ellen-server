const bcrypt = require('bcrypt');

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

  if (errors.length > 0) {
    res.render("register", { errors, firstName, lastName, email, password, password2 });
  } else {
    let hashedPassword = await bcrypt.hash(password, 15);
    console.log('hashed happened..', hashedPassword);
  }
}

module.exports.registerForm = registerForm;