<template>
    <v-layout row app xs12 app>
        <v-card v-if="isLoadingReport" class="event-preview">
              Loading events...
        </v-card>
        <v-container v-else>
            <v-data-iterator :items="reports"
            content-tag="v-layout"
            :rows-per-page-items="rowsPerPageItems"
            :pagination.sync="pagination"
            no-data-text="No events found"
            :search="search"
            row wrap>
                <v-toolbar slot="header" mb2 flat>
                    <v-toolbar-title> This is a header </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                </v-toolbar>
                <v-flex xs12 md6 lg4 slot="item" slot-scope="props">
                    <v-card>
                        <v-card-title primary-title>
                            {{props.item.created | relativeTime }}
                            <v-chip small> {{props.item.status}} </v-chip>
                            <v-chip small outline v-if="props.item.content.report_tag"> {{props.item.content.report_tag}} </v-chip>
                        </v-card-title>
                        <v-card-media v-if="props.item.content.image_link" src="props.item.content.image_link" aspect-ratio="1.75"></v-card-media>
                        <v-card-media v-else src="https://picsum.photos/510/300?random" aspect-ratio="1.75"></v-card-media>
                        <v-card-text> {{ props.item.content.description }} </v-card-text>
                        <v-card-actions>
                            <v-overflow-btn
                              :items="events"
                              label="ASSIGN to Event"
                            ></v-overflow-btn>
                            <v-btn flat> <v-icon>star</v-icon> WATCH</v-btn>
                        </v-card-actions>
                    </v-card>
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
import { FETCH_REPORTS } from '@/store/actions.type';

export default {
    name: 'ReportList',
    props: {
        private: { // This is My reports
            type: Boolean,
            required: false
        },
        assigned: { // This is Assigned to me
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
            search: ''
        };
    },
    computed: {
        ...mapGetters([
            'reportCount',
            'isLoadingReport',
            'reports',
            'events'
        ])
    },
    watch:{

    },
    mounted() {
        this.fetchReports();
    },
    methods: {
        fetchReports(){
            this.$store.dispatch(FETCH_REPORTS);
        }
    }

};
</script>

<style lang="scss">

</style>
