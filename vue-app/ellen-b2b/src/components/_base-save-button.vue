<template>
  <div>
    <button @click="saveCompanies">{{ button_label }}</button>
  </div>
</template>

<script>
import axios from 'axios'

const defaultLabel = 'Save Companies'
export default {
  data() {
    return {
      button_label: defaultLabel,
    }
  },
  methods: {
    // do this the proper way with EventService!
    saveCompanies() {
      console.log(this.$store.getters['company/userCompanies'])
      axios({
        method: 'post',
        url: '//localhost:8000/api/users/update/companies',
        data: {
          selectedCompanies: this.$store.getters['company/userCompanies'],
        },
      }).then(({ data }) => {
        this.$store.dispatch('company/clearCompanySelection') // ideally state becomes saved companies
        this.button_label = 'Saved!'

        const thisComponent = this // must set this outside of anon function below
        setTimeout(function () {
          thisComponent.button_label = defaultLabel
        }, 1500)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
button {
  width: 200px;
}
</style>
