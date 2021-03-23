
const formidable = require('formidable');
const cheerio = require('cheerio'); // html parser, jquery-like syntax
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
var constants = require('../utils/constants');

const companiesController = require('../controllers/companies');

// look at subject and try with company prefix
  // look at subject try with all prefixes

  // look at content try with company prefix
  // look at content try with all prefixes

  // check anything found only contains numbers
  // return that, otherwise, null


  async function returnOrderNumberV2 (subject, companyObject, plainContent) {
    // look at subject and try with company prefix
    const subjectWithCompanyPrefix = await checkSubjectWithCompanyPrefix(subject, companyObject).then(numberReturned => {
      subjectWithCompanyPrefixResult = numberReturned;
    });
    
    // look at subject and try with other prefixes
    const subjectWithGenericPrefix = await checkSubjectWithGenericPrefix(subject).then(numberReturned => {
      subjectWithGenericPrefixResult = numberReturned;
    });

    const contentWithCompanyPrefix = await checkSubjectWithCompanyPrefix(plainContent, companyObject).then(numberReturned => {
      contentWithCompanyPrefixResult = numberReturned;
    });

    const contentWithGenericPrefix = await checkSubjectWithGenericPrefix(plainContent).then(numberReturned => {
      contentWithGenericPrefixResult = numberReturned;
    });

    const allResults = Promise.all([
      subjectWithCompanyPrefix,
      subjectWithGenericPrefix,
      contentWithCompanyPrefix,
      contentWithGenericPrefix
    ]);

    return allResults
    .then((values) => {
      console.log('got any?', subjectWithCompanyPrefixResult, subjectWithGenericPrefixResult, contentWithCompanyPrefixResult, contentWithGenericPrefixResult);
    
       // check all results and see which contains a number
      const containsNumbersRegExp = new RegExp(`[1-9]`, 'g');
      const results = [subjectWithCompanyPrefixResult, subjectWithGenericPrefixResult, contentWithCompanyPrefixResult, contentWithGenericPrefixResult];
      let finalOrderNumber = 0;

      results.some(orderNumberOrFalse => {
        if (containsNumbersRegExp.test(orderNumberOrFalse)) {
          finalOrderNumber = orderNumberOrFalse;
          return true;
        } else {
          return false;
        }
      })

      return finalOrderNumber;
    })
     .catch(err => {
       console.log(`Nothing parsed and somehow got an error of ${err}`);
       return 0;
     })
  }


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

  // return id of Company from email lookup
  async function findCompanyByEmail (fields) {
    const Company = require('../models').Company;
    const plainContent = await getField(fields, 'plain');
    const parsedCompanyEmail = await parseEmailSender(plainContent);

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

  async function findCustomerByEmail (envelopeFrom, envelopeTo) {
    const User = require('../models').User;

    console.log('envelope', envelopeFrom);
    const identiferStringArray = envelopeTo.split('@'); 
    // find a customer by email
    let customer = await User.findOne({ where: { email: envelopeFrom } });

    console.log('so far...', customer);
    
    // or by their identifier (inbound email address)
    let customerByIdentifer = await User.findOne({ where: { identifier: identiferStringArray[0] } });
    
    try {
      if (customerByIdentifer) {
        return customerByIdentifer;
      } else if (customer) {
        console.log('found a customer?', customer.email);
        return customer;
      } else if (customer === null && customerByIdentifer === null) {
        console.log('Customer Not found!');
        return 0; // no user assigned, will default to user '0'
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
    let getDateFromText = fromCompanyEmailGmailSpan.match(/Date:(.*)Subject/gi) || '';
    console.log(getDateFromText); 
    const start = `Date: `;
    const end = `Subject`;
    let theOrderDate = 0;

      try {
        let theDateString = getDateFromText[0]?.split(start)[1].split(end)[0];
        theDateString = theDateString.replace(' at', '');
        let theDateArray = theDateString.split(', ');
        theDateArray = theDateArray.splice(1,2);
        theDateArray = theDateArray.join(' ');
    
        console.log('date to parse', theDateArray);
      
        const dateFormatsToParse = constants.DATE_FORMATS;
    
        // start checking dates againt dayJS formats we are aware are used by email
        // break when we find valid format
        dateFormatsToParse.some(format => {
          console.log(`testing ${format}`);
    
        let theDate = dayjs(theDateArray, format);
        console.log(`validity`, theDate.isValid());
          if (theDate.isValid()) { 
            theOrderDate = theDate;
            return true;
          } else {
            console.log('could not locate date');
            return false;
          }
        })
      } catch (err) {
        console.error('failed on date parsing')
      };

      return theOrderDate;
    }

  module.exports.returnOrderNumberV2 = returnOrderNumberV2;
  module.exports.returnOrderDate = returnOrderDate;
  module.exports.parseEmail = parseEmail;
  module.exports.findCompanyByEmail = findCompanyByEmail;
  module.exports.findCustomerByEmail = findCustomerByEmail;
  module.exports.getField = getField;

  // Internal functions -----------------------

  async function parseEmailSender (plainContent) {
    // Leave the below logs in for now - will be useful to debug company email insert issues
    let getEmailFromText = plainContent.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi);
    console.log('\x1b[33m%s\x1b[0m', 'company email located as:');
    console.log(getEmailFromText[0]); 
    return getEmailFromText[0];
  }

  async function checkSubjectWithCompanyPrefix (subject, companyObject) {
    let orderNumber = 0;
     // matching # vs A-Z prefix required different approaches
    const orderPrefix = companyObject.orderPrefix;
    let regexExpression = returnRegexStructure(orderPrefix);

    if (subject.match(new RegExp(regexExpression, 'g'))) {
      const found = subject.match(new RegExp(regexExpression, 'g'));
      let orderWithPrefix = found[0];
      let orderNumberArray = orderWithPrefix.split(`${orderPrefix}`);

      console.log('checkSubjectWithCompanyPrefix subject...', subject);
      console.log('checkSubjectWithCompanyPrefix array...', orderNumberArray);

      // finally get rid of any unforeseen letters
      orderNumber = removeLettersFromOrderNumber(orderNumberArray);
    }

    console.log('will return', typeof(orderNumber));
    return orderNumber; 
  }

  async function checkSubjectWithGenericPrefix (subject) {
    const prefixes = constants.PREFIXES;
    let orderNumber = 0;
    prefixes.some(regexPrefix => {
      console.log(`checking against ${regexPrefix}`);

      const regex = `\\b(\\w*${regexPrefix}\\s*\\w*)\\b`;

      // if it matches this prefix
      if (subject.match(new RegExp(regex, 'g'))) {
        const found = subject.match(new RegExp(regex, 'g'));
        console.log('trying to use subject..', found);
        // NEED TO CHECK FOR NUMBERS HERE!!!!

        let orderWithPrefix = found[0];
        let orderNumberArray = orderWithPrefix.split(`${regexPrefix}`);

        const orderNumberArrayNoSpaces = orderNumberArray.map(str => str.replace(/\s/g, ''));
        orderNumber = removeLettersFromOrderNumber(orderNumberArrayNoSpaces);
        return true;
      } else {
        return false; // needed to keep 'some' looping over
      }
    });

    console.log('will return', orderNumber);
    return orderNumber;
  }


  function returnRegexStructure (companyPrefix) {
    const orderPrefix = companyPrefix
    let regexExpression = ``;
    const mutableRegex = `\\b(\\w*${orderPrefix}\\s*\\w*)\\b`;

    if (orderPrefix.includes('#')) {
      regexExpression = `\\${orderPrefix}\\s*(?=\\w*)\\w+`
    } else {  
      regexExpression = mutableRegex;
    }

    return regexExpression;
  }

  function removeLettersFromOrderNumber (checkArray) {
    // finally get rid of any unforeseen letters
    let orderNumber = 0;
    const letterRegExp = new RegExp(`[a-zA-Z]`, 'g');
    const stringToCheck = checkArray[1] || checkArray[0];
    console.log('check array?', checkArray);

    if (letterRegExp.test(stringToCheck)) {
      console.log('needed to get rid of Letter..');
      const foundWithLetter = stringToCheck.split(letterRegExp);
      orderNumber = foundWithLetter[foundWithLetter.length - 1];
    } else {  
      orderNumber = stringToCheck;
    }

    return orderNumber;
  }