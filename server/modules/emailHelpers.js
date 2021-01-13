
const formidable = require('formidable');
const cheerio = require('cheerio'); // html parser, jquery-like syntax
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')

const companiesController = require('../controllers/companies');

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

    const parsedCompanyEmail = await parseHtmlForSender(fields);

    try {
      let company = await Company.findOne({ where: { emailIdentifier: parsedCompanyEmail } });
      if (company === null) {
        let newCompany = await companiesController.internalCreate('unconfirmed', parsedCompanyEmail);
        return newCompany;
      } else {
        console.log('found a company?', company instanceof Company);
        console.log(company.nameIdentifier);
        return company;
      }
    } catch (err) {
      return `oh no! company lookup / create totally failed. with the following error: ${err}`;
    }
  }

  async function findCustomerByEmail (envelopeFrom) {
    const User = require('../models').User;

    console.log('envelope', envelopeFrom);
    try {
      let customer = await User.findOne({ where: { email: envelopeFrom } });
      if (customer === null) {
        console.log('Customer Not found!');
        return 0; // no user assigned, will default to user '0'
      } else {
        console.log('found a customer?', customer instanceof User);
        console.log(customer.email);
        return customer;
      }
    } catch (err) {
      return 'oh no! customer lookup totally failed.';
    }
  }

  async function getField (fields, scope) {
    try {
      return fields[scope];
    } catch(err) {
      console.err("could not identify that field");
    }
  }

  async function returnOrderDate (fields) {
    // parse the body html for the company email here:
    const $ = cheerio.load(fields);
    dayjs.extend(customParseFormat)

    const fromCompanyEmailGmailSpan = $('.gmail_quote').text();
    let getDateFromText = fromCompanyEmailGmailSpan.match(/Date:(.*)Subject/gi);
    console.log(getDateFromText); 
    const start = `Date: `;
    const end = `Subject`;
    let theDateString  = getDateFromText[0].split(start)[1].split(end)[0];
    theDateString = theDateString.replace(' at', '');
    let theDateArray = theDateString.split(', ');
    theDateArray = theDateArray.splice(1,2);
    theDateArray = theDateArray.join(' ');

    console.log(theDateArray);
    let parsedDate = dayjs(theDateArray, "MMM DD YYYY H:mm A");
    console.log('parse', parsedDate);    
    return parsedDate;
  }

  module.exports.returnOrderNumber = returnOrderNumber;
  module.exports.returnOrderDate = returnOrderDate;
  module.exports.parseEmail = parseEmail;
  module.exports.findCompanyByEmail = findCompanyByEmail;
  module.exports.findCustomerByEmail = findCustomerByEmail;
  module.exports.getField = getField;


  // Internal functions -----------------------

  async function parseHtmlForSender (fields) {
    // parse the body html for the company email here:
    const $ = cheerio.load(fields);
    const fromCompanyEmailGmailLink = $('.gmail_quote span:first-of-type > a:first-child').text();
    const fromCompanyEmailGmailSpan = $('.gmail_quote span:first-of-type').text();
    
    // Leave the below logs in for now - will be useful to debug company email insert issues
    console.log('\x1b[33m%s\x1b[0m', 'company email located as:');
    if (fromCompanyEmailGmailLink.includes('@')) {
      console.log('yeah', fromCompanyEmailGmailLink)
      return fromCompanyEmailGmailLink;
    } else if (fromCompanyEmailGmailSpan.includes('@')) {
      let getEmailFromText = fromCompanyEmailGmailSpan.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi);
      console.log(getEmailFromText[0]); 
      return getEmailFromText[0];
    }
  }