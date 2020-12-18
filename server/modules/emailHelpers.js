
  const formidable = require('formidable');
  const ordersController = require('../controllers/orders');
  
  async function returnOrderNumber (subject) {
    // TODO: get prefix from Company record first
    // const prefix = "\#";
    // const regex = "\#(?=\w*)\w+"
    try {
      console.log('original subject: ', subject);
      const found = subject.match(/\#(?=\w*)\w+/g);
      let orderWithPrefix = found[0];
      let orderNumberArray = orderWithPrefix.split('#');
      return orderNumberArray[1];
    } catch(err) {
      console.error(err, 'probably no regex match');
      return 'No match to the defined prefix'
    }
  }

  // good example of adding Promise structure to non-aync external function
  // then returning value via another Promise from own function
  async function parseForm (req) {
    let form = new formidable.IncomingForm();
    try {
      return new Promise(function (resolve, reject) {
        form.parse(req, function(err, fields, files) {
          if (err) {
            reject(err);
            return;
          }
          resolve(returnOrderNumber(fields['headers[subject]']));
        })
      });
    } catch(err) {
      console.log('there was an error', err);
    }
  }

  module.exports.returnOrderNumber = returnOrderNumber;
  module.exports.parseForm = parseForm;