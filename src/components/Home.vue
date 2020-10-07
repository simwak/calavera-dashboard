<template>
  <v-app>
    <ChangePassword v-model="showPasswordChangeDialog"/>

    <v-app-bar app color="white">
      <v-img class="logo-appbar" height="35px" width="75px" src="/calavera-logo.jfif"></v-img>
      <v-toolbar-title v-if="!$vuetify.breakpoint.smAndDown" style="text-overflow: unset; overflow: unset;">{{ this.$config.displayName }}</v-toolbar-title>

      <v-tabs centered class="ml-n9" color="grey darken-1" v-model="tab">
        <v-tab v-for="item in tabs" :key="item">
          {{ item }}
        </v-tab>
      </v-tabs>

      <v-spacer></v-spacer>

      <v-menu left bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" >
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-subheader>Logged in as {{ this.$keycloak.fullName }}</v-subheader>
          <v-list-item @click="showPasswordChangeDialog = true">
            <v-list-item-title>Change password</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$keycloak.logoutFn()">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-tabs-items v-model="tab">
      <v-tab-item key="services">
        <Services/>
      </v-tab-item>
      <v-tab-item key="user_management" >
        <UserManagement/>
      </v-tab-item>
    </v-tabs-items>
  </v-app>
</template>


<script>
  import Services from './Services.vue'
  import UserManagement from './UserManagement.vue'
  import ChangePassword from './ChangePassword.vue'

  export default {
    components: { Services, UserManagement, ChangePassword },
    created () { 
      document.title = this.$config.displayName + " Dashboard"
    },
    data: () => ({
      tab: null,
      tabs: [ 'Services', 'User Management' ],
      showPasswordChangeDialog: false
    })
  }
</script>

<style scoped>
.logo-appbar {
  margin-right: 5px;
}
</style>