<template>
  <div>
    <span>{{ company.companyName }}</span>
    <input
      class="select-company"
      type="checkbox"
      v-model="checked"
      @click="selectCompany"
    />
  </div>
</template>

<script>
export default {
  props: {
    company: {
      type: Object,
      default: () => ({}),
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    selectCompany() {
      if (!this.checked) {
        console.log('company?', this.company)
        this.$store.dispatch('company/addCompanyToSelection', this.company)
      } else {
        this.$store.dispatch('company/removeCompanySelection', this.company)
      }
    },
  },

  data() {
    return {
      // if user has already selected this company, will return true, else false
      checked: this.$store.getters['company/userHasCompany'](this.company.id),
    }
  },
}
</script>

<style lang="scss" scoped>
.select-company {
  height: 1.6em;
}

span {
  display: flex;
  width: 100%;
}
</style>
