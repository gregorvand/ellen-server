<template>
  <div>
    <div class="company-selector-label">
      {{ company.nameIdentifier }}
      <span v-if="company.ticker">({{ company.ticker }})</span>
    </div>
    <input
      class="select-company"
      type="checkbox"
      v-model="checked"
      @click="selectCompany"
    />

    <span :class="'company-type-label ' + isPublicCompany">
      {{ isPublicCompany }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    company: {
      type: Object,
      default: () => ({}),
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    selectCompany() {
      if (!this.checked) {
        console.log('company?', this.company)
        this.$store.dispatch('company/addCompanyToSelection', this.company)
      } else {
        this.$store.dispatch('company/removeCompanySelection', this.company)
      }
    },
  },

  data() {
    return {
      // if user has already selected this company, will return true, else false
      checked: this.$store.getters['company/userHasCompany'](this.company.id),
      isPublicCompany: this.company.ticker ? 'public' : 'private',
    }
  },
}
</script>

<style lang="scss" scoped>
.select-company {
  height: 1.6em;
  width: 30px;
}

span {
  display: flex;
  width: 100%;
}

.company-selector-label {
  width: 65%;
  font-size: 13px;
}

.company-type-label {
  background-color: #efefef;
  position: absolute;
  right: 100px;
  width: 50px;
  border-radius: 5px;
  color: white;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  text-transform: uppercase;
  padding: 5px;

  &.public {
    background-color: blue;
  }

  &.private {
    background-color: rgb(216, 17, 235);
  }
}
</style>
