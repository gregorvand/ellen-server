<template>
  <div>
    <div class="company-sheet-ticker">
      <div class="company-sheet-name">
        <h1>{{ company.nameIdentifier }}</h1>
      </div>
      <span v-if="company.ticker !== null">Symbol: {{ company.ticker }}</span>
    </div>
    <template v-if="publicData && company.ticker">
      <div>
        <ul>
          <li>{{ publicData.symbol }}</li>
          <li>{{ publicData.date }}</li>
          <li>{{ publicData.period }}</li>
          <li>ROA: {{ publicData.returnOnAssets }}</li>
        </ul>
      </div>
    </template>
    <div v-else>
      <span v-if="company.ticker">Getting public data...</span>
      <span v-else>Private company - no data to show</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data: function () {
    return {
      loading: true,
    }
  },
  beforeCreate() {
    this.$store.dispatch('company/fetchCompany', this.$route.params.id)
  },
  // mounted() {
  //   this.$store
  //     .dispatch(
  //       'company/fetchPublicCompanyRatios',
  //       this.$store.getters['company/getCompanyTicker']
  //     )
  //     .finally(() => (this.loading = false))
  // },
  computed: mapState({
    company: (state) => state.company.currentCompany,
    publicData: (state) => state?.company?.publicData[0],
  }),
}
</script>

<style lang="scss" scoped>
h1 {
  margin: 20px;
  font-size: 20px;
}
</style>
