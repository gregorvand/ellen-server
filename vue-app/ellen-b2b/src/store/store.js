import Vue from 'vue'
import Vuex from 'vuex'

import * as user from '@/store/modules/user.js'
import * as event from '@/store/modules/events.js'
import * as notification from '@/store/modules/notification.js'

import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    event,
    notification,
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
  mutations: {
  SET_USER_DATA (state, userData) {
    state.user = userData
    localStorage.setItem('user', JSON.stringify(userData))    
  },
  actions: {
    register({ commit }, credentials) {
      console.log(credentials)
      return axios
        .post('//localhost:8000/api/users', credentials, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(({ data }) => {
          console.log('user data iszz', data)
          commit('SET_USER_DATA', data)
        })
    },
  },
})
