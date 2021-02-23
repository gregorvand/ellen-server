const Companies = require('../../server/controllers/companies');

const renderAdminCompanies = function(req, res) {
  const allCompanyPromise = Companies.internalList().then(returnedCompanies => {
    allCompanies = returnedCompanies
  })
  
  Promise.all([allCompanyPromise]).then(() => {
    res.render("admin/companies", { 
      companies: allCompanies
    });
  })
}

module.exports.renderAdminCompanies = renderAdminCompanies; 