<template>
  <div class="notification-bar" :class="notificationTypeClass">
    <p>{{ notification.message }}</p>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      timeout: null,
    }
  },
  // lifecyle hooks
  mounted() {
    this.timeout = setTimeout(() => this.remove(this.notification), 5000)
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
  },
  computed: {
    notificationTypeClass() {
      return `-text-${this.notification.type}`
    },
  },
  methods: mapActions('notification', ['remove']),
}
</script>

<style lang="scss" scoped>
.notification-bar {
  margin: 1em 0 1em;
  width: 100%;

  &.-text-success {
    background-color: green;
  }

  &.-text-error {
    background-color: yellow;
  }
}
</style>
