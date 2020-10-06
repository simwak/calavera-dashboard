<template>
  <div>
    <v-overlay :value="!loaded">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <component v-bind:is="$data._component">
      <slot />
    </component>
  </div>
</template>

<script>
  import Vue from 'vue'

  export default {
    props: {
      component: {
        type: [String, Object],
        default: 'div',
      },
    },
    data: () => ({
      loaded: false,
      _component: null
    }),
    created () {
      this.axios.get("/config").then((configResponse) => {
        this.axios.get("https://" + configResponse.data.api + "/config").then((response) => {
          Vue.prototype.$config = response.data
          this.$data._component = this.component
          this.loaded = true
        })
      })
    }
  }
</script>
