import Vue from 'vue'
import Vuex from 'vuex'

import * as user from '@/store/modules/user.js'
import * as event from '@/store/modules/events.js'
import * as notification from '@/store/modules/notification.js'
import * as search from '@/store/modules/search.js'
import * as selectedCompanies from '@/store/modules/selectedCompanies.js'
import * as userCompany from '@/store/modules/userCompany.js'
import * as company from '@/store/modules/company.js'
import * as earnings from '@/store/modules/earnings.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    event,
    notification,
    search,
    selectedCompanies,
    userCompany,
    company,
    earnings,
  },
  state: {
    categories: [
      'sustainability',
      'nature',
      'animal welfare',
      'housing',
      'education',
      'food',
      'community',
    ],
  },
})
