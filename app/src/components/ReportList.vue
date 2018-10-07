<template>
    <v-layout row app xs12 sm6 app>
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
                <v-flex slot="item" slot-scope="props" xs12>
                    <v-list three-line>
                        <v-list-tile :key="props.item.eventId"">
                            <v-list-tile-content>
                                <v-list-tile-title> {{props.item.status}} </v-list-tile-title>
                                <v-chip v-if="props.item.status" small outline color="primary"> {{props.item.status}} </v-chip>
                                <v-chip v-else small outline> status </v-chip>
                                <v-list-tile-sub-title> {{ props.item.content }} </v-list-tile-sub-title>
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
            'reports'
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
