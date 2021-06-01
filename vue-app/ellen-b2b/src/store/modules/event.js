import EventService from '@/services/EventService.js'

export const state = {
  events: [],
  eventsTotal: 0,
  event: {},
}

export const mutations = {
  ADD_EVENT(state, event) {
    state.events.push(event)
  },
  SET_EVENTS(state, events) {
    state.events = events
  },
  SET_TOTAL(state, eventsTotal) {
    state.eventsTotal = eventsTotal
  },
  SET_EVENT(state, event) {
    state.event = event
  },
}
export const actions = {
  createEvent({ commit }, event) {
    return EventService.postEvent(event).then(() => {
      commit('ADD_EVENT', event)
    })
  },
  fetchEvents({ commit }, { perPage, currentPage }) {
    EventService.getEvents(perPage, currentPage)
      .then((response) => {
        console.log('Total events are ' + response.headers['x-total-count'])
        commit('SET_TOTAL', parseInt(response.headers['x-total-count']))
        commit('SET_EVENTS', response.data)
      })
      .catch((error) => {
        console.log('There was an error:', error.response)
      })
  },
}

export const getters = {
  catLength: (state) => {
    return state.categories.length
  },
  activeTodosCount: (state, getters) => {
    // getters within getters
    return state.todos.length - getters.doneTodos.length
  },
  getEventById: (state) => (id) => {
    // dynamic getters
    return state.events.find((event) => event.id === id)
  },
}
