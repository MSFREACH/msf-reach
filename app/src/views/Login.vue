<template>
    <v-content>
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <v-flex xs12 sm8 md4>
                    <v-card class="elevation-12">
                        <v-toolbar dark flat color="red">
                            <v-toolbar-title>MSF REACH Login</v-toolbar-title>
                        </v-toolbar>
                        <v-card-text>
                            <v-form :submit.prevent="onSubmit(username, password)">
                                <v-text-field prepend-icon="person" name="login" label="Login" v-model="username" type="text"></v-text-field>
                                <v-text-field prepend-icon="lock" name="password" label="Password" id="password" v-model="password" type="password"></v-text-field>
                                <v-btn dark> Sign in</v-btn>
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
            // TODO: validation
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
