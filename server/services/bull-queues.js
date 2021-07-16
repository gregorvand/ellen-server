const Bull = require('bull')
const pointsTransactionQueue = new Bull('points-queue-first')
const earningsQueue = new Bull('earnings-to-process-queue', {
  limiter: {
    max: 10,
    duration: 1000,
  },
})
const addEventProcessingQueue = new Bull('event-processing-cron-queue')

const initPointsTransactionQueues = async function () {
  pointsTransactionQueue.process(async (job) => {
    return console.log('yow processed!', job.data)
  })

  // *------------------------------------------------*
  // TO CLEAR OUT REPEATABLE JOBS, RUN THIS CODE ONCE
  // IT WILL CLEAR OUT --ALL-- REPEATABLE JOBS
  // const repeatable = await pointsTransactionQueue.getRepeatableJobs();
  // repeatable.forEach(async (job) => {
  //     await pointsTransactionQueue.removeRepeatableByKey(job.key);
  // });
  // const repeatable = await earningsQueue.getRepeatableJobs()
  // repeatable.forEach(async (job) => {
  //   await earningsQueue.removeRepeatableByKey(job.key)
  // })
  // *------------------------------------------------*
}

const EarningCalendar = require('../models').EarningCalendar
const { getAndStoreQuarterlyEarnings } = require('../controllers/earnings')

const initEarningsQueues = async function () {
  earningsQueue.process(async (job) => {
    return EarningCalendar.findOne({
      where: {
        id: job.data.eventToProcess,
      },
    }).then((result) => {
      console.log(result.dataValues.ticker)
      getAndStoreQuarterlyEarnings([result])
    })
  })
}

// on a process, do function

async function addEventsForProcessing() {
  const allToProcess = await EarningCalendar.findAll({
    where: {
      storedEarning: false,
    },
    order: [['date', 'DESC']],
  })

  allToProcess.forEach((calendarEvent) => {
    console.log(calendarEvent.dataValues.ticker)
    earningsQueue.add({
      eventToProcess: calendarEvent.dataValues.id,
    })
  })
}

const initProcessEarningsQueueCron = async function () {
  addEventProcessingQueue.process(async (job) => {
    // addEventsForProcessing()
    console.log(job.data)
    return addEventsForProcessing()
  })
}

module.exports = {
  initPointsTransactionQueues: initPointsTransactionQueues,
  initEarningsQueues: initEarningsQueues,
  initProcessEarningsQueueCron: initProcessEarningsQueueCron,
  addEventsForProcessing: addEventsForProcessing,
  pointsTransactionQueue: pointsTransactionQueue,
  earningsQueue: earningsQueue,
  addEventProcessingQueue: addEventProcessingQueue,
}
