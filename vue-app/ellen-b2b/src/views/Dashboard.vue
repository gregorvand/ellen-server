<template>
  <div>
    <h1>Dashboard</h1>
    <ul>
      <li v-for="company in selectedCompanies" :key="company.id">
        <CompanySelector :company="company" />
      </li>
    </ul>
    Current Subscription: <PlanType />
  </div>
</template>

<script>
import axios from 'axios'
// import { mapState } from 'vuex'
import CompanySelector from '../components/CompanySelector'
import PlanType from '../components/PlanType'
export default {
  components: { CompanySelector, PlanType },
  data() {
    return {
      // isLoading: true,
      selectedCompanies: [],
    }
  },
  // computed: {
  //   ...mapState('company', ['selectedCompanies']),
  // },
  created() {
    axios.get('//localhost:8000/api/dashboard').then(({ data }) => {
      this.selectedCompanies = data.companies
      // this.isLoading = false
    })
  },
}
</script>
