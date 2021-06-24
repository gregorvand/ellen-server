<template>
  <div>
    <h1>its Earnings time..</h1>
    <template v-if="liveEarnings !== []">
      <ul v-for="earning in liveEarnings" :key="earning.symbol">
        <li>{{ earning[0].symbol }}</li>
        <li>{{ earning[0].date }}</li>
      </ul>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import store from '@/store/store'
import io from 'socket.io-client'
const socket = io.connect('http://localhost:8000')

socket.on('earningsData', (fetchedData) => {
  store.dispatch('earnings/addReportToEarnings', fetchedData)
})

export default {
  computed: {
    ...mapState('earnings', ['liveEarnings']),
  },
}
</script>

<style lang="scss" scoped></style>
