<template>
    <v-layout row app xs12 :clipped="$vuetify.breakpoint.mdAndUp">
        <v-card v-if="isLoadingReport" class="event-preview">
              Loading reports...
        </v-card>
        <v-container v-else>
            <v-data-iterator :items="reports"
            content-tag="v-layout"
            :rows-per-page-items="rowsPerPageItems"
            :pagination.sync="pagination"
            no-data-text="No reports found"
            :search="search"
            row wrap>
                <v-toolbar slot="header" mb2 flat>
                    <v-toolbar-title> Reports </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                    <new-report-card></new-report-card>
                </v-toolbar>
                <v-flex xs12 md6 lg4 slot="item" slot-scope="props">
                    <v-card>
                        <v-card-title primary-title v-if="editingID == props.item.id">
                            <v-switch :label="confirmation" v-model="tmpReport.confirmed"></v-switch>
                            <v-select :items="types" v-model="tmpReport.type" item-value="text"> </v-select>
                            <v-btn @click="editReport()">save</v-btn>
                        </v-card-title>
                        <v-card-title primary-title v-else>
                            <small> {{props.item.created | relativeTime }} </small>
                            <v-chip small> {{props.item.status}} </v-chip>
                            <v-chip small outline v-if="props.item.content.report_tag"> {{props.item.content.report_tag}} </v-chip>
                            <v-spacer></v-spacer>
                            <v-icon> bookmark_border </v-icon>
                            <v-icon @click="toggleEdit(props.item)">edit</v-icon>
                            <v-icon @click="deleteItem(props.item)">delete</v-icon>
                        </v-card-title>

                        <v-img v-if="props.item.content.image_link" src="props.item.content.image_link" aspect-ratio="1.75"></v-img>
                        <v-img v-else src="https://picsum.photos/510/300?random" aspect-ratio="1.75"></v-img>
                        <v-card-text> {{ props.item.content.description }} </v-card-text>
                        <v-card-actions>
                            <v-overflow-btn
                              :items="displayEvents"
                              v-model="tmpReport.eventID"
                              label="ASSIGN to Event"
                            ></v-overflow-btn>

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
import { FETCH_EVENTS, FETCH_REPORTS } from '@/store/actions.type';
import { REPORT_TYPES, REPORT_STATUSES } from '@/common/common';
import NewReportCard from '@/views/New/NewReport.vue';


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
            search: '',
            editingID: null,
            statuses: REPORT_STATUSES,
            types: REPORT_TYPES,
            tmpReport: {
                confirmed: null,
                eventID: null,
                type: null
            },
            displayEvents: []
        };
    },
    components: {
        NewReportCard
    },
    computed: {
        ...mapGetters([
            'reportsCount',
            'isLoadingReport',
            'reports',
            'events'
        ]),
        confirmation(){
            if (this.tmpReport.confirmed){
                return 'confirmed';
            }
            return 'unconfirmed';
        }
    },
    watch:{
        events(newValue){ // eslint-disable-line no-unused-vars
            debugger;
            this.displayEvents = this.events.map(item => ({text: item.metadata.name, value: item.id}));
            console.log( this.displayEvents);
        }
    },
    mounted() {
        this.fetchReports();
        if(this.events.length == 0){
            this.$store.dispatch(FETCH_EVENTS, {});
        }else{
            this.displayEvents = this.events.map(item => ({text: item.metadata.name, value: item.id}));
            console.log('HEY MATE ---- ', this.displayEvents);
        }
    },
    methods: {
        fetchReports(){
            this.$store.dispatch(FETCH_REPORTS);
        },
        toggleEdit(item){
            this.editingID = item.id;
            this.tmpReport.confirmed = item.status == 'confirmed' ? true : false;
            this.tmpReport.type = item.content.report_tag;
        },
        editReport(){
            // after UPDATE reset tmpReport

            // var payload = {
            //     eventId: report.eventID,
            //     status:
            // }
        }
    }

};
</script>

<style lang="scss">

</style>
