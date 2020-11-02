<template>
  <v-container class="mt-16 user-management">

    <!-- Password Snackbar -->
    <v-snackbar v-model="snackbarPassword" timeout="15000">
      The initial user password is "{{ snackbarPasswordInitialPassword }}". The user can also use the "Forgot password" function the set their password.
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbarPassword = false" >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <v-data-table :headers="headers" :items="users" sort-by="calories" class="elevation-1" >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Users</v-toolbar-title>
          <v-spacer></v-spacer>

          <!-- New User Dialog -->
          <v-dialog v-model="dialogCreateUser" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" icon @click="spawnUserCreationDialog">
                <v-icon>mdi-account-plus</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Create user</span>
              </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="12">
                    <v-text-field v-model="dialogCreateUserNewUser.uid" label="UID" placeholder="firstname.lastname"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="dialogCreateUserNewUser.firstname" label="First Name" placeholder="Max"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="dialogCreateUserNewUser.lastname" label="Last Name" placeholder="Mustermann"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="12">
                    <v-text-field v-model="dialogCreateUserNewUser.mail" label="E-Mail" placeholder="max.mustermann@example.com"></v-text-field>
                  </v-col>
                </v-row>
                <v-alert type="error" v-show="dialogCreateUserErrorAlert">{{ dialogCreateUserErrorMessage }}</v-alert>
              </v-container>
            </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="destroyUserCreationDialog">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="createUser(dialogCreateUserNewUser)">Create</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-btn icon>
            <v-icon @click="getUser">mdi-refresh</v-icon>
          </v-btn>
          
          <!-- Delete User Dialog -->
          <v-dialog v-model="dialogDeleteUser" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this user?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="destroyUserDeletionDialog">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteUser(dialogDeleteUserSelected)">Delete</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn icon :disabled="disableDelete(item)" @click="spawnUserDeletionDialog(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

  </v-container>
</template>

<script>
  export default {
    data: () => ({
      // Dialog
      dialogCreateUser: false,
      dialogCreateUserErrorAlert: false,
      dialogCreateUserErrorMessage: '',
      dialogCreateUserNewUser: {
        uid: '',
        firstname: '',
        lastname: '',
        mail: '',
        password: ''
      },
      dialogCreateUserDefaultUser: {
        uid: '',
        firstname: '',
        lastname: '',
        mail: '',
        password: ''
      },
      dialogDeleteUser: false,
      dialogDeleteUserSelected: {},
      // Snackbar
      snackbarPassword: false,
      snackbarPasswordInitialPassword: '',
      // Table
      users: [],
      headers: [
        {
          text: 'UID',
          align: 'start',
          sortable: true,
          value: 'uid'
        },
        {
          text: 'First Name',
          align: 'start',
          sortable: true,
          value: 'cn'
        },
        {
          text: 'Last Name',
          align: 'start',
          sortable: true,
          value: 'sn'
        },
        {
          text: 'E-Mail',
          align: 'start',
          sortable: true,
          value: 'mail'
        },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    }),
    created () {
      this.getUser()
    },
    methods: {
      // Dialogs
      spawnUserCreationDialog() {
        this.dialogCreateUser = true
      },
      spawnUserDeletionDialog(user) {
        this.dialogDeleteUser = true
        this.dialogDeleteUserSelected = user
      },
      destroyUserCreationDialog() {
        this.dialogCreateUser = false       // Disable dialog
        this.dialogCreateUserNewUser = Object.assign({}, this.dialogCreateUserDefaultUser)  // Clear inputs in dialog
        this.dialogCreateUserErrorMessage = ''    // Clear alert in dialog
        this.dialogCreateUserErrorAlert = false   // Clear alert in dialog
        this.getUser()                      // Update table
      },
      destroyUserDeletionDialog() {
        this.dialogDeleteUser = false       // Disable dialog
        this.dialogDeleteUserSelected = {}  // Empty selected user
        this.getUser()                      // Update table
      },
      // Users Tasks
      getUser()
      {
        this.axios.get('https://' + this.$config.domains.api + '/users').then((response) => {
          this.users = response.data
        })
      },
      deleteUser(user) {
        this.axios.delete('https://' + this.$config.domains.api + '/user/' + user.uid).then((response) => {
          if(response.data.status == "successful") {
            
            this.destroyUserDeletionDialog()
          } else {
            console.error(response.data)
          }
        })
      },
      createUser(user) {
        user.password = Math.random().toString(36).substring(2)

        this.axios.put('https://' + this.$config.domains.api + '/user', user).then((response) => {
          if(response.data.status == "successful") {
            this.snackbarPasswordInitialPassword = user.password
            this.snackbarPassword = true

            this.destroyUserCreationDialog()
          } else if(response.data.status == "failed") {
            this.dialogCreateUserErrorAlert = true
            this.dialogCreateUserErrorMessage = response.data.status.message
            console.error(response.data)
          }
        })
      },
      // Computed
      disableDelete(item) {
        return this.$keycloak.userName == item.uid || this.users.length == 1
      }
    },
  }
</script>

<style>
.user-management {
  max-width: 60vw;
}

th:last-child, td:last-child {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>