import CompanyService from '@/services/CompanyService.js'
import FmpService from '@/services/FmpService'

export const namespaced = true // ie user/[action]

export const state = () => ({
  currentCompany: {},
  publicData: {},
})

export const mutations = {
  SET_COMPANY(state, company) {
    state.currentCompany = company
  },
  SET_PUBLIC_DATA(state, data) {
    state.publicData = data
  },
}

export const actions = {
  fetchCompany({ commit, dispatch }, id) {
    CompanyService.getCompany(id)
      .then((response) => {
        commit('SET_COMPANY', response.data)
        if (response.data.ticker !== '') {
          dispatch('fetchPublicCompanyRatios', response.data.ticker)
        }
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
  // default 0 to return only latest period. Set as blank for all periods available
  fetchPublicCompanyRatios({ commit, dispatch }, ticker, period = 0) {
    FmpService.getRatios(ticker)
      .then((response) => {
        commit('SET_PUBLIC_DATA', [response.data[`${period}`]])
      })
      .catch((error) => {
        const notification = {
          type: 'error',
          message:
            'There was a problem fetching this company data from FMP: ' +
            error.message,
        }
        dispatch('notification/add', notification, { root: true })
      })
  },
}

export const getters = {
  getCompanyTicker: (state) => {
    return state.currentCompany.ticker
  },
}
