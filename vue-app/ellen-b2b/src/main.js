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
    const userString = localStorage.getItem('user') // grab user data from local storage
    if (userString) {
      // check to see if there is indeed a user
      const userData = JSON.parse(userString) // parse user data into JSON
      this.$store.commit('user/SET_USER_DATA', userData) // restore user data with Vuex
    }
  },
  render: (h) => h(App),
}).$mount('#app')
