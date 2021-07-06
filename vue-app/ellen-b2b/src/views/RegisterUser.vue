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

      <p>{{ error }}</p>

      <router-link to="/login"> Already have an account? Login. </router-link>
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
      error: null,
    }
  },
  methods: {
    register() {
      this.$store
        .dispatch('user/register', {
          firstName: this.fname,
          lastName: this.lname,
          email: this.email,
          password: this.password,
          userCompanies: this.$store.getters['selectedCompanies/userCompanies'],
        })
        .then(() => {
          this.$router.push({ name: 'dashboard' })
        })
        .catch((err) => {
          this.error = err.response.data.message
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
