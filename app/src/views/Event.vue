<template>
    <v-container class ='event-page'>
        <v-navigation-drawer fixed style='width: 200px;' :clipped='$vuetify.breakpoint.mdAndUp' app>
            <v-list class='pt-0' dense>
                <v-divider></v-divider>
                <v-list-tile v-for='item in items' :key='item.component' :to='{name: item.component}'>
                    <v-list-tile-action class='justify-start'>
                        <v-icon>{{item.icon}}</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-layout class='tooltip'>
                    <v-btn dark @click='copyLink()' v-on:onmouseout='outFunc()' >
                        <v-icon> link </v-icon> Sharepoint
                        <span class='tooltiptext' id='myTooltip'>Copy to clipboard</span>
                    </v-btn>
                </v-layout>
            </v-list>
        </v-navigation-drawer>
        <v-content app>
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
/*eslint no-console: off*/

export default {
    name: 'r-event',
    props: {
        slug: {
            type: String,
            required: true
        },
        firstTime: {
            type: Boolean,
        }
    },
    data(){
        return {
            drawer: true,
            items: [
                { icon: 'dashboard', name: 'General', component: 'event-general', route: '/'},
                { icon: 'event_note', name: 'Notifications', component: 'event-notifications', route: '/notifications'},
                { icon: 'track_changes', name: 'Response', component: 'event-response', route: '/response'},
                { icon: 'all_out', name: 'External Capacity', component: 'event-extCapacity', route: '/extCapacity'},
                { icon: 'fingerprint', name: 'Medical Figures', component: 'event-medFigures', route: '/medFigures'},
                { icon: 'people', name: 'Staff Resources', component: 'event-resources', route: '/resources'},
                { icon: 'all_inclusive', name: 'Reflections', component: 'event-reflection', route: '/reflection'}

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
        console.log('Props ---- firstTime  ', firstTime);
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
        },
        copyLink(){
            const el = document.createElement('textarea');
            el.value = this.event.metadata.sharepoint_link;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);

            var tooltip = document.getElementById('myTooltip');
            tooltip.innerHTML = 'Copied: ' + el.value;
        },
        outFunc(){
            var tooltip = document.getElementById('myTooltip');
            tooltip.innerHTML = 'Copy to clipboard';
        }
    }
};

</script>
<style lang='scss'>
    @import '@/assets/css/sideTab.scss';
    @import '@/assets/css/event.scss';
    textarea#sharepoint{
        opacity: 0;
    }
</style>
