module.exports = {
  returnOrderNumber: function (subject) {
    // TODO: get prefix from Company record first
    // const prefix = "\#";
    // const regex = "\#(?=\w*)\w+"
    try {
      console.log(subject);
      const found = subject.match(/\#(?=\w*)\w+/g);
      console.log(`${found[0]} was the order number`);
      console.log(typeof(subject));
    } catch(err) {
      console.error(err, 'probably no regex match');
      return 'No match to the defined prefix'
    }
  },

  parseSubjectForOrder: function(req) {
    console.log('subject?', req.headers['subject']);
  }
};
