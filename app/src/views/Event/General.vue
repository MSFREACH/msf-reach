<template>
    <v-container class="eventSubContent" v-if="eventMetadata">
        <div :class="editing ? 'edit-wrapper general-text-fields':'general-text-fields'">
            <div class="actions">
                <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                <button v-if="!editing" @click="edit()">Edit</button>
                <div v-else>
                    <button @click="cancelEdit()">Cancel</button>
                    <button @click="save()"> Save </button>
                </div>
            </div>
             <v-layout row wrap v-if="!editing">
                <div class="top-level primary-text">
                    <div class="one-half">
                        <label>Name</label>
                        {{eventMetadata.name}}
                    </div>

                    <div class="quarter-width">
                        <label>Operator</label>
                        --
                    </div>
                </div>
                <!-- meta tags -->
                <div class="one-third">
                    <label>Type(s)</label>
                    <div v-for="type in eventTypes">{{ type | capitalize | noUnderscore }}</div>
                    <!-- TODO: add pairing icon + clickable taglink -->
                </div>
                <div class="one-third">
                    <label>Status</label>
                    <span :class="eventMetadata.event_status + ' event-status'"> {{eventMetadata.event_status || 'monitoring'}}  </span>
                </div>
                <div class="one-third">
                    <label>Areas</label>
                    <v-flex v-for="(area, index) in eventMetadata.areas" :key="index">
                        <div>
                            <span v-if="area.region.length > 0"> {{area.region}}, {{area.country_code}} </span>
                            <span v-else>{{area.country}}</span>
                        </div>

                        <span v-if="eventMetadata.areas.length > 1 && index < eventMetadata.areas.length">

                        </span>
                        <div class="sub-tag" v-if="eventMetadata.severity_measures[index]">
                            <span :style="'color:'+allSeverity[eventMetadata.severity_measures[index].scale-1].color">{{allSeverity[eventMetadata.severity_measures[index].scale-1].label}} severity</span>
                            <span class="notes"><br/> {{ eventMetadata.severity_measures[index].description }} </span>
                        </div>
                    </v-flex>
                </div>
                <hr class="row-divider"/>
                <!-- Temporal row -->

                <div class="one-third">
                    <label>Created at</label>
                    {{ eventCreatedAt | relativeTime }}
                </div>
                <div class="one-third">
                    <label>Last Updated</label>
                    {{ eventProperties.updated_at | relativeTime }}
                </div>
                <div class="one-third">
                    <label>Local Date/Time</label>
                    {{eventMetadata.event_local_time | fullDate }}
                </div>


                <hr class="row-divider"/>
                <div class="one-third">
                    <label>Description</label>
                    {{eventMetadata.description }}
                </div>
                <div class="one-third">
                    <label>Latest Notification</label>
                    {{eventMetadata.event_local_time | fullDate }}
                </div>
                <div class="one-third">
                    <label>Mission Contact Person</label>
                    <div> {{ eventMetadata.incharge_name+', '+eventMetadata.incharge_position }} </div>

                </div>

                <hr class="row-divider"/>
                <div>
                    <a :href='eventMetadata.sharepoint_link' target="_blank">
                        Sharepoint Link
                    </a>
                </div>
            </v-layout>
            <v-layout row wrap v-else>

                <div class="top-level primary-text">
                    <div class="one-half">
                        <label>Name</label>
                        <input type="text" v-model="eventMetadata.name" placeholder="name" />
                    </div>
                    <div class="quarter-width">
                        <label>Project Code</label>
                        <input type="text" v-model="eventProperties.project_code" placeholder="OCA-###" />
                    </div>
                    <div class="quarter-width">
                        <label>Operator</label>
                        <!-- TODO: dropdown selection form contact list -->
                        <input type="text" v-model="eventProperties.operator" placeholder="name-position" />
                    </div>
                </div>

                <!-- meta tags -->
                <div class="one-third">
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
                </div>
                <div class="one-third">
                    <label> Status </label>
                    <select v-model="eventMetadata.event_status">
                    <option disabled value="">Please select one</option>
                    <option v-for="item in statuses" :value="item.value">{{ item.text }}</option>
                    </select>
                </div>

                <div class="one-third" id="eventAreas">
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
                    <new-map-entry></new-map-entry>
                </div>

                <!-- <div id="eventMap" class="map-container">   TODO: insert MAP component -->


                <div class="not-editable">
                    <label> Event datetime  </label>
                    {{ eventCreatedAt | fullDate }}
                </div>

                <div>
                    <label> Description </label>
                    <textarea id="eventDescription" type="text" v-model="eventMetadata.description" placeholder="Event description"> </textarea>
                </div>

                <div>
                    <label>Local Date/Time </label>
                    <div class="datepicker-container">
                        <date-picker v-model="eventMetadata.event_local_time" :config="dateTimeConfig"></date-picker>
                    </div>
                </div>

                <div>
                    <label> Mission Contact Person  </label>
                    <input type="text" v-model="eventMetadata.incharge_position" placeholder="Position" />
                    <input type="text" v-model="eventMetadata.incharge_name" placeholder="Name" />
                </div>

                <label> ID link - SharePoint </label>
                <input type="text" v-model="eventMetadata.sharepoint_link" placeholder="SharePoint Link" />
            </v-layout>
        </div>

        <div class="map-annotation">
            <map-annotation :coordinates="eventCoordinates"></map-annotation>
        </div>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { DATETIME_DISPLAY_FORMAT, SEVERITY, EVENT_TYPES, EVENT_STATUSES } from '@/common/common';
import MapAnnotation from '@/views/Map/MapAnnotation.vue';
import NewMapEntry from '@/views/Map/NewEntry.vue';

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
            allSeverity: SEVERITY,
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
        datePicker, MapAnnotation, NewMapEntry
    },
    computed: {
        ...mapGetters([
            'eventMetadata',
            'eventTypes',
            'eventCreatedAt',
            'eventProperties',
            'eventCoordinates'
        ])
    },
    mounted (){
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
                var mockSeverity = {scale: newVal.severity_scale, description: newVal.severity};
                vm.eventMetadata.severity_measures = [mockSeverity];
            }
        }
    }
};

</script>

<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
