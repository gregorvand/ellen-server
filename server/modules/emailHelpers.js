
const formidable = require('formidable');
const cheerio = require('cheerio'); // html parser, jquery-like syntax

  
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
          // parse the body html for the company email here:


          const $ = cheerio.load(fields['html']);
          // works if email has not been double forwarded
          console.log($('.gmail_quote span:first-of-type > a:first-child').text());

          // idea is to return an array here which has all Order data points
          // that gets passed to 
          resolve(returnOrderNumber(fields['headers[subject]']));
        })
      });
    } catch(err) {
      console.log('there was an error', err);
    }
  }

  module.exports.returnOrderNumber = returnOrderNumber;
  module.exports.parseForm = parseForm;
