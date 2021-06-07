<template>
  <div class="search-component">
    <form @submit.prevent="searchCompanies">
      <label for="password"> Serach for companies </label>
      <input type="text" />

      <button type="submit" name="button">Search</button>
    </form>

    <ul v-if="results.length > 0">
      <li v-for="result in results" :key="result"></li>
    </ul>
    <p v-else>No results</p>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      results: [],
    }
  },
  methods: {
    searchCompanies() {
      console.log('will be searching!!')
    },
  },
}
</script>

<style lang="scss" scoped>
.search-component {
  margin: 20px auto;
}
</style>
