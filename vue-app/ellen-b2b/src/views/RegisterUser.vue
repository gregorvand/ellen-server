<template>
  <div>
    <form @submit.prevent="register">
      <label for="fname"> First Name: </label>
      <input v-model="fname" type="text" name="fname" value />

      <label for="lname"> Last Name: </label>
      <input v-model="lname" type="text" name="lname" value />

      <label for="email"> Email: </label>
      <input v-model="email" type="email" name="email" value />

      <label for="password"> Password: </label>
      <input v-model="password" type="password" name value />

      <button type="submit" name="button">Register</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fname: '',
      lname: '',
      email: '',
      password: '',
    }
  },
  methods: {
    register() {
      this.$store
        .dispatch('register', {
          firstName: this.fname,
          lastName: this.lname,
          email: this.email,
          password: this.password,
        })
        .then(() => {
          this.$router.push({ name: 'dashboard' })
        })
    },
  },
}
</script>

<style lang="scss" scoped>
* {
  text-align: center;
  margin: 0 auto;
}
</style>
