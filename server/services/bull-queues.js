const Bull = require('bull')
const pointsTransactionQueue = new Bull('points-queue-first')
const earningsQueue = new Bull('earnings-to-process-queue', {
  limiter: {
    max: 10,
    duration: 1000,
  },
})

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

module.exports = {
  initPointsTransactionQueues: initPointsTransactionQueues,
  initEarningsQueues: initEarningsQueues,
  pointsTransactionQueue: pointsTransactionQueue,
  earningsQueue: earningsQueue,
}
