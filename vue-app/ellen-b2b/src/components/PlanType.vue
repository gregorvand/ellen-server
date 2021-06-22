<template>
  <div>
    <div class="subscription-cost">
      <div>${{ numberOfScrips }} / month</div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    numberOfScrips() {
      return this.$store.getters['selectedCompanies/userCompanies'].length * 10
    },
  },
}
</script>

<style lang="scss" scoped></style>
