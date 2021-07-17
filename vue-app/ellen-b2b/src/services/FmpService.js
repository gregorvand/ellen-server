// service for https://financialmodelingprep.com/ API

import axios from 'axios'

const apiKey = '618a872a67c27ab884357f853a051837' // change to real/env variable

const apiClient = axios.create({
  baseURL: `https://financialmodelingprep.com/api/v3`,
  withCredentials: false, // This is the default
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export default {
  getRatios(ticker) {
    return apiClient.get(
      `/ratios/${ticker}?period=quarter&limit=140&apikey=${apiKey}` // change to use real ticker
    )
  },
}
