<template>
  <div class="search-component">
    <form @submit.prevent="searchCompanies">
      <label for="password"> Search for companies </label>
      <input type="text" v-model="currentQuery" />

      <button type="submit" name="button">Search</button>
    </form>

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
  },
}
</script>

<style lang="scss" scoped>
.search-component {
  margin: 20px auto;
}
</style>
