<template>
  <v-dialog v-model="show" max-width="600px" >
    <v-card>
      <v-card-title>
        <span class="headline">Change password</span>
      </v-card-title>
      <v-card-text>
        <password ref="password" id="password-change-field" v-model="password" :toggle="true" @feedback="setFeedback" @score="setScore"/>
        <v-alert type="error" color="red" v-show="failed">Password change failed</v-alert>
        <v-alert type="warning" color="orange" v-show="showHint">{{ hint }}</v-alert>
        <v-alert type="success" color="green" v-show="showSafe">Password is safe!</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="show = false" >
          Close
        </v-btn>
        <v-btn color="blue darken-1" text @click="changePassword" :disabled="!showSafe">
          Change
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import Password from 'vue-password-strength-meter'

  export default {
    components: { Password },
    mounted () { },
    watch: {
      show: function (viewed) {
        if(!viewed) {
          this.hint = ''
          this.password = ''
          this.$refs.password.$el.children[0].children[0].focus()
        }
      }
    },
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
      },
      showSafe: {
        get () {
          return (this.score > 2)
        }
      },
      showHint: {
        get () {
          return this.hint == '' ? false : true
        }
      }
    },
    methods: {
      async changePassword() {
        try {
          var response = await this.axios.patch('https://' + this.$config.domains.api + '/user/password', { password: this.password })

          if(response.data.status == 'successfull') {
            this.show = false
          } else {
            this.failed = true
            console.log(response.data)
          }
        } catch(e) {
          this.failed = true
          console.log(e)
        }
      },
      setScore(score) {
        this.score = score
      },
      setFeedback(feedback) {
        this.hint = ''

        if(feedback.warning)
          this.hint += feedback.warning + '. '

        feedback.suggestions.forEach(x => {
          this.hint += x.endsWith('.') ? x + ' ' : x + '. '
        })
      }
    },
    data: () => ({
      password: null,
      failed: false,
      score: 0,
      hint: ""
    })
  }
</script>

<style>
.Password {
  padding-top: 30px;
}
</style>

<style scoped>
.v-alert {
  margin-bottom: 8px;
}
</style>