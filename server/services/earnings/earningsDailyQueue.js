// every [day] (test: minute) add all rows to queue from EarningCalendar where stored is false
// batch through these 10 at a time using
const EarningCalendar = require('../../../server/models').EarningCalendar
const earningsQueue = require('../bull-queues').earningsQueue

async function addEventsForProcessing() {
  const allToProcess = await EarningCalendar.findAll({
    where: {
      storedEarning: false,
    },
    order: [['date', 'DESC']],
  })

  allToProcess.forEach((calendarEvent) => {
    console.log(calendarEvent.dataValues.id)
    earningsQueue.add({
      eventToProcess: calendarEvent.dataValues.id,
    })
  })
}

module.exports = {
  addEventsForProcessing: addEventsForProcessing,
}

// test
addEventsForProcessing()
