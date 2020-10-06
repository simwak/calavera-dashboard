<template>
  <v-app>
    <v-main>
      <Config :component="Home"></Config>
    </v-main>
  </v-app>
</template>

<script>
import Home from './components/Home'
import Config from './components/Config'

export default {
  name: 'App',
  components: { Config },
  data: () => ({ Home })
}
</script>

<style>
.v-application--wrap {
  min-height: unset !important;
}
</style>