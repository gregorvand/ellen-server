<template>
  <div class="search-component">
    <h4>Your selected companies</h4>
    <section class="selected-companies">
      <ul>
        <li v-for="company in selectedCompanies" :key="company.id">
          <CompanySelector :company="company" />
        </li>
      </ul>
    </section>

    <h2>Search for companies</h2>
    <form class="search-companies-form" @submit.prevent>
      <input
        v-on:keyup="searchCompanies"
        type="text"
        v-model="currentQuery"
        @keyup.esc="clearInput"
      />

      <ul class="companies-results" v-if="results.length > 0">
        <li v-for="result in results" :key="result.id">
          <CompanySelector :company="result" />
        </li>
      </ul>
    </form>
    <!-- dev only -->
    <!-- <ul>
      <li>
        <CompanySelector :company="{ companyName: 'Test Company', id: '5' }" />
      </li>
    </ul> -->
    <!--  -->
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
    clearInput() {
      this.currentQuery = ''
      this.$store.dispatch('search/doSearchQuery', '')
    },
  },
  computed: {
    ...mapState('search', ['results']),
    ...mapState('selectedCompanies', ['selectedCompanies']),
  },
}
</script>

<style lang="scss" scoped>
.search-companies-form {
  position: relative;
}

.search-component {
  margin: 20px auto;
  width: 100%;
  max-width: 500px;
  padding: 15px 0;
}

.companies-results {
  display: flex;
  max-height: 300px;
  overflow-y: scroll;
  border: solid #e2e2e2 thin;
  top: 35px;
  position: absolute;
  width: 100%;
  box-sizing: border-box;
  justify-content: flex-start;
  background-color: #fffdf1;
  padding: 10px;

  li div {
    justify-content: space-between;
    text-align: left;
  }
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
  border: solid gray thin;
  height: 200px;
  overflow-y: scroll;
}
</style>
