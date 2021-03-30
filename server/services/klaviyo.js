const Klaviyo = require('node-klaviyo');
const env = process.env.NODE_ENV || 'development';

const KlaviyoClient = new Klaviyo({
  publicToken: 'WD8qqU',
  privateToken: process.env.KLAVIYO_PRIVATE_KEY
});

const addSubscribersToList = (req, res) => {
  console.log(req);
  console.log('klaviyo email?', req.body.email);

  KlaviyoClient.lists.addSubscribersToList({
    listId: 'U4qXB2',
    profiles: [
        {
          email: req.body.email,
          signup_location: 'homepage'
        }
    ]
  })
  .then(email => res.status(201).send(email))
  .catch(error => res.status(400).send(error));
}

const identifyUserInternal = (userEmail) => {
  console.log('klaviyo email?', userEmail);

  KlaviyoClient.public.identify({
    email: userEmail,
    properties: {
      hasAccount: true
    }
  })
  .then(user => console.log(user || 'no user found...'))
  .catch(error => console.log(error));
}

module.exports.addSubscribersToList = addSubscribersToList;
module.exports.identifyUserInternal = identifyUserInternal;
