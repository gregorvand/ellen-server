const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./server/models').User;

async function initPassport(passport) {
  const authenticateUser = (userEmail, password, done) => {
    
    return User
    .findOne({
      where: {
        email: userEmail
      },
    })
    .then((currentUser) => {
      if (currentUser) {
        console.log('found', currentUser.email);
        const user = currentUser;
  
        bcrypt.compare(password, user.password, (error, isMatch) => {
          if (error) {
            throw error
          }
  
          if(isMatch) {
            return done(null, user) 
          } else {
            return done(null, false, { message: "Incorrect Password"})
          }
        });
      } else {
        // other error besides password or general error
        return done(null, false, { message: "Could not locate an account with this email" })
      }
    })
    .catch((error) => console.error(error));
  }

  passport.use(new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    authenticateUser
  ));

  // serialize the user and store their User ID to lookup later
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((userId, done) => {
  //   const currentUser = await usersController.checkDbForUser({'id': id});
  //   if (currentUser) {
  //     console.log(`current user is ${currentUser.email}!`)
  //     return done(null, currentUser);
  //   } else {
  //     console.log('error deserializing user');
  //   }
  return User
    .findOne({
      where: {
        id: userId
      },
    })
    .then((foundUser) => {
      return done(null, foundUser);
    })
    .catch((error) => console.error(error));
   })
}

module.exports = initPassport;