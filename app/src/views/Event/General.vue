<template>
    <v-container class="eventSubContent" v-if="eventMetadata">
        <div :class="editing ? 'edit-wrapper split-text-fields':'split-text-fields'">
            <div class="actions">
                <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                <span class="cancel" v-if="editing" @click="cancelEdit()"><v-icon>close</v-icon></span>
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
                <div class="one-half">
                  <div class="one-half">
                      <label>Type(s)</label>
                      <div v-for="type in eventTypes">{{ type | capitalize | noUnderscore }}</div>
                      <!-- TODO: add pairing icon + clickable taglink -->
                  </div>
                  <div class="one-half">
                      <label>Status</label>
                      <span :class="eventMetadata.event_status + ' event-status'"> {{eventMetadata.event_status || 'monitoring'}}  </span>
                  </div>
                </div>
                <div class="one-half">
                    <label>Areas</label>
                    <v-flex v-if="eventMetadata.areas" v-for="(area, index) in eventMetadata.areas" :key="index">
                        <span v-if="area.region"> {{area.region}}, {{area.country_code}} </span>
                        <span v-else>{{area.country}}</span>
                        <div class="sub-tag" v-if="eventMetadata.severity_measures && eventMetadata.severity_measures[index]">
                            <span :style="'color:'+allSeverity[eventMetadata.severity_measures[index].scale-1].color">{{allSeverity[eventMetadata.severity_measures[index].scale-1].label}} severity</span>
                            <span class="notes"><br/> {{ eventMetadata.severity_measures[index].description }} </span>
                        </div>
                    </v-flex>
                    <div v-if="!eventMetadata.severity_measures" class="sub-tag">
                        <span :style="'color:'+allSeverity[eventMetadata.severity_scale-1].color">{{allSeverity[eventMetadata.severity_scale-1].label}} severity</span>
                        <span class="notes"><br/> {{ eventMetadata.severity }} </span>
                    </div>
                </div>
                <hr class="row-divider"/>
                <!-- Temporal row -->

                <div class="one-third">
                    <label>OPEN DATE</label>
                    {{ eventCreatedAt | relativeTime }}
                </div>
                <div class="one-third">
                    <label>Local Date/Time</label>
                    {{eventMetadata.event_local_time | fullDate }}
                </div>
                <div class="one-third">
                    <label>Mission Contact Person</label>
                    <div v-if="eventMetadata.incharge_name"> {{ eventMetadata.incharge_name+', '+eventMetadata.incharge_position }} </div>
                    <div v-else> -- </div>
                </div>

                <hr class="row-divider"/>
                <div class="full-width">
                    <label>Description</label>
                    {{eventMetadata.description }}
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
                        <label>Operator</label>
                        {{ eventProperties.operator }}
                    </div>
                </div>

                <!-- meta tags -->
                <div class="one-third">
                    <label> Type(s) </label>

                    <v-flex v-for="(item, index) in eventTypes" :key="index"  @mouseover="editable.typeIndex = index">
                        <div>
                            {{item}}
                            <span class="row-actions" v-show="editable.typeIndex == index">
                                <a @click="deleteType(index)">delete</a>
                            </span>
                        </div>
                    </v-flex>
                    <div v-if="newType">
                        <v-flex>
                            <v-select class="one-half" v-model="newType.type" label="type" :items="allEventTypes"></v-select>
                            <v-select class="one-half" label="sub-type" v-if="subTypeSelect"
                                v-model="newType.subtype"
                                :items="subTypes[newType.type]">
                            </v-select>
                        </v-flex>
                        <v-text-field class="inverse" solo v-if="newType.type == 'other' || (subTypeSelect && newType.subtype == 'other') " placeholder="specify" v-model="newType.specify"></v-text-field>
                    </div>
                    <a v-if="!newType" class="form-actions" @click="addType()">Add type</a>
                    <div v-else>
                        <v-flex class="row-actions" xs12>
                            <a @click="submitType()">confirm</a>
                            <a @click="clearType()">cancel</a>
                        </v-flex>
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
                    <div v-if="newArea">
                        <vue-google-autocomplete  ref="address" id="areaMap" classname="form-control" placeholder="Please type your address" v-on:placechanged="getAddressData"></vue-google-autocomplete>
                        <label>Severity </label>
                        <v-slider v-model="newArea.severity.scale" :tick-labels="severityLabels" :max="2" step="1" ticks="always" tick-size="2" ></v-slider>
                        <v-textarea solo label="analysis" class="inverse" v-model="newArea.severity.description"></v-textarea>
                    </div>
                    <div v-else-if="!newArea && eventMetadata.areas" v-for="(area, index) in eventMetadata.areas" class="tags" v-model="eventMetadata.areas" @mouseover="editable.areaIndex = index">
                        <div v-if="area.region"> {{area.region}}, {{area.country_code}} </div>
                        <div v-else> {{area.country}} </div>

                        <!-- <span class="remove" @click="removeArea(area)"> x </span> -->
                        <div class="severity-wrapper">
                            <span class="label"> Severity analysis </span>
                            <span class="inputSeveritySlider"></span>
                            <!-- ####TODO **HEREHEREH !!! **** -->
                            <!-- <textarea v-model.trim="eventMetadata.severity_measures[index].description" placeholder="Severity description"></textarea> -->
                        </div>

                        <span class="row-actions" v-show="editable.areaIndex == index">
                            <a @click="editArea(area)">edit</a>
                            <a @click="deleteArea(index)">delete</a>
                        </span>
                    </div>
                    <a v-if="!newArea" class="form-actions" @click="addArea()">Add area</a>
                    <!-- <new-map-entry></new-map-entry> -->
                </div>

                <div class="not-editable">
                    <label> OPEN DATE  </label>
                    {{ eventCreatedAt | fullDate }}
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
                <div>
                    <label> Description </label>
                    <v-textarea solo id="eventDescription" v-model="eventMetadata.description" placeholder="Event description"> </v-textarea>
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
import { DATETIME_DISPLAY_FORMAT, SEVERITY, SEVERITY_LABELS, EVENT_TYPES, DEFAULT_EVENT_TYPE, DISEASE_OUTBREAK_TYPES, NATURAL_DISASTER_TYPES, DEFAULT_EVENT_AREA, EVENT_STATUSES } from '@/common/common';
import MapAnnotation from '@/views/Map/MapAnnotation.vue';
import NewMapEntry from '@/views/Map/NewEntry.vue';

// import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import datePicker from 'vue-bootstrap-datetimepicker';
import 'pc-bootstrap4-datetimepicker';
// import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';
import VueGoogleAutocomplete from 'vue-google-autocomplete';

// import { EDIT_EVENT } from '@/store/actions.type';

/*eslint no-console: off*/
/*eslint no-debugger: off*/

/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/

export default {
    name: 'r-event-general',
    data(){
        return {
            editing: false,
            allSeverity: SEVERITY,
            allEventTypes: EVENT_TYPES,
            subTypes: {
                disease_outbreak: DISEASE_OUTBREAK_TYPES ,
                natural_disaster: NATURAL_DISASTER_TYPES
            },
            editable: {
                typeIndex: null,
                areaIndex: null
            },
            newType: null,
            defaultType: DEFAULT_EVENT_TYPE,
            newArea: null,
            defaultArea: DEFAULT_EVENT_AREA,
            severityLabels: SEVERITY_LABELS,
            areaAutocomplete: {
                isLoading: false,
                items: [],
                model: null,
                search: null
            },
            statuses: EVENT_STATUSES,

            dateTimeConfig: {
                format: DATETIME_DISPLAY_FORMAT
            }

        };
    },
    components:{
        //TODO: MAP goes here
        datePicker, MapAnnotation, NewMapEntry, VueGoogleAutocomplete
    },
    computed: {
        ...mapGetters([
            'eventMetadata',
            'eventTypes',
            'eventCreatedAt',
            'eventProperties',
            'eventCoordinates'
        ]),
        subTypeSelect(){
            return this.newType.type == 'disease_outbreak' || this.newType.type == 'natural_disaster';
        }
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

        },
        addType(){
            this.newType = this.defaultType;
        },
        submitType(){
            // strip value & append to this.eventTypes
            var tmp = this.newType;
            if(this.subTypeSelect){
                tmp.subtype == 'other' ? this.eventTypes.push(tmp.specify) : this.eventTypes.push(tmp.subtype);
            }else{
                this.eventTypes.push(tmp.type);
            }
            this.clearType();
        },
        clearType(){
            for (var fields in this.newType) delete this.newType[fields];
            this.newType = null;
        },
        deleteType(index){
            this.eventTypes.splice(index, 1);
        },
        addArea(){
            this.newArea = this.defaultArea;
        },
        /**
        * When the location found
        * @param {Object} addressData Data of the found location
        * @param {Object} placeResultData PlaceResult object
        * @param {String} id Input container ID
        */
        getAddressData: function (addressData, placeResultData, id) {
            console.log('------- ', addressData, placeResultData);
            // addressData = {
            //     administrative_area_level_1: "Berlin"
            //     country: "Germany"
            //     latitude: 52.5379507
            //     locality: "Berlin"
            //     longitude: 13.395074499999964
            //     route: "Bernauer Straße" }
            this.address = addressData;
        }
    },
    watch: {
        eventMetadata(newVal){
            if(!newVal.areas){
                var mockArea = {country: newVal.metadata.country, region: ''};
                this.eventMetadata.areas = [mockArea];
            }
            if(!newVal.severity_measures){
                var mockSeverity = {scale: newVal.severity_scale, description: newVal.severity};
                this.eventMetadata.severity_measures = [mockSeverity];
            }
        }
    }
};

</script>

<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
