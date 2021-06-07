<template>
  <div>
    {{ company.companyName }}
  </div>
</template>

<script>
export default {
  props: {
    company: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<style lang="scss" scoped></style>
