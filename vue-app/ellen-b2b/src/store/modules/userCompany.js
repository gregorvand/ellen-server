export const namespaced = true // ie user/[action]

export const state = {
  userCompanies: [],
}

export const mutations = {
  PUSH(state, company) {
    state.userCompanies.push({
      ...company,
      id: company.id,
    })
    localStorage.setItem('companies', JSON.stringify(state.userCompanies))
  },
  REMOVE(state, companyToRemove) {
    state.userCompanies = state.userCompanies.filter(
      (company) => company.id !== companyToRemove.id
    )
    localStorage.setItem('companies', JSON.stringify(state.userCompanies))
  },
}

export const actions = {
  addUserCompany({ commit }, company) {
    commit('PUSH', company)
  },
  removeUserCompany({ commit }, company) {
    commit('REMOVE', company)
  },
}
