import axios from 'axios'

export const namespaced = true // ie user/[action]

export const state = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
}

export const mutations = {
  SET_USER_DATA(state, userData) {
    state.user = userData
    localStorage.setItem('user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
  },
}

export const actions = {
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
  login({ commit }, credentials) {
    return axios
      .post('//localhost:8000/api/login', credentials)
      .then(({ data }) => {
        commit('SET_USER_DATA', data)
      })
  },
}

export const getters = {
  loggedIn(state) {
    return !!state.user
  },
}
