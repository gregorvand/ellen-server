const Klaviyo = require('node-klaviyo');
const env = process.env.NODE_ENV || 'development';

const addSubscribersToList = (req, res) => {
  const KlaviyoClient = new Klaviyo({
    privateToken: process.env.KLAVIYO_PRIVATE_KEY,
  });

  console.log(req);
  console.log('klaviyo email?', req.body.email);

  KlaviyoClient.lists.addSubscribersToList({
    listId: 'U4qXB2',
    profiles: [
        {
          email: req.body.email,
        }
    ]
  })
  .then(email => res.status(201).send(email))
  .catch(error => res.status(400).send(error));
}

module.exports.addSubscribersToList = addSubscribersToList;
