import CompanyService from '@/services/CompanyService.js'

export const namespaced = true // ie user/[action]

export const state = () => ({
  currentCompany: {},
})

export const mutations = {
  SET_COMPANY(state, company) {
    state.currentCompany = company
  },
}

export const actions = {
  fetchCompany({ commit, dispatch }, id) {
    CompanyService.getCompany(id)
      .then((response) => {
        commit('SET_COMPANY', response.data)
      })
      .catch((error) => {
        const notification = {
          type: 'error',
          message:
            'There was a problem fetching this company: ' + error.message,
        }
        dispatch('notification/add', notification, { root: true })
      })
  },
}

export const getters = {
  getCompany: (state) => {
    return state.currentCompany
  },
}
