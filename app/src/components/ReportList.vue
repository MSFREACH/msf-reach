<template>
    <v-layout row app xs12 :clipped="$vuetify.breakpoint.mdAndUp">
        <v-card v-if="isLoadingReport" class="event-preview">
              Loading reports...
        </v-card>
        <v-toolbar v-else-if="fetchReportError" slot="header" mt3 flat :clipped="$vuetify.breakpoint.mdAndUp" >
            <v-toolbar-title> Reports </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-flex xs6 md4 lg3>
                An Error has occured in fetching Reports : {{fetchReportError}}
            </v-flex>
            <new-report-card></new-report-card>
        </v-toolbar>
        <v-container v-else>
            <v-data-iterator :items="reports"
            content-tag="v-layout"
            :rows-per-page-items="rowsPerPageItems"
            :pagination.sync="pagination"
            no-data-text="No reports found"
            row wrap>
            <v-toolbar slot="header" mt3 flat :clipped="$vuetify.breakpoint.mdAndUp">
                <v-toolbar-title> Reports </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-flex xs6 md4 lg3>
                    <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                </v-flex>
                <new-report-card></new-report-card>
            </v-toolbar>
                <v-flex xs12 md6 lg4 slot="item" slot-scope="props">
                    <v-card>
                        <v-card-title primary-title v-if="editingID == props.item.id">
                            <v-switch :label="tmpReport.status" v-model="confirmed"></v-switch>
                            <v-flex>
                                <v-select chips :items="tags" v-model="tmpReport.content.report_tag" item-value="text"> </v-select>
                            </v-flex>
                            <v-select :items="displayEvents" v-model="tmpReport.eventId" label="ASSIGN to Event"></v-select>
                            <v-btn @click="editReport()">save</v-btn>
                        </v-card-title>
                        <v-card-title primary-title v-else>
                            <small> {{props.item.created | relativeTime }} </small>
                            <v-chip small> {{props.item.status}} </v-chip>
                            <v-chip small outline v-if="props.item.content.report_tag"> {{props.item.content.report_tag}} </v-chip>
                            <v-spacer></v-spacer>
                            <v-icon> bookmark_border </v-icon>
                            <v-icon @click="toggleEdit(props.item)">edit</v-icon>
                            <v-icon @click="deleteReport()">delete</v-icon>
                        </v-card-title>

                        <v-img v-if="props.item.content.image_link" src="props.item.content.image_link" aspect-ratio="1.75"></v-img>
                        <v-img v-else src="https://picsum.photos/510/300?random" aspect-ratio="1.75"></v-img>
                        <v-card-text> {{ props.item.content.description }} </v-card-text>
                        <!-- <v-card-actions>
                            <v-overflow-btn
                              :items="displayEvents"
                              v-model="tmpReport.eventId"
                              label="ASSIGN to Event"
                            ></v-overflow-btn>
                        </v-card-actions> -->
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
import { FETCH_EVENTS, FETCH_REPORTS, EDIT_REPORT } from '@/store/actions.type';
import { REPORT_TYPES, REPORT_STATUSES } from '@/common/common';
import { DEFAULT_EDIT_REPORT_CARD_FIELDS } from '@/common/form-fields';
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
            tags: REPORT_TYPES,
            confirmed: null,
            tmpReport: DEFAULT_EDIT_REPORT_CARD_FIELDS,
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
            'events',
            'fetchReportError'
        ])
    },
    watch:{
        events(newValue){ // eslint-disable-line no-unused-vars
            this.displayEvents = this.events.map(item => ({text: item.metadata.name, value: item.id}));
        },
        confirmed(newVal){
            if(newVal){
                this.tmpReport.status = 'confirmed';
            }else{
                this.tmpReport.status = 'unconfirmed';
            }
        }
    },
    mounted() {
        this.fetchReports();
        if(this.events.length == 0){
            this.$store.dispatch(FETCH_EVENTS, {});
        }else{
            this.displayEvents = this.events.map(item => ({text: item.metadata.name, value: parseInt(item.id)}));
        }
    },
    methods: {
        fetchReports(){
            this.$store.dispatch(FETCH_REPORTS);
        },
        toggleEdit(item){
            this.editingID = item.id;
            this.confirmed = item.status == 'confirmed' ? true : false;
            this.tmpReport.content.report_tag = item.content.report_tag;
        },
        editReport(){
            this.$store.dispatch(EDIT_REPORT, [this.editingID, this.tmpReport])
                .then((payload) => {
                    this.tmpReport = DEFAULT_EDIT_REPORT_CARD_FIELDS;
                });
        },
        deleteReport(report){
            this.tmpReport.status = 'ignored';
            this.editReport();
        }
    }

};
</script>

<style lang="scss">

</style>
