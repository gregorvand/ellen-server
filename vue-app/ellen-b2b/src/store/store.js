import Vue from 'vue'
import Vuex from 'vuex'
import EventService from '@/services/EventService.js'
import * as user from '@/store/modules/user.js'
import * as event from '@/store/modules/event.js'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user, // Include this module
    event,
  },
  state: {
    categories: [
      'sustainability',
      'nature',
      'animal welfare',
      'housing',
      'education',
      'food',
      'community',
    ],
  },
})
