const Bull = require('bull')

// QUEUE SET UP
const pointsTransactionQueue = new Bull(
  'points-queue-first',
  'redis://206.189.182.91:6379'
)
const earningsQueue = new Bull(
  'earnings-to-process-queue',
  'redis://206.189.182.91:6379',
  {
    limiter: {
      max: 10,
      duration: 1000,
    }, //limit to help with FMP rate limit
  }
)
const addEarningProcessingQueue = new Bull(
  'event-processing-cron-queue',
  'redis://206.189.182.91:6379'
)
const addCalendarProcessingQueue = new Bull(
  'get-calendar-events-cron-queue',
  'redis://206.189.182.91:6379'
)

const initPointsTransactionQueues = async function () {
  pointsTransactionQueue.process(async (job) => {
    return console.log('yow processed!', job.data)
  })
}

const EarningCalendar = require('../models').EarningCalendar
const { getAndStoreQuarterlyEarnings } = require('../controllers/earnings')
const { getAndStoreCalendarEvents } = require('../controllers/earningCalendar')

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
    order: [['date', 'ASC']],
  })

  allToProcess.forEach((calendarEvent) => {
    console.log(calendarEvent.dataValues.ticker)
    earningsQueue.add({
      eventToProcess: calendarEvent.dataValues.id,
    })
  })
}

const initProcessEarningsQueueCron = async function () {
  addEarningProcessingQueue.process(async (job) => {
    // addEventsForProcessing()
    console.log(job.data)
    return addEventsForProcessing()
  })
}

const initGetCalendarEventsQueueCron = async function () {
  addCalendarProcessingQueue.process(async (job) => {
    console.log(job.data)
    return getAndStoreCalendarEvents()
  })
}

// fire below event to clear daily repeats
const clearRepeatable = async function () {
  const repeatable2 = await addEarningProcessingQueue.getRepeatableJobs()
  repeatable2.forEach(async (job) => {
    const done = await addEarningProcessingQueue.removeRepeatableByKey(job.key)
    console.log(done)
  })

  const repeatable3 = await addCalendarProcessingQueue.getRepeatableJobs()
  repeatable3.forEach(async (job) => {
    const done = await addCalendarProcessingQueue.removeRepeatableByKey(job.key)
    console.log(done)
  })
}

// clearRepeatable()

module.exports = {
  initPointsTransactionQueues: initPointsTransactionQueues,
  initEarningsQueues: initEarningsQueues,
  initProcessEarningsQueueCron: initProcessEarningsQueueCron,
  initGetCalendarEventsQueueCron: initGetCalendarEventsQueueCron,
  addEventsForProcessing: addEventsForProcessing,
  pointsTransactionQueue: pointsTransactionQueue,
  earningsQueue: earningsQueue,
  addEarningProcessingQueue: addEarningProcessingQueue,
  addCalendarProcessingQueue: addCalendarProcessingQueue,
}

// *------------------------------------------------*
// TO CLEAR OUT REPEATABLE JOBS, RUN THIS CODE ONCE
// IT WILL CLEAR OUT --ALL-- REPEATABLE JOBS
// const repeatable1 = await pointsTransactionQueue.getRepeatableJobs();
// repeatable.forEach(async (job) => {
//     await pointsTransactionQueue.removeRepeatableByKey(job.key);
// });

// *------------------------------------------------*
