import axios from 'axios'
export const namespaced = true // ie user/[action]

export const state = {
  results: [],
}

export const getters = {
  getSearchResults: (state) => {
    return state.results
  },
}

export const mutations = {
  SET_SEARCH_RESULTS(state, payload) {
    state.results = payload.hits.hits
  },
}

export const actions = {
  doSearchQuery({ commit }, payload) {
    const searchQuery = [
      {
        from: 0,
        size: 100,
        query: {
          fuzzy: {
            companyName: {
              value: 'unconfirmed',
            },
          },
        },
      },
    ]
    return axios
      .get('//localhost:9200/csjoblist/_search', searchQuery, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(({ data }) => {
        commit('SET_SEARCH_RESULTS', data)
        console.log('well..', data)
      })
  },
}
