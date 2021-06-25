import Vue from 'vue'

export const namespaced = true

export const state = {
  liveEarnings: [],
}

export const getters = {
  getterValue: (state) => {
    return state.value
  },
}

export const mutations = {
  PUSH(state, report) {
    report.forEach((company) => {
      state.liveEarnings.push({
        ...company,
      })
    })
  },
}

export const actions = {
  addReportToEarnings({ commit }, report) {
    commit('PUSH', report)
  },
}
