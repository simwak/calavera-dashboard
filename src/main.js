import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.config.productionTip = true
 
Vue.use(VueAxios, axios)

function tokenInterceptor () {
  axios.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${Vue.prototype.$keycloak.token}`
    return config
  }, error => {
    return Promise.reject(error)
  })
}

axios.get("/config").then((configResponse) => {
  axios.get("https://" + configResponse.data.api + "/config/auth").then((response) => {
    Vue.use(VueKeyCloak, {
      config: response.data,
      onReady: () => {
        tokenInterceptor()
    
        new Vue({
          vuetify,
          render: h => h(App)
        }).$mount('#app')
      }
    })
  })
})
