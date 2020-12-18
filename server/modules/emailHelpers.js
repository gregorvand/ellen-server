
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

  module.exports.returnOrderNumber = returnOrderNumber;