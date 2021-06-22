import EventService from '@/services/EventService.js'

export const state = {
  events: [],
  eventsTotal: 0,
  event: {},
}

export const namespaced = true

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
  createEvent({ commit, dispatch }, event) {
    return EventService.postEvent(event).then(() => {
      commit('ADD_EVENT', event)
      const notification = {
        type: 'success',
        message: 'Your event has been created!',
      }
      dispatch('notification/add', notification, { root: true })
    })
  },

  fetchEvents({ commit, dispatch }, { perPage, currentPage }) {
    EventService.getEvents(perPage, currentPage)
      .then((response) => {
        commit('SET_TOTAL', parseInt(response.headers['x-total-count']))
        commit('SET_EVENTS', response.data)
      })
      .catch((error) => {
        const notification = {
          type: 'error',
          message: 'There was a problem fetching events: ' + error.message,
        }
        dispatch('notification/add', notification, { root: true })
      })
  },

  fetchEvent({ commit, getters, dispatch }, id) {
    let event = getters.getEventById(id)

    if (event) {
      commit('SET_EVENT', event)
    } else {
      EventService.getEvent(id)
        .then((response) => {
          commit('SET_EVENT', response.data)
        })
        .catch((error) => {
          const notification = {
            type: 'error',
            message:
              'There was a problem fetching this event: ' + error.message,
          }
          dispatch('notification/add', notification, { root: true })
        })
    }
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
