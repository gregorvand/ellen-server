// every [hour] add all rows to queue from EarningCalendar where stored is false
// batch through these 10 at a time using

const {
  addEarningProcessingQueue,
  addCalendarProcessingQueue,
} = require('../bull-queues')

async function initCronAddEarnings() {
  console.log('init cron for getting events every hour')
  addEarningProcessingQueue.add(
    { event: 'activate initEarningsQueues' },
    { repeat: { cron: '03 * * * *' } } // 1st minute of every hour, every day
  )
}

async function initCronAddCalendarEvents() {
  console.log('init cron for getting cal events every hour')
  addCalendarProcessingQueue.add(
    { event: 'activate initCalQueues' },
    { repeat: { cron: '01 * * * *' } } // 1st minute of every hour, every day
  )
}

// test: this function should otherwise be started and not stopped
module.exports = {
  initCronAddEarnings: initCronAddEarnings,
  initCronAddCalendarEvents: initCronAddCalendarEvents,
}
