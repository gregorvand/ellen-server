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
      axios({
        method: 'post',
        url: '//localhost:8000/api/users/update/companies',
        data: {
          selectedCompanies:
            this.$store.getters['selectedCompanies/userCompanies'],
        },
      }).then(({ data }) => {
        this.$store.dispatch('selectedCompanies/clearCompanySelection') // ideally state becomes saved companies
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
