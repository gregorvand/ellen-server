<template>
  <div>
    <h1>its Earnings time..</h1>
    <BaseTriggerApiButton apiPath="/earnings/yesterday" />
    <BaseTriggerApiButton apiPath="/earningemail/send" label="Email people" />

    <!-- currently does not handle data structure if webhook received after get earnings -->
    <template v-if="liveEarnings !== []">
      <ul
        class="reverse-order"
        v-for="earning in reversedEarnings"
        :key="earning.symbol"
      >
        <li>{{ earning.symbol }}</li>
        <li>{{ earning.date }}</li>
        <li>for Q{{ earning.quarter }}</li>
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
    reversedEarnings() {
      return this.liveEarnings.slice().reverse()
    },
  },
}
</script>

<style lang="scss" scoped></style>
