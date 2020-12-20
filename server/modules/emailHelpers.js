
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

  // good example of adding Promise structure to non-sync external function
  // then returning value via another Promise from own function
  async function parseEmail (req) {
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

          // works if email has not been double forwarded (and Gmail only)
          const fromCompanyEmailGmail = $('.gmail_quote span:first-of-type > a:first-child').text();
          console.log(fromCompanyEmailGmail);

          returnOrderNumber(fields['headers[subject]']).then(orderNumber => {
            resolve(
              {
                parsedOrderNumber: orderNumber, 
                parsedFromEmail: fromCompanyEmailGmail
              }
            );
          });
        });
      });
    } catch(err) {
      console.log('there was an error parsing email', err);
    }
  }

  // return id of Company from email lookup
  async function findCompanyByEmail (email) {
    const Company = require('../models').Company;
    try {
      let company = await Company.findOne({ where: { emailIdentifier: email } });
      if (company === null) {
        console.log('Company Not found!');
        return 0; // no company assigned
      } else {
        console.log('found a company?', company instanceof Company);
        console.log(company.nameIdentifier);
        return company;
      }
    } catch (err) {
      return 'oh no! company lookup totally failed.';
    }
  }

  module.exports.returnOrderNumber = returnOrderNumber;
  module.exports.parseEmail = parseEmail;
  module.exports.findCompanyByEmail = findCompanyByEmail;
