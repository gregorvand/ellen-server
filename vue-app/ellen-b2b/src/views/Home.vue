<template>
  <div class="home">
    <h1>Ellen Insights v2</h1>
    <div v-if="!loggedIn">
      For dashboard access please
      <router-link to="/login"> Login </router-link>
      or
      <router-link to="/register"> Register </router-link>
    </div>

    <SearchForm />
  </div>
</template>

<script>
import { authComputed } from '@/store/helpers.js'
import SearchForm from '@/components/SearchForm.vue'

export default {
  computed: {
    ...authComputed,
  },
  components: {
    SearchForm,
  },
}
</script>
