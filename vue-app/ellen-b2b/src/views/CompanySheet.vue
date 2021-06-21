<template>
  <div>
    <div class="company-sheet-name">
      <h1>{{ company.nameIdentifier }}</h1>
    </div>
    <div class="company-sheet-ticker">
      <span v-if="company.ticker !== null">Symbol: {{ company.ticker }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  created() {
    this.$store.dispatch('company/fetchCompany', this.$route.params.id)
  },
  computed: mapState({
    company: (state) => state.company.currentCompany,
  }),
}
</script>

<style lang="scss" scoped>
h1 {
  margin: 20px;
  font-size: 20px;
}
</style>
