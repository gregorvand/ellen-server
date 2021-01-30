const Company = require('../../server/models').Company;
const Order = require('../../server/models').Order;

const renderCompanyPage = function(req, res) {
  getCompanyForPage(req).then(returnedCompany => {
    res.render("company", { 
      company: returnedCompany
    });
  })
}


function getCompanyForPage(req, res) {
  return Company
  .findByPk(req.params.id, {
    include: [{
      model: Order,
      as: 'orders',
    }],
  })
    .then((company) => company)
    .catch((error) => console.error('error with company page lookup', error));
}

module.exports.renderCompanyPage = renderCompanyPage;