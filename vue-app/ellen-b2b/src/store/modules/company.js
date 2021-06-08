export const namespaced = true // ie user/[action]

export const state = {
  selectedCompanies: [],
}

export const getters = {
  getterValue: (state) => {
    return state.value
  },
}

export const mutations = {
  PUSH(state, company) {
    state.selectedCompanies.push({
      ...company,
      id: company.id,
    })
    localStorage.setItem('companies', JSON.stringify(state.selectedCompanies))
  },
  REMOVE(state, companyToRemove) {
    state.selectedCompanies = state.selectedCompanies.filter(
      (company) => company.id !== companyToRemove.id
    )
    localStorage.setItem('companies', JSON.stringify(state.selectedCompanies))
  },
}

export const actions = {
  addCompanyToSelection({ commit }, company) {
    commit('PUSH', company)
  },
  removeCompanySelection({ commit }, company) {
    commit('REMOVE', company)
  },
}
