import axios from 'axios'

const apiClient = axios.create({
  baseURL: `http://localhost:8000/api`,
  withCredentials: false, // This is the default
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export default {
  getCompany(id) {
    return apiClient.get('/companies/' + id)
  },
}
