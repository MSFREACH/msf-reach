<template>
    <v-toolbar app class="elevation-8" fixed :clipped-left="$vuetify.breakpoint.mdAndUp" >
        <v-flex class="logo">
            <img src="../assets/images/msf-reach-logo-trans-01.png" alt=""></img>
        </v-flex>
        <v-layout v-show="isAuthenticated">
            <v-toolbar-items class="hidden-sm-and-down">
                <v-btn flat><router-link :to="{ name: 'events' }">Events</router-link></v-btn>
                <v-btn flat><router-link :to="{ name: 'reports' }">Reports</router-link></v-btn>
                <v-btn flat><router-link :to="{ name: 'contacts' }">Contacts</router-link></v-btn>
            </v-toolbar-items>
            <v-spacer></v-spacer>
            <v-text-field hide-details append-icon="search" single-line></v-text-field>
            <v-menu offset-y>
                <v-btn fab flat small outline slot="activator">
                    <v-icon>notifications</v-icon>
                </v-btn>
                <v-container xs12 sm6 md4 lg3>
                    <v-list three-line xs4>
                        <template v-for="(item, index) in notifications">
                            <v-subheader v-if="item.header" :key="index" >
                                {{ item.header }}
                            </v-subheader>

                            <v-divider v-else-if="item.divider" :inset="item.inset" :key="index" ></v-divider>

                            <v-list-tile v-else :key="index" avatar @click="" >
                                <v-icon>{{ item.type }}</v-icon>
                                <v-list-tile-content>
                                    <v-list-tile-title v-html="item.title"></v-list-tile-title>
                                    <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>
                    </v-list>
                </v-container>
            </v-menu>
            <v-menu right offset-y>
                <v-btn flat fab dark color="primary"  slot="activator">
                    <!-- <v-toolbar-title> {{ currentUser.username }}</v-toolbar-title>
                    <v-icon>person</v-icon> -->
                    <v-avatar :size="56">
                        {{ nameInitial }}
                    </v-avatar>
                </v-btn>
                <v-list>
                    <v-list-tile>
                        About MSF Reach
                    </v-list-tile>
                    <v-list-tile>
                        <info-FAQ></info-FAQ>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-title @click="signOut"> LOGOUT </v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </v-layout>
    </v-toolbar>
</template>

<script>
/*eslint no-unused-vars: off*/

import { mapGetters } from 'vuex';
import store from '@/store';
import { FETCH_PROFILE, LOGOUT } from '@/store/actions.type';

import InfoFAQ from '@/views/Info/FAQ.vue';

export default {
    name: 'RHeader',
    data: () => ({
        nameInitial: null,
        profileActions: [
            {title : 'About MSF Reach'},
            {title : 'FAQ'},
        ],
        notifications: [
            {header: 'Today'},
            {
                type: 'event_note',
                title: 'Monsoon floods',
                subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum leo tortor, fringilla quis mauris sit amet, iaculis molestie lacus amet.'
            },
            { divider: true, inset: true },
            {
                type: 'event_note',
                title: 'Monsoon floods',
                subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam consequat sem at tincidunt suscipit. Praesent at leo vel purus rutrum nullam.'
            },
            { divider: true, inset: true },
            {
                type: 'event_note',
                title: 'Monsoon floods',
                subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tempor urna nec dictum tincidunt. Donec lectus lectus, faucibus massa nunc.'
            },
            { divider: true, inset: true },
            {
                type: 'event_note',
                title: 'Monsoon floods',
                subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sollicitudin ut libero sit amet laoreet. Ut et orci eros. Nam quis metus.'
            },
            { divider: true, inset: true },
            {
                type: 'event_note',
                title: 'Monsoon floods',
                subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tincidunt ultricies nisi eget ullamcorper. Etiam fermentum accumsan augue sed.'
            },
            { divider: true, inset: true }
        ]
    }),
    components: {
        InfoFAQ
    },
    computed: {
        ...mapGetters([
            'profile',
            'currentUser',
            'isAuthenticated'
        ]),
        // nameInitial(){
        //     return this.currentUser ? this.currentUser.username.charAt(0) : null;
        // }
    },
    watch: {
        currentUser(newValue){
            this.nameInitial = this.currentUser.username.charAt(0);
        }
    },
    methods: {
        signOut(){
            this.$store.dispatch(LOGOUT)
                .then(() => this.$router.push({name: 'login'}));
        }
    }
};
</script>

<style lang="scss">
    @import '@/assets/css/header.scss';

</style>
