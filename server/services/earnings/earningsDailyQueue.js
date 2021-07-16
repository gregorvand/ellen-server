require('dotenv').config()

// every [day] (test: minute) add all rows to queue from EarningCalendar where stored is false
// batch through these 10 at a time using

// test
// addEventsForProcessing()

const { addEventProcessingQueue } = require('../bull-queues')
async function cronAddEvents() {
  console.log('did this')
  addEventProcessingQueue.add(
    { event: 'activate initEarningsQueues' },
    { repeat: { cron: '1 * * * *' } }
  )
}

// test: this function should otherwise be started and not stopped
cronAddEvents()
