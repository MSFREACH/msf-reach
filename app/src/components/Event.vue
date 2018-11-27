<template>
    <v-container class="event-page" app>
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
              <v-badge v-model="item.firstTime" color="cyan" left v-if="item.firstTime" ><v-icon>{{item.icon}}</v-icon></v-badge>
              <!-- <v-icon v-else>{{item.icon}}</v-icon> -->
              {{ item.name }}
          </router-link>
          <v-flex class="tooltip">
              <v-btn flat small fab @click="copyLink()" v-on:onmouseout="outFunc()" >
                  <v-icon> link </v-icon>
                  <span class="tooltiptext" id="myTooltip">Copy to clipboard</span>
              </v-btn>
          </v-flex>
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
import REventResponse from '@/views/Event/Response.vue';
import REventExtCapacity from '@/views/Event/ExtCapacity.vue';
import REventFigures from '@/views/Event/Figures.vue';
import REventStaffResources from '@/views/Event/StaffResources.vue';
import REventSitrep from '@/views/Event/SITREP.vue';

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
            required: false,
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
        REventGeneral, REventNotification, REventResponse, REventExtCapacity, REventFigures, REventStaffResources
    },
    beforeRouteEnter(to, from, next){
        Promise.all([
            store.dispatch(FETCH_EVENT, to.params.slug),
        ]).then((data) => {
            next();
        });
    },
    mounted(){
        console.log('Props ---- firstTime  ', this.firstTime);
        if(this.firstTime){
            this.detailTabs.map(item => item.firstTime = true );
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
    .event-page{
        position: absolute;
        top: 40px;
        padding: 0;
    }
    .second-nav{
        margin-left: 30px;
    }
    .second-nav-links{
        color: #707070;
        padding: 10px 15px;
        border-bottom: 1px solid #ccc;
    }
    .second-nav-links.router-link-exact-active{
        font-weight: bold;
        border-bottom: 1px solid #000;
    }
</style>
