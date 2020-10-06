<template>
  <v-app>
    <v-container class="pa-16" fluid row>
      <v-row justify="center">
        
          <Editor/>
          <div v-for="service in services" v-bind:key="service.name" style="display: flex;">
            <v-card  v-if="service.enabled" class="ma-5" max-width="210" align="center" justify="center" >
              <a class="disable-link-style" :href="service.link" target="_blank">
                <div class="logo" v-bind:style="{ backgroundImage: 'url(' + service.logo + ')' }"></div>

                <v-card-title style="color: black;">{{ service.name }}</v-card-title>
                <v-card-text>
                  <div class="description">{{ service.description }}</div>
                </v-card-text>
              </a>
            </v-card>
          </div>
        
      </v-row>
    </v-container>
  </v-app>
</template>


<script>
  import Editor from './Editor.vue'

  export default {
    components: { Editor },
    mounted () {
      this.getServices()
    },
    methods: {
      getServices() {
        this.axios.get('https://' + this.$config.domains.api + '/services').then((response) => {
          this.services = response.data
        })
      }
    },
    data: () => ({
      services: [],
    })
  }
</script>

<style scoped>
.v-card:hover {
  box-shadow: 0 10px 13px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19) !important;
}

.disable-link-style {
  text-decoration: none;
  color: grey;
}

.description {
  text-align: left;
}

.logo {
  height: 200px;
  margin-top: 10%;
  margin-left: 10%;
  margin-right: 10%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>