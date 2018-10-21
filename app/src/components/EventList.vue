<template>
    <v-layout row app xs12 sm6 :clipped="$vuetify.breakpoint.mdAndUp" app>
        <v-card v-if="isLoadingEvent" class="event-preview">
              Loading events...
        </v-card>
        <v-container v-else>
            <v-data-iterator :items="displayEvents"
            content-tag="v-layout"
            :rows-per-page-items="rowsPerPageItems"
            :pagination.sync="pagination"
            no-data-text="No events found"
            :search="search"
            row wrap>
                <v-toolbar slot="header" mt3 flat>
                    <!-- <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field> -->
                    <!-- <v-spacer></v-spacer> -->
                    <v-flex xs12 sm6 class="py-2">
                        <v-btn-toggle v-model="selectedStatus">
                            <v-btn v-for="(status, index) in allEventStatuses"
                            :value="status.value"
                            :key="index" flat
                            :class="status.value"
                            @click="filterByStatus(status.value)">
                                <v-icon> {{status.icon}} </v-icon>
                                <span> {{status.text}}</span>
                            </v-btn>
                        </v-btn-toggle>
                    </v-flex>

                    <v-flex>
                         <!-- xs6 md4 lg3 -->
                        <v-select v-model="filteredTypes" :items="allEventTypes" attach chips label="Type" multiple round></v-select>
                    </v-flex>
                    <new-event></new-event>
                </v-toolbar>
                <v-flex slot="item" slot-scope="props" xs12>
                    <v-list three-line>
                        <v-list-tile :key="props.item.id" avatar ripple :to="{name: 'event-general', params: {'slug': props.item.id}}">
                            <!-- <r-event-meta :event="event" isPreview="true"></r-event-meta> -->
                            <v-list-tile-content>
                                <v-list-tile-title> {{props.item.metadata.name}} </v-list-tile-title>
                                <v-chip v-if="props.item.metadata.event_status"
                                :class="props.item.metadata.event_status"
                                small outline label> {{props.item.metadata.event_status}} </v-chip>
                                <v-chip v-else small outline label> monitoring </v-chip>
                                <v-list-tile-sub-title> {{ props.item.short_description }} </v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-divider></v-divider>
                    </v-list>
                </v-flex>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-iterator>
        </v-container>
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
                rowsPerPage: 4
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
        NewEvent
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
            'events'
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
            });
            this.displayEvents = _.map(this.events, _.clone);
        },
        filteredTypes(newValue){
            this.displayEvents = this.events.filter(item => {
                var types = item.type.split(',');
                return _.isEmpty(newValue) || _.intersection(newValue, types).length > 0;
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
        filterType(type){

        },
        filterByStatus(status){
            this.displayEvents = this.events.filter(item =>{
                return item.metadata.event_status == status;
            });
        },
        customFilter(items, search, filter){
            // zero filtering
            if (!search && _.isEmpty(this.filteredTypes)){ return items; }

            console.log('--00000--- ', this.filteredTypes, filter );
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

    // .v-select>.v-input__control>.v-input__slot{
    //     border: 2px solid #747474;
    //     border-radius: 30px;
    // }
    // .v-select>.v-input__control>.input__slot:before{
    //     border-style: none;
    // }
</style>
