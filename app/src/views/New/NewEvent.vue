<template>
    <v-layout row justify-center>
        <v-dialog v-model="dialog" persistent max-width="1000px">
            <v-btn slot="activator" fab small flat dark color="grey darken-1">
                <v-icon> add </v-icon>
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
                                </v-flex>
                            </v-flex>
                            <v-text-field color="black" v-model="others.eventType" label="Other type"></v-text-field>
                        </v-layout>
                        <v-layout>
                            <v-flex>
                                <v-menu ref="dateSelected" :close-on-content-click="false" v-model="dateSelected" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                    <v-text-field slot="activator" v-model="eventDate" label="Event Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" type="date"></v-text-field>
                                    <v-date-picker v-model="eventDate" no-title @input="dateSelected = false"></v-date-picker>
                                </v-menu>
                            </v-flex>
                            <v-flex>
                                <v-menu ref="menu" :close-on-content-click="false" v-model="timeSelected" :nudge-right="40" :return-value.sync="eventTime" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                    <v-text-field slot="activator" time v-model="eventTime" label="Local event time" prepend-icon="access_time" type="time"></v-text-field>
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
                                <v-text-field v-model="metadata.person_incharge.name" label="Name"  prepend-icon="person">
                                </v-text-field>
                                <v-text-field v-model="metadata.person_incharge.position" label="Position"></v-text-field>
                            </v-flex>
                            <v-flex>
                                <h3> REACH operator </h3>
                                <!-- TODO: // autocomplete from CURRENT USER -->
                                <v-text-field v-model="metadata.operator.name" label="Name"  prepend-icon="person">
                                </v-text-field>
                                <v-text-field v-model="metadata.operator.position" label="Position"></v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-text-field label="SharePoint Link" type="url" box append-icon="link" v-model="metadata.sharepoint_link">
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
                <v-progress-linear v-if="inProgress" :indeterminate="true"></v-progress-linear>
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

import { EVENT_TYPES, EVENT_STATUSES, SEVERITY } from '@/common/common';
import { DEFAULT_EVENT_METADATA } from '@/common/form-fields';
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
            eventType: null,
            disease_outbreak:null,
            natural_disaster: null
        },
        eventDate: null,
        eventTime: null,
        dateFormatted: null,
        dateSelected: false,
        timeSelected: false,
        metadata: DEFAULT_EVENT_METADATA,
        inProgress: false
    }),
    methods:{
        close(){
            this.dialog = false;
            this.metadata = DEFAULT_EVENT_METADATA;
        },
        save(){
            this.metadata.areas = [{
                region: 'Berlin',
                country: 'Germany',
                country_code: 'DE'
            }];

            this.lintDateTime();
            this.lintStatus();
            this.lintTypes();
            this.inProgress = true;
            // TODO: replace geoJSON with map input
            var timestamp = new Date();
            var ISOTime = timestamp.toISOString();
            var payload = {
                location:{
                    lat: 52.5200,
                    lng: 13.4050
                },
                created_at: ISOTime,
                type: this.checkedTypes.join(','),
                status: 'active',
                metadata: this.metadata
            };

            this.$store.dispatch(CREATE_EVENT, payload)
                .then((payload) =>{
                    var eventID = payload.data.result.objects.output.geometries[0].properties.id;
                    this.inProgress = false;
                    this.$router.push({
                        name: 'event-general',
                        params: { slug: eventID, firstTime: true }
                    });
                });
        },
        lintDateTime(){
            var tempDateTime = new Date(this.eventDate +' '+this.eventTime);
            this.metadata.event_datetime = tempDateTime.toISOString();
        },
        lintStatus(){
            var timestamp = new Date();
            var ISOTime = timestamp.toISOString();
            this.metadata.event_status = this.selectedStatus;
            this.metadata.status_updates = [{status: this.selectedStatus, timestamp: ISOTime}];
        },
        lintTypes(){
            this.metadata.types = this.others.eventType ? this.checkedTypes.concat(this.others.eventType) : this.checkedTypes;
            //TODO: remove other:
            this.metadata.sub_types = this.checkedSubTypes.concat([this.others.disease_outbreak, this.others.natural_disaster]).filter(Boolean);

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
