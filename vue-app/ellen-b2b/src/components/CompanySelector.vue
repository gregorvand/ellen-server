<template>
  <div class="company-selector">
    <div class="company-selector-label">
      <router-link
        v-if="this.$route.name == 'dashboard'"
        :to="{
          name: 'company',
          params: { id: company.id },
        }"
      >
        <span>{{ companyName }}</span>
      </router-link>
      <span v-else>{{ companyName }}</span>
      <span v-if="company.ticker">({{ company.ticker }})</span>
    </div>
    <input
      v-if="!disableCheckBox"
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
    disableCheckBox: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    selectCompany() {
      if (!this.checked) {
        this.$store.dispatch(
          'selectedCompanies/addCompanyToSelection',
          this.company
        )
      } else {
        this.$store.dispatch(
          'selectedCompanies/removeCompanySelection',
          this.company
        )
      }
    },
  },

  data() {
    return {
      // if user has already selected this company, will return true, else false
      checked: this.$store.getters['selectedCompanies/userHasCompany'](
        this.company.id
      ),
      isPublicCompany: this.company.ticker ? 'public' : 'private',
    }
  },

  computed: {
    companyName() {
      return this.company.companyName
        ? this.company.companyName // elastic search
        : this.company.nameIdentifier // ellen DB
    },
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

.company-selector {
  // view specifics
  .dashboard & {
    width: 500px;
    height: 40px;
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    &-label {
      width: 100%;
    }
  }

  // subcomponents
  &-label {
    width: 65%;
    font-size: 13px;
  }
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
