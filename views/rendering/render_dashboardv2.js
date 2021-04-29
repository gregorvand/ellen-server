const Points = require('../../server/models').Point;
const dashboardHelpers = require('../../views/helpers/dashboard_helpers');
const rankedUserHelpers = require('../../views/helpers/ranked_user_helper');
const pointsServiceCalculator = require('../../server/services/points/point_calculators');
const Op = require('sequelize').Op;
const dateObjects = require('../../server/utils/setTimezone'); // timezone adjusted instance


const renderDashboardv2 = function(req, res) {

  const pointsByUserPromise = getPointsByUser(req.user.id).then(returnedPoints => {
    userPoints = returnedPoints;
  })

  const date1 = dateObjects.startofTodayBySetTimezone;
  const date2 = dateObjects.endofTodayBySetTimezone;
  
  const pointsTodayPromise = pointsServiceCalculator.calculateAllPointsWithTimeframe(req.user.id, date1, date2).then(returnedPoints => {
    console.log('TOTAL TODAY', returnedPoints);
    pointsToday = returnedPoints;
  });

  const totalAllPointsPromise = pointsServiceCalculator.calculateAllPoints(req.user.id).then(returnedTotal => {
    totalPoints = returnedTotal
  });
  
  const rankedUserPromise = rankedUserHelpers.renderRankedUsers(req, res).then(returnedList => {
    rankedList = returnedList
  });
  

  Promise.all([pointsByUserPromise, pointsTodayPromise, totalAllPointsPromise, rankedUserPromise]).then(() => {
    res.render("dashboardv2", { 
      user: req.user,
      points: userPoints,
      pointsCount: pointsToday,
      totalPoints: totalPoints,
      helpers: dashboardHelpers,
      rankedUserList: rankedList
    });
  })
}

function getPointsByUser (id) {
  return Points
  .findAll({
    where: {
      customerId: id
    },
    limit: 6,
    order: [ ['createdAt', 'DESC'] ]
  })
};


module.exports.renderDashboardv2 = renderDashboardv2;