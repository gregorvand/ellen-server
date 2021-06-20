<template>
  <div>Big Company</div>
</template>

<script>
export default {
  created() {
    console.log(this.$route.params.id)
  },
}
</script>

<style lang="scss" scoped></style>
