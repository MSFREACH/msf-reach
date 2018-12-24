<template>
    <v-layout class="eventList" app>
        <v-card v-if="isLoadingEvent" class="event-preview">
              Loading events...
        </v-card>
        <v-flex xs3 v-else>
            <v-data-iterator
            content-tag="v-layout"
            :items="displayEvents"
            :search="search"
            no-data-text="No events found"
            hide-actions
            wrap row>
                <v-toolbar class="listHeader" slot="header" flat>
                    <div class="full-width">
                        <v-text-field v-model="search" label="Search" single-line hide-details xs10></v-text-field>
                        <new-event xs2></new-event>
                    </div>

                    <div class="full-width">
                        <v-select v-model="filteredTypes" :items="allEventTypes" attach label="Type" round></v-select>
                        <div :class="selectedStatus + '-wrapper statusWrapper'">
                            <label>
                                <span v-if="selectedStatus">{{selectedStatus}}</span>
                                <span v-else>status</span>
                            </label>
                            <v-btn-toggle :value="selectedStatus">
                                <span v-for="(status, index) in allEventStatuses"
                                :value="status.value"
                                :key="index"
                                :class="status.value + '-fill select-status-filter'"
                                @click="filterByStatus(status.value)">
                                </span>
                            </v-btn-toggle>
                        </div>
                    </div>
                </v-toolbar>
                <v-list class="result-list" three-line slot="item" slot-scope="props">
                    <v-list-tile :key="props.item.id" avatar ripple :to="{name: 'event-general', params: {'slug': props.item.id}}">
                        <v-list-tile-content>
                            <v-list-tile-title :class="props.item.metadata.event_status.toLowerCase()">
                                <span class="title-text"> {{props.item.metadata.name}} </span>
                                <span class="list-actions">
                                    <v-icon color="grey lighten-1">exit_to_app</v-icon>
                                    <v-icon color="grey lighten-1">bookmark</v-icon>
                                    <v-icon color="grey lighten-1">minimize</v-icon>
                                </span>
                            </v-list-tile-title>
                            <span class="not-render list-types" v-for="(eventType, index) in props.item.metadata.types" :key="index">  {{eventType}}  </span>
                            <span class="not-render">{{ props.item.metadata.event_status }} </span>

                            <v-list-tile-sub-title> <label> AREA </label> {{props.item.place}} </v-list-tile-sub-title>
                            <v-list-tile-sub-title> <label> UPDATED </label> {{ props.item.updated_at | relativeTime }} </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-iterator>
        </v-flex>
        <event-nav></event-nav>
    </v-layout>
</template>
<script>
/*eslint no-debugger: off*/
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/

import { mapGetters } from 'vuex';

import { FETCH_EVENTS } from '@/store/actions.type';
import { EVENT_TYPES, EVENT_STATUSES } from '@/common/common';
import NewEvent from '@/views/New/NewEvent.vue';
import REvent from '@/components/Event.vue';
import EventNav from '@/views/EventNav.vue';


export default {
    name: 'EventList',
    props: {
        status: {
            status: String,
            required: false,
            default: 'all'
        },
        author: {
            type: String,
            required: false
        },
        favorited: {
            type: Boolean,
            required: false
        }
    },
    data(){
        return {
            rowsPerPageItems: [4, 8, 12],
            pagination: {
                rowsPerPage: 8
            },
            search: '',
            allEventTypes: EVENT_TYPES,
            filteredTypes: [],
            displayEvents: [],
            allEventStatuses: EVENT_STATUSES,
            selectedStatus: ''
        };
    },
    components: {
        NewEvent, REvent, EventNav
    },
    computed: {
        listConfig(){
            const { status } = this;
            const filters = {};
            if (this.author) {
                filters.author = this.author;
            }
            if (this.favorited) {
                filters.favorited = this.favorited;
            }
            return { status, filters };
        },
        ...mapGetters([
            'eventsCount',
            'isLoadingEvent',
            'events',
            'fetchEventsError'
        ])
    },
    watch: {
        events(newValue){ // eslint-disable-line no-unused-vars
            this.events.map( item => {
                item.short_description =
                _.truncate(item.metadata.description, {
                    'length' : 250,
                    'separator' : ' '
                });
                var cleanAreas = _.compact(item.metadata.areas);

                if(!item.metadata.areas || _.isEmpty(cleanAreas)){
                    item.place = item.metadata.country;
                }else{
                    if(cleanAreas[0].region){
                        item.place = cleanAreas[0].region + cleanAreas[0].country_code;
                    }else{
                        item.place = cleanAreas[0].country;
                    }
                }

                if(!item.metadata.types){
                    item.metadata.types = item.type.split(',');
                }

            });
            this.displayEvents = _.map(this.events, _.clone);
        },
        filteredTypes(newValue){
            this.displayEvents = this.events.filter(item => {
                var types = item.metadata.types ? item.metadata.types : item.type.split(',');
                return _.isEmpty(newValue) || _.indexOf(types, newValue) != -1;
            });
        }
    },
    mounted () {
        this.fetchEvents();
    },
    methods: {
        fetchEvents() {
            this.$store.dispatch(FETCH_EVENTS, this.listConfig);
        },
        filterByStatus(status){
            this.selectedStatus = status;
            this.displayEvents = this.events.filter(item =>{
                if(item.metadata.event_status && item.metadata.event_status.toLowerCase() == status) return item;
            });
        },
        customFilter(items, search, filter){
            // zero filtering
            if (!search && _.isEmpty(this.filteredTypes)){ return items; }
            if (!search) { // pure type filter
                return items.filter(item => {
                    return !this.filteredTypes || _.intersection(this.filteredTypes, item.types);
                });
            }
            search = search.toString().toLowerCase();

            if (_.isEmpty(this.filteredTypes)) {  // pure search string
                return itemsitems.filter(item => filter(item.metadata.description, search));
            }

            // Otherwise return search by both
            return items.filter(item => filter(item.metadata.description, search)).filter(item => {
                return !this.filteredTypes || _.intersection(this.filteredTypes, item.types);
            });
        }
    }
};

</script>

<style lang="scss">
    @import '@/assets/css/lists.scss';
    @import '@/assets/css/event.scss';

    .result-list.v-list{
        width: 100%;
        background: #E8E8E8;
        border-radius: 5px;
        margin: 5px;
        box-sizing: border-box;
        border: 2px transparent solid;
        padding: 0;
    }
    .result-list.v-list:hover{
        border: 2px #0374C7 solid;
        background: #fff;
    }
    .listHeader{
      height: 128px;

      .v-toolbar__content{
        height: 128px;
        display: block;
      }

      .v-toolbar__content div{
        display: inline-flex;
      }

      .v-select.v-select--chips .v-select__selections{
          min-height: inherit;
      }
      .v-select__selections div{
          display: block;
      }
    }
    .v-menu{
      display: block !important;
    }
    .v-data-iterator{
        width: 100%;
        overflow: auto;
        height: calc(100vh - 68px);
    }
    .v-list__tile{
        padding: 8px 12px;
        border-radius: 5px;
    }
    .v-list__tile--active{
        background: #D0D3DA;
    }
    .v-list__tile__title {
        white-space: inherit;
        span{
            display: inline-block;
        }
    }

    .v-list__tile__sub-title{
        font-weight: normal;
        color: #000;
    }
    .select-status-filter{
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
    }

    .list-types{
        font-size: 8px;
    }
    .not-render{
        display: none;
    }

    .list-actions{
        float: right;
        .v-icon{
            font-size: 20px;
        }
    }
    .title-text{
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
