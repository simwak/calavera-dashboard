<template>
  <v-container class="mt-16 user-management">

    <v-snackbar v-model="showPasswordSnackbar" timeout="15000">
      The initial user password is "{{ initialPassword }}". The user can also use the "Forgot password" function the set their password.
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="showPasswordSnackbar = false" >
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
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" icon @click="createUserMessageEnabled = false">
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
                    <v-text-field v-model="newUser.uid" label="UID" placeholder="firstname.lastname"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="newUser.firstname" label="First Name" placeholder="Max"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="newUser.lastname" label="Last Name" placeholder="Mustermann"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="12">
                    <v-text-field v-model="newUser.mail" label="E-Mail" placeholder="max.mustermann@example.com"></v-text-field>
                  </v-col>
                </v-row>
                <v-alert type="error" v-show="createUserMessageEnabled">{{ createUserMessage }}</v-alert>
              </v-container>
            </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeCreate">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="createUser">Create</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-btn icon>
            <v-icon @click="getUser">mdi-refresh</v-icon>
          </v-btn>
          
          <!-- Delete User Dialog -->
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this user?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteUser">Delete</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn icon :disabled="disableDelete(item)" @click="deleteUserDialog(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

  </v-container>
</template>

<script>
  export default {
    data: () => ({
      dialog: false,
      dialogDelete: false,
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
      showPasswordSnackbar: false,
      initialPassword: '',
      deleteUserObject: {},
      createUserMessage: '',
      createUserMessageEnabled: false,
      users: [],
      newUser: {
        uid: '',
        firstname: '',
        lastname: '',
        mail: '',
        password: ''
      },
      defaultUser: {
        uid: '',
        firstname: '',
        lastname: '',
        mail: '',
        password: ''
      },
    }),
    computed: {

    },
    created () {
      this.getUser()
    },
    methods: {
      disableDelete(item) {
        return this.$keycloak.userName == item.uid || this.users.length == 1
      },
      getUser()
      {
        this.axios.get('https://' + this.$config.domains.api + '/users').then((response) => {
          this.users = response.data
        })
      },
      deleteUser() {
        this.axios.delete('https://' + this.$config.domains.api + '/user/' + this.deleteUserObject.uid).then((response) => {
          if(response.data.status == "successfull") {
            
            this.closeDelete

            this.deleteUserObject = {}
          } else {
            console.error(response.data)
          }
        })
      },
      deleteUserDialog(item) {
        this.deleteUserObject = item
        this.dialogDelete = true
      },
      closeCreate() {
        this.dialog = false
        this.$nextTick(() => {
          this.newUser = Object.assign({}, this.defaultUser)
        })
        this.getUser()
        this.createUserMessageEnabled = false
      },
      closeDelete() {
        this.deleteUserObject = {}
        this.dialogDelete = false
        this.$nextTick(() => {
          this.newUser = Object.assign({}, this.newUser)
        })
        this.getUser()
      },
      createUser() {
        this.newUser.password = Math.random().toString(36).substring(2)

        this.axios.put('https://' + this.$config.domains.api + '/user', this.newUser).then((response) => {
          if(response.data.status == "successfull") {
            this.initialPassword = this.newUser.password
            this.showPasswordSnackbar = true

            this.closeCreate()
          } else if(response.data.status == "failed") {
            this.createUserMessageEnabled = true
            this.createUserMessage = response.data.status.message
            console.error(response.data)
          }
        })
      },
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