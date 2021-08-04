// every [hour] add all rows to queue from EarningCalendar where stored is false
// batch through these 10 at a time using

const {
  addEarningProcessingQueue,
  addCalendarProcessingQueue,
  addEmailProcessingQueue,
} = require('../bull-queues')

async function initCronAddEarnings() {
  console.log('init cron for getting events every hour')
  addEarningProcessingQueue.add(
    { event: 'activate initEarningsQueues' },
    { repeat: { cron: '03 2,4,6,10 * * *' } } // 3rd minute of every hour, every day
  )
}

async function initCronAddCalendarEvents() {
  console.log('init cron for getting cal events every hour')
  addCalendarProcessingQueue.add(
    { event: 'activate initCalQueues' },
    { repeat: { cron: '01 2,4,6,10 * * *' } } // 1st minute of every hour, every day
  )
}

async function initCronEmailPublicResults() {
  console.log('init cron for sending emails for public companies')
  addEmailProcessingQueue.add(
    { event: 'activate initEmailQueues' },
    { repeat: { cron: '45 2,4,6,10 * * *' } } // 1st minute of every hour, every day
  )
}

// test: this function should otherwise be started and not stopped
module.exports = {
  initCronAddEarnings: initCronAddEarnings,
  initCronAddCalendarEvents: initCronAddCalendarEvents,
  initCronEmailPublicResults: initCronEmailPublicResults,
}
