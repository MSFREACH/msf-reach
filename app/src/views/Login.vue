<template>
    <v-content>
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <v-flex xs12 sm8 md4>
                    <v-card class="elevation-12">
                        <v-toolbar dark flat color="red">
                            <v-toolbar-title>MSF REACH Login</v-toolbar-title>
                        </v-toolbar>
                        <v-card-text v-if="!needToSetPassword">
                            <v-form :submit.prevent="onSubmit(username, password)">
                                <v-text-field prepend-icon="person" name="login" label="Login" v-model="username" type="text"></v-text-field>
                                <v-text-field prepend-icon="lock" name="password" label="Password" v-model="password" type="password"></v-text-field>
                                <v-spacer></v-spacer><v-btn dark> Sign in</v-btn>
                            </v-form>
                        </v-card-text>
                        <v-card-text v-else>
                            <v-form :submit.prevent="setPassword(newPassword)">
                                This is your first login, please set your password.
                                <v-text-field prepend-icon="lock" name="password" label="Password" v-model="newPassword" type="password"></v-text-field>
                                <v-spacer></v-spacer><v-btn dark>Submit</v-btn>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <router-link :to="{ name: 'register' }">
                              Need an account?
                            </router-link>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </v-content>
</template>
<script>

/* eslint no-debugger: off */
/* eslint no-console: off */
/*eslint no-unused-vars :off*/

import { mapState } from 'vuex';
import { LOGIN, PASSWORD_CHALLENGE, NEW_PASSWORD_REQUIRED } from '@/store/actions.type';

export default {
    name: 'Login',
    data () {
        return {
            username: null,
            password: null,
            newPassword: null,
            needToSetPassword: false
        };
    },
    methods: {
        onSubmit (username, password) {
            // TODO: validation
            console.log('onSubmit ----- ', username, password);
            var vm = this;
            this.$store.dispatch(LOGIN, { username, password })
                .then((payload) => {
                    console.log('LOGIN ------- ', payload);

                    if(payload.challengeName == NEW_PASSWORD_REQUIRED){
                        vm.needToSetPassword = true;
                    }else{
                        vm.goNext();
                    }
                });
        },
        setPassword(newPassword){
            console.log('setPassword ------- ', newPassword);
            this.$store.dispatch(PASSWORD_CHALLENGE, newPassword)
                .then((data) => {
                    this.goNext();
                });
        },
        goNext(){
            var goTo = this.$route.query.from ? this.$route.query.from : { name:'events' };
            this.$router.push(goTo);
        }
    },
    computed: {
        ...mapState({
            errors: state => state.auth.errors
        })
    }
};
</script>
