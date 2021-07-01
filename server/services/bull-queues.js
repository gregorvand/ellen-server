const Bull = require('bull')
const pointsTransactionQueue = new Bull('points-queue-first')

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

module.exports.pointsTransactionQueue = pointsTransactionQueue
module.exports.initPointsTransactionQueues = initPointsTransactionQueues
