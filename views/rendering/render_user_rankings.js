const pointsController = require('../../server/controllers/points');

const renderRankedUsers = function(req, res) {
  const dailyRankedUsersPromise = pointsController.dailyRankedList(req, res, true)
  .then(returnedUsers => {
    rankedUsers = returnedUsers
  })
  .catch((error) => res.status(400).send(error));
  
  Promise.all([dailyRankedUsersPromise]).then(() => {
    res.render("admin/user_rankings", { 
      rankedUserList: rankedUsers
    });
  })
}

module.exports.renderRankedUsers = renderRankedUsers;