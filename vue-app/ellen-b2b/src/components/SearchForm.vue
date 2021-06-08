<template>
  <div class="search-component">
    <h4>Your selected companies</h4>
    <section class="selected-companies">
      <ul>
        <li v-for="company in selectedCompanies" :key="company.id">
          <p>{{ company.companyName }}</p>
        </li>
      </ul>
    </section>

    <form @submit.prevent="searchCompanies">
      <label for="password"> Search for companies </label>
      <input type="text" v-model="currentQuery" />

      <button type="submit" name="button">Search</button>
    </form>
    <!-- dev only -->
    <!-- <ul>
      <li>
        <CompanySelector :company="{ companyName: 'Test Company', id: '5' }" />
      </li>
    </ul> -->
    <!--  -->

    <ul v-if="results.length > 0">
      <li v-for="result in results" :key="result.id">
        <CompanySelector :company="result" />
      </li>
    </ul>
    <p v-else>No results</p>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CompanySelector from '@/components/CompanySelector.vue'

export default {
  components: {
    CompanySelector,
  },
  data: function () {
    return {
      currentQuery: null,
    }
  },
  methods: {
    searchCompanies() {
      this.$store.dispatch('search/doSearchQuery', this.currentQuery)
    },
  },
  computed: {
    ...mapState('search', ['results']),
    ...mapState('company', ['selectedCompanies']),
  },
}
</script>

<style lang="scss" scoped>
.search-component {
  margin: 20px auto;
}

ul,
li {
  list-style: none;
  display: flex;
  width: 100%;
  justify-content: center;
  margin-left: 0;
  padding: 0;
}

ul {
  flex-direction: column;
}

li {
  margin-bottom: 10px;
  > div {
    display: flex;
    width: 100%;
  }
}

.selected-companies {
  border: solid red thin;
  height: 200px;
  overflow-y: scroll;
}
</style>
