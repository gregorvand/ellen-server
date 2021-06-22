<template>
  <div>
    <h1>Dashboard</h1>
    <ul>
      <li v-for="company in selectedCompanies" :key="company.id">
        <CompanySelector :company="company" v-bind:disableCheckBox="true" />
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'
// import { mapState } from 'vuex'
import CompanySelector from '../components/CompanySelector'
export default {
  components: { CompanySelector },
  data() {
    return {
      selectedCompanies: [],
    }
  },
  created() {
    axios.get('//localhost:8000/api/dashboard').then(({ data }) => {
      this.selectedCompanies = data.companies
    })
  },
}
</script>

<style scoped>
ul,
li {
  list-style: none;
}
</style>
