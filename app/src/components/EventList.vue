<template>
    <v-layout row app xs12 sm6 app>
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
                <!-- <r-event-preview v-for="(event, index) in events" :event="event" :key="event.id + '-event'"></r-event-preview> -->
                <v-toolbar slot="header" mb2 flat>
                    <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                    <v-spacer></v-spacer>
                    <v-flex xs12 sm6>
                        <v-select v-model="filteredTypes" :items="allEventTypes" attach chips label="filter by type" multiple></v-select>
                    </v-flex>
                    <new-event></new-event>
                </v-toolbar>
                <v-flex slot="item" slot-scope="props" xs12>
                    <v-list three-line>
                        <v-list-tile :key="props.item.id" avatar ripple :to="{name: 'event-general', params: {'slug': props.item.id}}">
                            <!-- <r-event-meta :event="event" isPreview="true"></r-event-meta> -->
                            <v-list-tile-content>
                                <v-list-tile-title> {{props.item.metadata.name}} </v-list-tile-title>
                                <v-chip v-if="props.item.metadata.event_status" small outline color="primary"> {{props.item.metadata.event_status}} </v-chip>
                                <v-chip v-else small outline> monitoring </v-chip>
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
import { EVENT_TYPES } from '@/common/common';
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
            displayEvents: []
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
    @import '@/assets/css/event-list.scss';

</style>
