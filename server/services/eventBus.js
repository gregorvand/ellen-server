const EventEmitter = require('events')
const eventEmitter = new EventEmitter()
// const listenForEvents = function () {
//   console.log('will listen..')
//   eventEmitter.on('start', (data) => {
//     console.log(`started ${data}`)
//   })
// }

module.exports.eventEmitter = eventEmitter
