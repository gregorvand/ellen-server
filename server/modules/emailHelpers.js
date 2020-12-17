module.exports = {
  returnOrderNumber: function (subject) {
    console.log(`${subject} was the order number`);
  },

  parseSubjectForOrder: function(req) {
    console.log('subject?', req.headers['subject']);
  }
};
