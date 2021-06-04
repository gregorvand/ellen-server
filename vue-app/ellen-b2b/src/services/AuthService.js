// added by gregor

import axios from 'axios'

const apiClient = axios.create({
  baseURL: `http://localhost:3000`,
  withCredentials: false, // This is the default
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// export default {
//   getLogin() {
//     return apiClient.get(`/events?_limit=${perPage}&_page=${currentPage}`)
//   },
//   getRegister(id) {
//     return apiClient.get('/events/' + id)
//   },
// }