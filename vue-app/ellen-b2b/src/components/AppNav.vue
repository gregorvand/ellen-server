<template>
  <div id="nav">
    <router-link to="/"> Home </router-link>
    <template v-if="loggedIn">
      <router-link :to="{ name: 'dashboard' }"> Dashboard </router-link>
      <router-link :to="{ name: 'earnings' }"> Earnings </router-link>
    </template>

    <br />
    <span v-if="loggedIn">{{ user.user.email }}</span>
    <router-link v-if="!loggedIn" to="/login" class="button">
      Login
    </router-link>
    <button v-else type="button" class="logoutButton" @click="logout">
      Logout
    </button>
  </div>
</template>

<script>
import { authComputed } from '@/store/helpers.js'
import { mapState } from 'vuex'
export default {
  computed: {
    ...authComputed,
    ...mapState(['user']),
  },

  methods: {
    logout() {
      this.$store.dispatch('user/logout')
    },
  },
}
</script>

<style lang="scss" scoped>
#nav {
  display: flex;
  align-items: center;
  min-height: 50px;
  padding: 0.2em 1em;
  background: linear-gradient(to right, #16c0b0, #84cf6a);
}
.nav-welcome {
  margin-left: auto;
  margin-right: 1rem;
  color: white;
}
a {
  font-weight: bold;
  color: #2c3e50;
  margin: auto 0.8em auto 0.4em;
  text-decoration: none;
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
}
.router-link-exact-active {
  color: white;
  border-bottom: 2px solid #fff;
}
button,
.button {
  margin-left: auto;
  background: white;
  text-decoration: none;
  color: #2c3e50;
  &.router-link-active {
    color: #2c3e50;
  }
}
.logoutButton {
  cursor: pointer;
}
.nav-welcome + button {
  margin-left: 0;
}
</style>
