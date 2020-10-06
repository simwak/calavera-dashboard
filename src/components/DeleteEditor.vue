<template>
  <v-dialog v-model="show" max-width="320" >
    <v-card>
      <v-card-title class="headline">
        Delete editor instance?
      </v-card-title>
      <v-card-text>When the editor instance is deleted, all data is lost and cannot be restored</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="show = false" >
          Cancel
        </v-btn>
        <v-btn color="green darken-1" text @click="() => { show = false; this.$emit('delete'); }" >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    components: {  },
    mounted () { },
    props: {
      value: Boolean
    },
    computed: {
      show: {
        get () {
          return this.value
        },
        set (value) {
          this.$emit('input', value)
        }
      }
    },
    methods: {},
    data: () => ({})
  }
</script>
