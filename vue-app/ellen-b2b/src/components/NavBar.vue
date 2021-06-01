<template>
  <div id="nav">
    <router-link to="/">Real World Events</router-link>
    <nav>
      <router-link :to="{ name: 'event-list' }">List</router-link> |
      <router-link :to="{ name: 'event-create' }">Create</router-link>
    </nav>
    <router-link to="/dashboard"> Dashboard </router-link>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped></style>
