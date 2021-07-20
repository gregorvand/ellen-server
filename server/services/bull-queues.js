const Bull = require('bull')

let redisHost = ''
if (process.env.NODE_ENV == 'development') {
  redisHost = '127.0.0.1:6379'
} else if (process.env.NODE_ENV == 'production') {
  redisHost = '172.17.0.4:6379' // DO container IP: see readme
}

// QUEUE SET UP
const pointsTransactionQueue = new Bull('points-queue-first')
const earningsQueue = new Bull(
  'earnings-to-process-queue',
  `redis://${redisHost}`,
  {
    limiter: {
      max: 10,
      duration: 1000,
    }, //limit to help with FMP rate limit
  }
)
const addEarningProcessingQueue = new Bull(
  'event-processing-cron-queue',
  `redis://${redisHost}`
)
const addCalendarProcessingQueue = new Bull(
  'get-calendar-events-cron-queue',
  `redis://${redisHost}`
)

const addEmailProcessingQueue = new Bull(
  'email-public-earnings-cron-queue',
  `redis://${redisHost}`
)

const initPointsTransactionQueues = async function () {
  pointsTransactionQueue.process(async (job) => {
    return console.log('yow processed!', job.data)
  })
}

const EarningCalendar = require('../models').EarningCalendar
const {
  getAndStoreQuarterlyEarnings,
  sendEmailFromTickers,
} = require('../controllers/earnings')
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
    console.log('init addCalendarProcessingQueue completed', job.data)
    return getAndStoreCalendarEvents()
  })
}

const DailyEmail = require('../models').DailyEmail
const axios = require('axios')
// now send
axios.defaults.headers.common[
  'Authorization'
] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxNzksImZpcnN0TmFtZSI6IkciLCJsYXN0TmFtZSI6IlYiLCJlbWFpbCI6ImdyZWdvcis4MTdwd0BlbGxlbi5tZSIsInBhc3N3b3JkIjoiJDJiJDEwJGxGbE8wYXNzWEhyTlFXQnRJNHFYTE9wY044WTRKcnozMEhvUTI2bUk0UXMzU1kzSjU0QUxXIiwiaWRlbnRpZmllciI6InVuZGVmaW5lZCIsInVwZGF0ZWRBdCI6IjIwMjEtMDctMDlUMDA6MTc6MzguOTI3WiIsImNyZWF0ZWRBdCI6IjIwMjEtMDctMDlUMDA6MTc6MzguOTI3WiIsInVzZXJuYW1lIjpudWxsLCJhY3RpdmF0ZWQiOm51bGx9LCJpYXQiOjE2MjU3ODk4NTl9.ALi-9a_fzJK0R8nblutGEVHDpgyiUIxUxw2vfc60UNY`
const initEmailPublicCompanyDataSend = async function () {
  addEmailProcessingQueue.process(async (job) => {
    console.log('nå processing')
    const allEmailsToSend = await DailyEmail.findAll({
      where: {
        sent: false,
      },
    })

    allTickers = []
    allEmailsToSend.forEach(async (emailForCompany) => {
      allTickers.push(emailForCompany.dataValues.tickers[0])
    })

    console.log(allTickers)
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
  initEmailPublicCompanyDataSend: initEmailPublicCompanyDataSend,
  addEventsForProcessing: addEventsForProcessing,
  pointsTransactionQueue: pointsTransactionQueue,
  earningsQueue: earningsQueue,
  addEarningProcessingQueue: addEarningProcessingQueue,
  addCalendarProcessingQueue: addCalendarProcessingQueue,
  addEmailProcessingQueue: addEmailProcessingQueue,
}

// *------------------------------------------------*
// TO CLEAR OUT REPEATABLE JOBS, RUN THIS CODE ONCE
// IT WILL CLEAR OUT --ALL-- REPEATABLE JOBS
// const repeatable1 = await pointsTransactionQueue.getRepeatableJobs();
// repeatable.forEach(async (job) => {
//     await pointsTransactionQueue.removeRepeatableByKey(job.key);
// });

// *------------------------------------------------*
