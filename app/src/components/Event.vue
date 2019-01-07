<template>
    <v-container class="event-page" xs9 app>
        <span v-if="!slug">
            Please select event for review.
        </span>
        <!-- fake tab look, but need to use router for all the chidren -->
        <nav class="second-nav" v-else>
          <router-link
            class="second-nav-links"
            v-for="item in detailTabs"
            :key="item.component"
            :to="{name: item.component}"
            @click="item.firstTime = false">
              <v-badge color="accent" left v-if="item.firstTime" v-model="item.firstTime" small><span slot="badge"></span></v-badge>
              {{ item.name }}
          </router-link>
          <sharepoint-link :link="event.metadata.sharepoint_link"></sharepoint-link>
        </nav>
        <router-view></router-view>
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
            right: null
        };
    },
    components: {
        REventGeneral, REventNotification, REventResponses, REventExtCapacity, REventFigures, REventResources, SharepointLink
    },
    beforeRouteEnter(to, from, next){
        Promise.all([
            store.dispatch(FETCH_EVENT, to.params.slug),
        ]).then((data) => {
            next();
        });
    },
    mounted(){
        if(this.firstTime){
            this.detailTabs.map(item => {
                if(item.name != 'General') item.firstTime = true;
            });
        }
    },
    computed: {
        ...mapGetters([
            'event',
            'currentUser',
            'isAuthenticated'
        ])
    },
    watch: {
        slug(newVal){
            this.fetchEvent(newVal);
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
