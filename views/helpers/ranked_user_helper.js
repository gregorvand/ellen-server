const pointsController = require('../../server/controllers/points');

async function getRankedUsers(req, res) {
  const rankedResult = pointsController.dailyRankedList()
  .then(returnedUsers => {
    const records = returnedUsers.map(result => result.dataValues);
    return records;
  })
  .catch((error) => res.status(400).send(error));

  return await rankedResult;
}

module.exports.renderRankedUsers = getRankedUsers;