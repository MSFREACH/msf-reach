<template>
    <v-container fluid class="eventSubContent" v-if="eventMetadata">
        <div class="actions">
            <button v-if="!editing" @click="edit()">Edit</button>
            <div v-else>
                <button @click="cancelEdit()">Cancel</button>
                <button @click="save()"> Save </button>
            </div>
        </div>
         <v-layout row wrap v-if="!editing">
            <h1>{{eventMetadata.name}}</h1>
            <label>Areas</label>
            <v-layout align-center row fill-height>
                <v-flex v-for="(area, index) in eventMetadata.areas" xs6>
                    <v-card-text v-if="area.region.length > 0"> {{area.region}} {{area.country_code}} </v-card-text>
                    <v-card-text v-else>{{area.country}}</v-card-text>
                    <v-card-text v-if="eventMetadata.areas.length > 1 && index < eventMetadata.areas.length"> </v-card-text>
                    <v-card class="sub-tag" v-if="eventMetadata.severity_measures[index]">
                      <v-card-text :style="'color:'+severityColors[eventMetadata.severity_measures[index].scale-1]">{{severityLongTexts[eventMetadata.severity_measures[index].scale-1]}} severity</v-card-text>
                      <v-card-text class="notes"><br/> {{ eventMetadata.severity_measures[index].description }} </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
            <span :class="eventMetadata.event_status + ' event-status'"> {{eventMetadata.event_status || 'monitoring'}}  </span>
            <div>
                <span v-for="type in eventTypes">{{ type | capitalize | noUnderscore }}</span>
                <!-- TODO: add pairing icon + clickable taglink -->
            </div>
            <div> Happened {{ eventCreatedAt | relativeTime }}
                 <span>on {{eventMetadata.event_local_time | fullDate }} local time.</span>
            </div>
            <p>{{eventMetadata.description }}</p>
            <div>Person In charge {{ eventMetadata.incharge_name+', '+eventMetadata.incharge_position }} </div>
            <div>
                <a :href='eventMetadata.sharepoint_link' target="_blank">
                    Sharepoint Link
                </a>
            </div>
        </v-layout>
        <div v-else>

            <label> Name </label>
            <input type="text" v-model="eventMetadata.name" placeholder="Event name" />
            <div id="eventAreas">
                <label> Area(s) </label>
                <div v-if="eventMetadata.areas" v-for="(area, index) in eventMetadata.areas" class="tags" v-model="eventMetadata.areas">
                    <span v-if="area.region.length > 0"> {{area.region}}, {{area.country_code}} </span>
                    <span v-else> {{area.country}} </span>
                    <span class="remove" @click="removeArea(area)"> x </span>
                    <div class="severity-wrapper" v-if="eventMetadata.severity_measures[index]">
                        <span class="label"> Severity analysis </span>
                        <span class="inputSeveritySlider"></span>
                        <textarea v-model.trim="eventMetadata.severity_measures[index].description" placeholder="Severity description"></textarea>
                    </div>
                </div>
                <label> Add area for the emergency </label>
                <input type="text" class="form-control input-sm" placeholder="Search address/location..." id="editEventAddress">
                OR
                <input type="text" value="" id="editEventAddressLat" placeholder="Latitude">
                <input type="text" value="" id="editEventAddressLng" placeholder="Longitude">
                <button type="button" class="btn btn-info btn-sm" id="editEventAddressLocate">
                    <span class="glyphicon glyphicon-search"></span></button>
            </div>
            <!-- <div id="eventMap" class="map-container">   TODO: insert MAP component -->


            <label> Status </label>

            <select v-model="eventMetadata.event_status">
            <option disabled value="">Please select one</option>
            <option v-for="item in statuses" :value="item.value">{{ item.text }}</option>
            </select>

            <label> Type(s) </label>

            <div v-for="(item, index) in allEventTypes">
                <input class ="newEventTypeBox" v-model="checkedTypes" type="checkbox" :index="index" :value="item.value" :id="'ev-type'+index">
                <label class="eventBox" :for="'ev-type'+index"> {{item.text}} </label>
                <div v-if="item.subTypes && checkedTypes.indexOf(item.value) != -1" class="subTypes">
                    <span v-if="item.subTypes" :id="item.value + index" v-for="(sub, index) in item.subTypes">
                        <input class ="newSubEventTypeBox" v-model="checkedSubTypes" type="checkbox" :value="sub.value" :id="'ev-sub-'+(sub.text)+index" />
                        <label class="eventBox" :for="'ev-sub-'+(sub.text)+index"> {{sub.text}} &nbsp&nbsp </label>
                        <br v-if="index % 4 == 1"/>
                    </span>

                    <span>
                        <input class ="newSubEventTypeBox" v-model="otherFields[item.value].isSelected" type="checkbox" :value="'other_' + item.value" />
                        <label class="eventBox"> Other {{item.text}} &nbsp&nbsp </label>
                        <input v-if="otherFields[item.value].isSelected" type="text" v-model="otherFields[item.value].description"  placeholder="(Specify)" />
                    </span>
                </div>
            </div>


            <div>
                <input class ="newEventTypeBox" v-model="otherFields.type.isSelected" type="checkbox" value="other_emergencies"> <label class="eventBox"> Others </label>
                <input v-if="otherFields.type.isSelected" type="text" v-model="otherFields.type.description" placeholder="(Specify)" />
            </div>

            <label> Event datetime  </label>
            {{ eventCreatedAt | fullDate }}

            <label> Description </label>
            <textarea id="eventDescription" type="text" v-model="eventMetadata.description" placeholder="Event description"> </textarea>

            <label> Local datetime of event  </label>
            <div class="datepicker-container">
                <date-picker v-model="eventMetadata.event_local_time" :config="dateTimeConfig"></date-picker>
            </div>

            <label> Mission Contact Person  </label>
            <input type="text" v-model="eventMetadata.incharge_position" placeholder="Position" />
            <input type="text" v-model="eventMetadata.incharge_name" placeholder="Name" />

            <div class="datepicker-container">
                <date-picker v-model="eventMetadata.mission_contact_person.arrival_time" placeholder="Arrival time" :config="dateTimeConfig"></date-picker>
            </div>
            <div class="datepicker-container">
                <date-picker v-model="eventMetadata.mission_contact_person.departure_time" placeholder="Departure time" :config="dateTimeConfig"></date-picker>
            </div>

            ID link - SharePoint

            <input type="text" v-model="eventMetadata.sharepoint_link" placeholder="SharePoint Link" />

        </div>

    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { DATETIME_DISPLAY_FORMAT, SEVERITY, EVENT_TYPES, EVENT_STATUSES } from '@/common/common';

// import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import datePicker from 'vue-bootstrap-datetimepicker';
import 'pc-bootstrap4-datetimepicker';
// import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';

// import { EDIT_EVENT } from '@/store/actions.type';

/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/

export default {
    name: 'r-event-general',
    data(){
        return {
            editing: false,
            severityColors: SEVERITY.colors,
            severityLongTexts: SEVERITY.fullLabels,
            allEventTypes: EVENT_TYPES,
            statuses: EVENT_STATUSES,
            checkedTypes:[],
            checkedSubTypes: [],
            otherFields: {
                type: {
                    isSelected: false,
                    description: ''
                },
                disease_outbreak: {
                    isSelected: false,
                    description: ''
                },
                natural_disaster: {
                    isSelected: false,
                    description: ''
                }
            },
            dateTimeConfig: {
                format: DATETIME_DISPLAY_FORMAT
            }

        };
    },
    components:{
        //TODO: MAP goes here
        datePicker
    },
    computed: {
        ...mapGetters([
            'eventMetadata',
            'eventTypes',
            'eventCreatedAt'
        ])
    },
    methods: {
        edit(){
            this._beforeEditingCache = Object.assign({}, this.eventMetadata);
            this.editing = true;
        },
        cancelEdit(){
            Object.assign(this.eventMetadata, this._beforeEditingCache);
            this.editing = false;
            this._beforeEditingCache = null;
        },
        save(){

        }
    },
    watch: {
        eventMetadata(newVal){
            if(!newVal.areas){
                var mockArea = {country: newVal.metadata.country, region: ''};
                vm.eventMetadata.areas = [mockArea];
            }

            if(!newVal.severity_measures){
                var mockSeverity = {scale: newVal.severity_scale, description: newVal.security_details};
                vm.eventMetadata.severity_measures = [mockSeverity];
            }
        }
    }
    // beforeRouteEnter(to, from, next){
    //     // TODO: CAll map loads
    // }
};

</script>

<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
