import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'

// Globally register all `_base`-prefixed components
import '@/components/_globals'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  created() {
    axios.interceptors.response.use(
      (response) => response, // simply return the response
      (error) => {
        if (error.response.status === 401) {
          // if we catch a 401 error
          this.$store.dispatch('logout') // force a log out
        }
        return Promise.reject(error) // reject the Promise, with the error as the reason
      }
    )
  },
  render: (h) => h(App),
}).$mount('#app')
