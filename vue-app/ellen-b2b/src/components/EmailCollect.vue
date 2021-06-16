<template>
  <div class="email-collect">
    <h4>Enter email</h4>
    <input v-if="user" type="email" :value="[[user.email]]" />
    <input v-else type="email" :placeholder="'Enter your email'" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      // userPresent: this.$store.getters['user/loggedIn'],
      user: this.$store.getters['user/userObject'],
    }
  },
}
</script>

<style lang="scss" scoped>
.email-collect {
  width: 100%;
}
</style>
