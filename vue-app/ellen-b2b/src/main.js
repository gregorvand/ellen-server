import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Globally register all `_base`-prefixed components
import '@/components/_globals'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
