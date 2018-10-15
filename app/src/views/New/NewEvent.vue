<template>
    <v-layout row justify-center>
        <v-dialog v-model="dialog" persistent max-width="1000px">
            <v-btn slot="activator" color="primary">
                <v-icon> add </v-icon> new event
            </v-btn>
            <v-card>
                <v-toolbar color="red" dark>
                    <v-toolbar-title>Create new event</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-text-field label="Name" v-model="metadata.name" required></v-text-field>
                        <v-textarea box
                        autoGrow
                        label="Description"
                        v-model="metadata.description"
                        hint="example of helper text only on focus"></v-textarea>
                        <v-layout wrap row>
                            <h3> Event Type </h3>
                            <v-flex v-for="(item, index) in allEventTypes" :key="index" :value="item.value" :id="'ev-type'+index">
                                <v-checkbox color="black" :label="item.text" v-model="checkedTypes" :value="item.value" ></v-checkbox>
                                <v-flex v-if="item.subTypes && (checkedTypes.indexOf(item.value) != -1)">
                                    <v-checkbox v-for="(sub, sIndex) in item.subTypes" :key="sIndex" color="black" class="caption" v-model="checkedSubTypes" :value="sub.value" :id="'ev-sub-'+(sub.text)+sIndex" :label="sub.text" />
                                    <v-checkbox color="black" v-model="checkedSubTypes" :value="'other:'+ item.value" :label="'other '+item.text"/>
                                    <v-text-field v-model="others[item.value]" label="Please specify"></v-text-field>
                                    <!-- v-if="checkedSubTypes.indexOf('other:'+ item.value) != -1"  -->
                                </v-flex>
                            </v-flex>
                            <v-text-field color="black" v-model="others.eventType" label="Other type"></v-text-field>
                        </v-layout>
                        <v-layout>
                            <v-flex>
                                <v-menu ref="dateSelected" :close-on-content-click="false" v-model="dateSelected" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                    <v-text-field slot="activator" v-model="dateFormatted" label="Event Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" @blur="eventDate = parseDate(dateFormatted)" ></v-text-field>
                                    <v-date-picker v-model="eventDate" no-title @input="dateSelected = false"></v-date-picker>
                                </v-menu>
                                <p>Date in ISO format: <strong>{{ eventDate }}</strong></p>
                            </v-flex>
                            <v-flex>
                                <v-menu ref="menu" :close-on-content-click="false" v-model="timeSelected" :nudge-right="40" :return-value.sync="eventTime" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                    <v-text-field slot="activator" time v-model="eventTime" label="Local event time" prepend-icon="access_time"></v-text-field>
                                    <v-time-picker v-if="timeSelected" v-model="eventTime" full-width color="red" event-color="black" format="24hr" @change="$refs.menu.save(eventTime)" ></v-time-picker>
                                </v-menu>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <h3> Event Status </h3>
                            <v-btn-toggle v-model="selectedStatus">
                                <v-btn v-for="(status, index) in allEventStatuses"
                                :value="status.value"
                                :key="index" flat
                                :class="status.value">
                                    <v-icon> {{status.icon}} </v-icon>
                                    <span> {{status.text}}</span>
                                </v-btn>
                            </v-btn-toggle>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex>
                                <h3> Local contact </h3>
                                <v-text-field v-model="metadata.incharge_contact.local.name" label="Name"  prepend-icon="person">
                                </v-text-field>
                                <v-text-field v-model="metadata.incharge_contact.local.position" label="Position"></v-text-field>
                            </v-flex>
                            <v-flex>
                                <h3> REACH operator </h3>
                                <!-- TODO: // autocomplete from Contact list -->
                                <v-text-field v-model="metadata.incharge_contact.operator.name" label="Name"  prepend-icon="person">
                                </v-text-field>
                                <v-text-field v-model="metadata.incharge_contact.operator.position" label="Position"></v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-text-field label="SharePoint Link" box append-icon="link" v-model="metadata.sharepoint_link">
                        </v-text-field>
                        <v-flex xs12 sm6 class="py-2">
                            <p> Severity measure </p>
                            <v-btn-toggle v-model="metadata.severity_measures[0].scale">
                                <v-btn flat v-for="(item, index) in allSeverityScales" :value="item.value"
                                :key="index" :color="item.color"> {{ item.label }}
                                </v-btn>
                            </v-btn-toggle>
                            <v-textarea box label="Severity description"
                            autoGrow v-model="metadata.severity_measures[0].description">
                            </v-textarea>
                      </v-flex>
                    </v-container>
                    <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>


<script>

/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
/*eslint no-console: off*/

import { EVENT_TYPES, EVENT_STATUSES, SEVERITY, DEFAULT_EVENT_METADATA } from '@/common/common';
import { CREATE_EVENT } from '@/store/actions.type';
export default {
    name: 'new-event',
    data: () => ({
        dialog: false,
        allEventTypes: EVENT_TYPES,
        allEventStatuses: EVENT_STATUSES,
        allSeverityScales: SEVERITY,
        checkedTypes:[],
        checkedSubTypes: [],
        selectedStatus: null,
        others:{
            eventType: '',
            disease_outbreak:'',
            natural_disaster: ''
        },
        eventDate: null,
        eventTime: null,
        dateFormatted: null,
        dateSelected: false,
        timeSelected: false,
        metadata: DEFAULT_EVENT_METADATA,
        inProgress: false
    }),
    watch: {
        eventDate (val) {
            this.dateFormatted = this.formatDate(val);
        }
    },
    methods:{
        close(){
            this.dialog = false;
            this.metadata = DEFAULT_EVENT_METADATA;
        },
        save(){
            this.lintDateTime();
            this.lintStatus();
            this.lintTypes();
            this.inProgress = true;
            console.log('SAVED !!!! ', this.metadata);
            this.$store.dispatch(CREATE_EVENT, this.metadata)
                .then((payload) =>{
                    console.log('STORE -dispatch.then--- ', payload);
                    this.inProgress = false;
                    this.$router.push({
                        name: 'event-general',
                        params: { slug: payload.metadata.id }
                    });
                });
        },
        lintDateTime(){
            this.metadata.event_datetime = this.eventDate + this.eventTime;
        },
        lintStatus(){
            this.metadata.status.push({type: this.selectedStatus, timestamp: Date.now()});
        },
        lintTypes(){
            this.metadata.types = this.checkedTypes.concat(this.others.eventType);
            //TODO: remove other:
            this.metadata.sub_types = this.checkedSubTypes.concat([this.others.disease_outbreak, this.others.natural_disaster]);
        },
        formatDate (date) {
            if (!date) return null;

            const [year, month, day] = date.split('-');
            return `${month}/${day}/${year}`;
        },
        parseDate (date) {
            if (!date) return null;
            const [month, day, year] = date.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
};
</script>

<style>
    .v-date-picker-title__date {
        font-size: 24px;
    }
    .v-picker__title__btn:not(.active){
        opacity: 1;
    }
    .v-time-picker-title__time .v-picker__title__btn,
    .v-time-picker-title__time span{
        font-size: 48px !important;
        height: 48px;
    }
</style>
