<template>
  <div>
    <h1>{{ title }} | <span>event</span></h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Park Cleanup',
    }
  },
}
</script>

<style lang="scss" scoped>
h1 {
  color: green;
  span {
    color: red;
  }
}
</style>
