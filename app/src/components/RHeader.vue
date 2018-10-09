<template>
    <v-toolbar app fixed :clipped-left="$vuetify.breakpoint.mdAndUp">
        <v-avatar size="40px" class="mr-3">
            <img src="../assets/images/logo.png" alt="">
        </v-avatar>
        <v-text-field hide-details append-icon="search" single-line></v-text-field>
        <v-toolbar-items class="hidden-sm-and-down">
            <v-btn flat><router-link :to="{ name: 'events' }">Events</router-link></v-btn>
            <v-btn flat><router-link :to="{ name: 'reports' }">Reports</router-link></v-btn>
            <v-btn flat><router-link :to="{ name: 'contacts' }">Contacts</router-link></v-btn>
        </v-toolbar-items>
        <v-spacer></v-spacer>
        <v-menu offset-y>
            <v-btn flat slot="activator">
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
        <v-btn @click="signOut"> LOGOUT </v-btn>
        <v-menu right offset-y>
            <v-btn flat slot="activator">
                <v-toolbar-title>MSF REACH</v-toolbar-title>
                <v-icon>person</v-icon>
            </v-btn>
            <v-list>
                <v-list-tile v-for="(item, index) in profileActions" :key="index" @click="">
                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile>
            </v-list>

        </v-menu>

    </v-toolbar>
</template>

<script>
import { LOGOUT } from '@/store/actions.type';

export default {
    name: 'RHeader',
    data: () => ({
        profileActions: [
            {title : 'About MSF Reach'},
            {title : 'FAQ'},
            {title : 'Sign out'},
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
