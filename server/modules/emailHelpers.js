
const formidable = require('formidable');
const cheerio = require('cheerio'); // html parser, jquery-like syntax
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
var constants = require('../utils/constants');

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
  
  async function returnOrderNumber (subject, companyObject, plainContent) {
    console.log('the company?', companyObject);
    console.log('the prefix?', companyObject.orderPrefix);
    console.log('original subject: ', subject);
    const orderPrefix = companyObject.orderPrefix;
    
    let regexExpression = ``;
    const mutableRegex = `\\b(\\w*${orderPrefix}\\s*\\w*)\\b`;

    // matching # vs A-Z prefix required different approaches
    if (orderPrefix.includes('#')) {
      regexExpression = `\\${orderPrefix}\\s*(?=\\w*)\\w+`
      console.log('using #-based');
    } else {  
      regexExpression = mutableRegex;
    }

    console.log('using', regexExpression);


    // always check for a number in subject before moving on 
    const containsNumbersRegExp = new RegExp(`[1-9]`, 'g');


    try {
      if (subject.match(new RegExp(regexExpression, 'g'))) {
        const found = subject.match(new RegExp(regexExpression, 'g'));
        let orderWithPrefix = found[0];
        let orderNumberArray = orderWithPrefix.split(`${orderPrefix}`);

        // finally get rid of any unforeseen letters
        const letterRegExp = new RegExp(`[a-zA-Z]`, 'g');
        const checkString = orderNumberArray[1];

        if (letterRegExp.test(checkString)) {
          console.log('needed to get rid of Letter..');
          const foundWithLetter = checkString.split(letterRegExp);
          orderNumberFound = foundWithLetter[foundWithLetter.length -1];          
        } else {
          orderNumberFound = orderNumberArray[1];
        }

        return orderNumberFound;
      } else {
          let orderNumberFound = 0;
          const prefixes = constants.PREFIXES;
          
          prefixes.some(regexPrefix => {
            console.log(`checking against ${regexPrefix}`);

            // ***WE NEED TO STOP LETTERS BEING ACCEPTED HERE: ONLY RETURN SOMETHING THAT IS A NUMBER, OR NULL  

            const regex = `\\b(\\w*${regexPrefix}\\s*\\w*)\\b`;
            if (subject.match(new RegExp(regex, 'g') && containsNumbersRegExp.test(subject))) {
              const found = subject.match(new RegExp(regex, 'g'));
              console.log('trying to use subject..', found);
    
              let orderWithPrefix = found[0];
              let orderNumberArray = orderWithPrefix.split(`${regexPrefix}`);

              const letterRegExp = new RegExp(`[a-zA-Z]`, 'g');
              const checkString = orderNumberArray[1];

              if (letterRegExp.test(checkString)) {
                console.log('needed to get rid of Letter..');
                const foundWithLetter = checkString.split(letterRegExp);
                orderNumberFound = foundWithLetter[foundWithLetter.length -1];          
              } else {
                orderNumberFound = orderNumberArray[1];
              }

              orderNumberFound = orderNumberArray[1];
   
              return true;
             } else if (plainContent.match(new RegExp(regex, 'g'))){
              const found = plainContent.match(new RegExp(regex, 'g'));

              console.log('trying to use content..', found);
           
              let orderWithPrefix = found[0];
              let orderNumberArray = orderWithPrefix.split(`${regexPrefix}`);

              return orderNumberArray[1];

            } else {
              return false;
            }
        });

        return orderNumberFound;
      }
    } catch(err) {
      console.error("still could not match regex!", err);
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
    let getDateFromText = fromCompanyEmailGmailSpan.match(/Date:(.*)Subject/gi);
    console.log(getDateFromText); 
    const start = `Date: `;
    const end = `Subject`;
    let theDateString  = getDateFromText[0].split(start)[1].split(end)[0];
    theDateString = theDateString.replace(' at', '');
    let theDateArray = theDateString.split(', ');
    theDateArray = theDateArray.splice(1,2);
    theDateArray = theDateArray.join(' ');

    console.log('date to parse', theDateArray);
   
    const dateFormatsToParse = constants.DATE_FORMATS;
    let theOrderDate = false;

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
          return false;
        }
      })

      return theOrderDate;
    }


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


    // const contentWithCompanyPrefix = await checkEmailContentWithCompanyPrefix(plainContent, companyObject).then(numberReturned => {
    //   emailContentWithCompanyPrefixResult = numberReturned;
    // });

    Promise.all([
      subjectWithCompanyPrefix,
      subjectWithGenericPrefix
    ]).then((values) => {
      console.log('got either?', subjectWithCompanyPrefixResult, subjectWithGenericPrefixResult);
    });


    // check all results and see which contains a number
    const containsNumbersRegExp = new RegExp(`[1-9]`, 'g');
    const results = [subjectWithCompanyPrefixResult, subjectWithGenericPrefixResult];
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

    return orderNumber; 
  }

  async function checkSubjectWithGenericPrefix (subject) {
    const prefixes = constants.PREFIXES;
    let orderNumber = 0;
    prefixes.some(regexPrefix => {
      console.log(`checking against ${regexPrefix}`);

      const regex = `\\b(\\w*${regexPrefix}\\s*\\w*)\\b`;

      // if it matches this prefix and the match has some numbers in it..
      if (subject.match(new RegExp(regex, 'g'))) {
        const found = subject.match(new RegExp(regex, 'g'));
        console.log('trying to use subject..', found);

        let orderWithPrefix = found[0];
        let orderNumberArray = orderWithPrefix.split(`${regexPrefix}`);

        const orderNumberArrayNoSpaces = orderNumberArray.map(str => str.replace(/\s/g, ''));
        orderNumber = removeLettersFromOrderNumber(orderNumberArrayNoSpaces); // CHECKED!
        return true;
      } else {
        return false; // needed to keep 'some' looping over
      }
    });

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
    const stringToCheck = checkArray[1];
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


module.exports.returnOrderNumber = returnOrderNumber;
module.exports.returnOrderNumberV2 = returnOrderNumberV2;
module.exports.returnOrderDate = returnOrderDate;
module.exports.parseEmail = parseEmail;
module.exports.findCompanyByEmail = findCompanyByEmail;
module.exports.findCustomerByEmail = findCustomerByEmail;
module.exports.getField = getField;