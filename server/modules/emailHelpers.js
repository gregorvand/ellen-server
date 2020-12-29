
const formidable = require('formidable');
const cheerio = require('cheerio'); // html parser, jquery-like syntax

  // good example of adding Promise structure to non-async external function
  // then returning value via another Promise from own function
  async function parseEmail(req, res) {
    form = formidable({ multiples: true });
    form.encoding = 'utf-8';
    // console.log('req was', req);
    return formfields = await new Promise(function (resolve, reject) {

      form.parse(req, (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }

        try {
          console.log(fields);
          console.log('files?', files);
          resolve(fields);

          // response header here, as it was firing too early when 
          // left in router (and fields did not get handled)
          res.writeHead(200, {'content-type': 'text/plain'})
          res.end('Message Received. Thanks!\r\n');
        } catch(error) {
          reject(console.log('crap', error));
        }
      });
    });
  }
  
  async function returnOrderNumber (subject) {
    // TODO: get prefix from Company record first
    // const prefix = "\#";
    // const regex = "\#(?=\w*)\w+"
    try {
      console.log('original subject: ', subject);
      const found = subject.match(/\#(?=\w*)\w+/g);
      let orderWithPrefix = found[0];
      let orderNumberArray = orderWithPrefix.split('#');
      return await orderNumberArray[1];
    } catch(err) {
      console.error(err, 'probably no regex match');
      return 'No match to the defined prefix'
    }
  }

  // return id of Company from email lookup
  async function findCompanyByEmail (fields) {
    const Company = require('../models').Company;

    const parsedEmail = await parseHtmlForSender(fields);
    console.log('got the email?', parsedEmail);

    try {
      let company = await Company.findOne({ where: { emailIdentifier: parsedEmail } });
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

  async function getField (fields, scope) {
    try {
      return fields[scope];
    } catch(err) {
      console.err("could not identify that field");
    }
  }

  module.exports.returnOrderNumber = returnOrderNumber;
  module.exports.parseEmail = parseEmail;
  module.exports.findCompanyByEmail = findCompanyByEmail;
  module.exports.getField = getField;

  // Internal functions -----------------------

  async function parseHtmlForSender (fields) {
    // parse the body html for the company email here:
    const $ = cheerio.load(fields);

    // works if email has not been double forwarded (and Gmail only)
    const fromCompanyEmailGmail = $('.gmail_quote span:first-of-type > a:first-child').text();
    console.log(fromCompanyEmailGmail);
    return fromCompanyEmailGmail;
  }