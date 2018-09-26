<template>
    <v-container class ="event-page">
        <!-- <div class="sideTab">
            <router-link :to="{ name: 'event-general'}"> General </router-link>
            <router-link :to="{ name: 'event-notifications'}"> Notifications </router-link>
            <router-link :to="{ name: 'event-response'}"> Response </router-link>
            <router-link :to="{ name: 'event-extCapacity'}"> External Capacity </router-link>
            <router-link :to="{ name: 'event-medFigures'}"> Medical Figures </router-link>
            <router-link :to="{ name: 'event-resources'}"> Staff Resources </router-link>
            <router-link :to="{ name: 'event-reflection'}"> Reflections </router-link>
        </div> -->

        <v-navigation-drawer :mini-variant.sync="mini" v-model="drawer" hide-overlay stateless >
            <v-toolbar flat class="transparent">
                <v-list class="pa-0">
                    <v-list-tile avatar>
                        <v-list-tile-action>
                            <v-icon>menu</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-action>
                            <v-btn icon @click.stop="mini = !mini">
                                <v-icon>chevron_left</v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list>
            </v-toolbar>

            <v-list class="pt-0" dense>
                <v-divider></v-divider>
                <v-list-tile v-for="item in items" :key="item.component">
                    <router-link :to="{name: item.component}">
                        <v-list-tile-action>
                            <v-icon>{{item.icon}}</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                        </v-list-tile-content>
                    </router-link>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-content>
            <router-view></router-view>
        </v-content>
    </v-container>
</template>

<script>

import { mapGetters } from 'vuex';
import marked from 'marked';
import store from '@/store';
import { FETCH_EVENT } from '@/store/actions.type';
import REventGeneral from '@/views/Event/General.vue';
import REventNotification from '@/views/Event/General.vue';
import REventResponse from '@/views/Event/Response.vue';
import REventExtCapacity from '@/views/Event/ExtCapacity.vue';
import REventMedFigures from '@/views/Event/MedFigures.vue';
import REventStaffResources from '@/views/Event/StaffResources.vue';
import REventReflection from '@/views/Event/Reflection.vue';

/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/

export default {
    name: 'r-event',
    props: {
        slug: {
            type: String,
            required: true
        }
    },
    data(){
        return {
            drawer: true,
            items: [
                { icon: 'dashboard', name: 'General', component: 'event-general'},
                { icon: 'event_note', name: 'Notifications', component: 'event-notifications'},
                { icon: 'track_changes', name: 'Response', component: 'event-response'},
                { icon: 'settings_input', name: 'External Capacity', component: 'event-extCapacity'},
                { icon: 'fingerprint', name: 'Medical Figures', component: 'event-medFigures'},
                { icon: 'people', name: 'Staff Resources', component: 'event-resources'},
                { icon: 'all_inclusive', name: 'Reflections', component: 'event-reflection'}

            ],
            mini: true,
            right: null
        };
    },
    components: {
        REventGeneral, REventNotification, REventResponse, REventExtCapacity, REventMedFigures, REventStaffResources
    },
    beforeRouteEnter(to, from, next){
        Promise.all([
            store.dispatch(FETCH_EVENT, to.params.slug),
        ]).then((data) => {
            next();
        });
    },
    mounted(){
    },
    computed: {
        ...mapGetters([
            'event',
            'currentUser',
            'isAuthenticated'
        ])
    },
    watch: {
    },
    methods: {
        parsedMarkdown(chunk){
            return marked(chunk);
        },
        fetchEvent() {
            this.$store.dispatch(FETCH_EVENT, this.event.id);
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/sideTab.scss';
    @import '@/assets/css/event.scss';

</style>
