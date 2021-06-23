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
    state.liveEarnings.push({
      ...report,
    })
  },
}

export const actions = {
  addReportToEarnings({ commit }, report) {
    commit('PUSH', report)
  },
}
