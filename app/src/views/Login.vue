<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Sign in</h1>
          <p class="text-xs-center">
            <router-link :to="{ name: 'register' }">
              Need an account?
            </router-link>
          </p>
          <ul v-if="errors" class="error-messages">
            <li
              v-for="(v, k) in errors"
              :key="k">
              {{k}} {{ v | error }}
            </li>
          </ul>
          <form v-on:submit.prevent="onSubmit(username, password)">
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="text"
                v-model="username"
                placeholder="Username">
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="password"
                v-model="password"
                placeholder="Password">
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { LOGIN } from '@/store/actions.type';

export default {
    name: 'Login',
    data () {
        return {
            username: null,
            password: null
        };
    },
    methods: {
        onSubmit (username, password) {
            this.$store.dispatch(LOGIN, { username, password })
                .then(() => {
                    var goTo = this.$route.query.from ? this.$route.query.from : { name:'events' };
                    this.$router.push(goTo);
                });
        }
    },
    computed: {
        ...mapState({
            errors: state => state.auth.errors
        })
    }
};
</script>
