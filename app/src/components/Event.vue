<template>
    <v-container class="event-page">
        <span v-if="!slug">
            Please select event for review.
        </span>
        <!-- fake tab look, but need to use router for all the chidren -->
        <nav class="second-nav" v-else>
          <router-link
            class="second-nav-links"
            v-for="item in detailTabs"
            :key="item.component"
            :to="{name: item.component}">
            <span @click="item.firstTime = false">
                 <v-badge color="accent" left v-if="item.firstTime && item.name != 'General'" v-model="item.firstTime" small><span slot="badge"></span></v-badge>
                 {{ item.name }}
              </span>
          </router-link>
          <sharepoint-link v-if="event.metadata.sharepoint_link" :link="event.metadata.sharepoint_link"></sharepoint-link>
        </nav>
        <router-view></router-view>
        <status-stepper v-if="showStepper" :currentStatus="event.metadata.event_status"></status-stepper>
    </v-container>
</template>

<script>

import { mapGetters } from 'vuex';
import marked from 'marked';
import store from '@/store';
import { FETCH_EVENT } from '@/store/actions.type';
import { EVENT_DETAIL_NAVIGATIONS } from '@/common/navigational-fields.js';
import REventGeneral from '@/views/Event/General.vue';
import REventNotification from '@/views/Event/General.vue';
import REventResponses from '@/views/Event/Responses.vue';
import REventExtCapacity from '@/views/Event/ExtCapacity.vue';
import REventFigures from '@/views/Event/Figures.vue';
import REventResources from '@/views/Event/Resources.vue';
import REventSitrep from '@/views/Event/SITREP.vue';
import SharepointLink from '@/views/util/Sharepoint.vue';
import StatusStepper from './StatusStepper.vue';


/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
/*eslint no-console: off*/

export default {
    name: 'REvent',
    props: {
        slug: {
            type: String,
        },
        firstTime: {
            type: Boolean,
            default: false
        }
    },
    data(){
        return {
            active: null,
            detailTabs: EVENT_DETAIL_NAVIGATIONS,
            mini: true,
            right: null,
            statusChanged: false
        };
    },
    components: {
        REventGeneral, REventNotification, REventResponses, REventExtCapacity, REventFigures, REventResources, SharepointLink, StatusStepper
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
            'eventStatus',
            'currentUser',
            'isAuthenticated'
        ]),
        showStepper(){
            return (this.statusChanged && this.event.metadata.event_status != 'monitoring');
        }
    },
    watch: {
        slug(newVal){
            this.fetchEvent(newVal);
            if(this.firstTime){
                this.detailTabs.map(item => item.firstTime = true);
            }
        }
    },
    methods: {
        parsedMarkdown(chunk){
            return marked(chunk);
        },
        fetchEvent(newId) {
            this.$store.dispatch(FETCH_EVENT, newId);
        }
    }
};

</script>
<style lang='scss'>
    @import '@/assets/css/sideTab.scss';
    @import '@/assets/css/event.scss';
    .v-badge__badge{
        height: 12px;
        width: 12px;
        position: initial;
        align-items: unset;
    }
</style>
