import axios from 'axios'
export const namespaced = true // ie user/[action]

export const state = {
  results: [],
  currentQuery: '',
}

// export const getters = {
//   getSearchResults: (state) => {
//     return state.search.results
//   },
// }

export const mutations = {
  SET_SEARCH_RESULTS(state, payload) {
    state.results = payload
  },
}

export const actions = {
  doSearchQuery({ commit }, currentQuery) {
    const searchQuery = {
      from: 0,
      size: 100,
      query: {
        fuzzy: {
          companyName: {
            fuzziness: '2',
            value: currentQuery || '',
          },
        },
      },
    }

    return axios
      .post('//localhost:9200/csjoblist/_search', searchQuery)
      .then(({ data }) => {
        console.log(data)
        const results = data.hits['hits'].map((result) => result._source) // map from ES format
        commit('SET_SEARCH_RESULTS', results)
      })
  },
}
