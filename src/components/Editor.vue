<template>
  <v-card class="ma-5" max-width="210" align="center" justify="center" >
    <DeleteEditor v-model="showDeleteEditorDialog" @delete="deleteEditor"/>
    <ModifyEditor v-model="showModifyEditorDialog"/>

    <v-snackbar v-model="showNotRunningSnackbar">
      Editor is currently not running
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="showNotRunningSnackbar = false" >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <v-snackbar v-model="showPasswordSnackbar" timeout="15000">
      The editor password is "{{ password }}". Wait a few seconds before the editor starts.
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="showPasswordSnackbar = false" >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    
    <v-snackbar v-model="showPleaseWaitForDeletionSnackbar">
      Please wait a few seconds to minutes for the deletion of the old editor instance before creating a new one.
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="showPleaseWaitForDeletionSnackbar = false" >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <div @click="openEditor" style="cursor: pointer">
      <div class="logo" v-bind:style="{ backgroundImage: 'url(' + logo + ')' }"></div>

      <v-card-title style="color: black;">{{ name }}</v-card-title>
      <v-card-text>
        <div class="description">{{ description }}</div>
      </v-card-text>
    </div>
    
    <v-card-actions>
      <v-spacer></v-spacer>

      <v-tooltip bottom v-if="!instantiated">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="createEditor">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Create a new editor instance</span>
      </v-tooltip>

      <v-tooltip bottom v-if="instantiated">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="showDeleteEditorDialog = true">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>Delete the editor instance</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" :disabled="!instantiated" @click="showModifyEditorDialog = true">
            <v-icon>mdi-account-edit</v-icon>
          </v-btn>
        </template>
        <span>Modify the editor password</span>
      </v-tooltip>

      <v-tooltip bottom v-if="running">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" :disabled="!instantiated" @click="stopEditor">
            <v-icon color="orange">mdi-pause</v-icon>
          </v-btn>
        </template>
        <span>Pause the editor</span>
      </v-tooltip>

      <v-tooltip bottom v-if="!running">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" :disabled="!instantiated" @click="startEditor">
            <v-icon>mdi-play</v-icon>
          </v-btn>
        </template>
        <span>Start the editor</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" :disabled="!(instantiated && running)" @click="openEditor">
            <v-icon>mdi-open-in-new</v-icon>
          </v-btn>
        </template>
        <span>Open the editor in a new tab</span>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<script>
  import DeleteEditor from './DeleteEditor.vue'
  import ModifyEditor from './ModifyEditor.vue'

  export default {
    components: { DeleteEditor, ModifyEditor },
    created () { 
      this.getEditorStatus()
      setInterval(() => this.getEditorStatus(), 5000)
    },
    methods: { 
      getEditorStatus() {
        this.axios.get('https://' + this.$config.domains.api + '/editor').then((response) => {
          switch (response.data.editor.status) {
            case 'running':
              this.running = true
              this.instantiated = true
              this.link = response.data.editor.link
              break
            case 'stopped':
              this.running = false
              this.instantiated = true
              this.link = response.data.editor.link
              break
            case 'missing':
              this.instantiated = false
              this.running = false
              break
            default:
              this.instantiated = false
              this.running = false
          }
        })
      },
      openEditor() {
        if(this.running && this.link) {
          var win = window.open(this.link, '_blank')
          win.focus()
        } else {
          this.showNotRunningSnackbar = true
          this.getEditorStatus()
        }
      },
      createEditor() {
        this.password = Math.random().toString(36).substring(2)

        this.axios.put('https://' + this.$config.domains.api + '/editor', { password: this.password }).then((response) => {
          if(response.data.status == 'successfull') {
            this.getEditorStatus()
            this.showPasswordSnackbar = true
          } else if (response.data.status == 'waiting-for-deletion') {
            this.deleteEditor()
            this.getEditorStatus()
            this.showPleaseWaitForDeletionSnackbar = true
          } else {
            this.deleteEditor()
            console.error(response)
          }
        })
      },
      deleteEditor() {
        this.axios.delete('https://' + this.$config.domains.api + '/editor', ).then((response) => {
          if(response.data.status == 'successfull') {
            this.getEditorStatus()
          } else {
            console.error(response)
          }
        })
      },
      stopEditor() {
        this.axios.post('https://' + this.$config.domains.api + '/editor/stop', ).then((response) => {
          if(response.data.status == 'successfull') {
            this.getEditorStatus()
          } else {
            console.error(response)
          }
        })
      },
      startEditor() {
        this.axios.post('https://' + this.$config.domains.api + '/editor/start', ).then((response) => {
          if(response.data.status == 'successfull') {
            this.getEditorStatus()
          } else {
            console.error(response)
          }
        })
      }
    },
    data: () => ({
      link: "",
      logo: '/vscode-logo.png',
      name: 'Visual Studio Code',
      description: 'Run VS Code anywhere on any machine in the browser.',
      showNotRunningSnackbar: false,
      showPasswordSnackbar: false,
      showPleaseWaitForDeletionSnackbar: false,
      running: false,
      instantiated: false,
      showDeleteEditorDialog: false,
      showModifyEditorDialog: false,
      password: null
    })
  }
</script>

<style scoped>
.v-card__actions .v-icon {
  color: black !important;
}

.v-card {
  display: flex;
  flex-direction: column;
}

.v-card__actions {
    flex: 1 1;
    display: flex;
    align-items: flex-end;
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