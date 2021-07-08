<template>
  <div>
    <button @click="triggerAPI">{{ label }}</button>
  </div>
</template>

<script>
import axios from 'axios'
import store from '@/store/store'

export default {
  props: {
    label: {
      type: String,
      default: 'Get earnings',
    },
    apiPath: {
      type: String,
      default: '/earnings/yesterday',
    },
  },

  methods: {
    triggerAPI() {
      axios({
        method: 'post',
        url: `//localhost:8000/api${this.apiPath}`,
      }).then(({ data }) => {
        store.dispatch('earnings/addReportToEarnings', data)
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
