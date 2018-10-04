<template>
    <v-layout row app xs12 sm6 app>
        <v-card v-if="isLoading" class="event-preview">
              Loading events...
        </v-card>
        <v-container v-else>
            <v-data-iterator :items="events"
            content-tag="v-layout"
            :rows-per-page-items="rowsPerPageItems"
            :pagination.sync="pagination"
            no-data-text="No events found"
            :search="search"
            :custom-filter="customFilter"
            row wrap>
                <!-- <r-event-preview v-for="(event, index) in events" :event="event" :key="event.id + '-event'"></r-event-preview> -->

                <v-toolbar slot="header" mb2 flat>
                    <v-toolbar-title> This is a header </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                    <v-flex xs12 sm6>
                        <v-select v-model="filteredTypes" :items="allEventTypes" attach chips label="Chips" multiple></v-select>
                    </v-flex>
                </v-toolbar>
                <v-flex slot="item" slot-scope="props" xs12>
                    <v-list three-line>
                        <v-list-tile :key="props.item.id" avatar ripple :to="{name: 'event', params: {'slug': props.item.id}}">
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
import REventPreview from '@/components/REventPreview';
import VPagination from '@/components/VPagination';

import { FETCH_EVENTS } from '@/store/actions.type';
import { EVENT_TYPES } from '@/common/common';

export default {
    name: 'REventList',
    components: {
        REventPreview, VPagination
    },
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
        ellipsis(text){
            return _.truncate(text, {
                'length' : 100,
                'separator' : ' '
            });
        },
        ...mapGetters([
            'eventsCount',
            'isLoading',
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
