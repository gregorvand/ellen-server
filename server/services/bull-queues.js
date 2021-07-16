const Bull = require('bull')
const pointsTransactionQueue = new Bull('points-queue-first')
const earningsQueue = new Bull('earnings-to-process-queue')

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
  // *------------------------------------------------*
}

const initEarningsQueues = async function () {
  earningsQueue.process(async (job) => {
    return console.log('yow processed!', job.data)
  })
}

module.exports = {
  initPointsTransactionQueues: initPointsTransactionQueues,
  initEarningsQueues: initEarningsQueues,
  pointsTransactionQueue: pointsTransactionQueue,
  earningsQueue: earningsQueue,
}
