<template>
    <v-container class="eventSubContent generalContainer" v-if="eventMetadata">
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
                            <span :class="allSeverity[eventMetadata.severity_measures[index].scale-1].text + 'Severity'">{{allSeverity[eventMetadata.severity_measures[index].scale-1].text}} severity</span>
                            <span class="notes"><br/> {{ eventMetadata.severity_measures[index].description }} </span>
                        </div>
                    </v-flex>
                    <div v-if="!eventMetadata.severity_measures" class="sub-tag">
                        <span :class="allSeverity[eventMetadata.severity_scale-1].text +'Severity'">{{allSeverity[eventMetadata.severity_scale-1].text}} severity</span>
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

                <sharepoint-link :link="eventMetadata.sharepoint_link"></sharepoint-link>
            </v-layout>
            <v-layout row wrap v-else>

                <div class="top-level primary-text">
                    <div class="one-half">
                        <label>Name</label>
                        <input class="full-width" type="text" v-model="eventMetadata.name" placeholder="name" />
                    </div>

                    <div class="quarter-width">
                        <label>REACH Operator</label>
                        {{ eventProperties.operator }}
                    </div>
                </div>

                <!-- meta tags -->
                <div class="one-third">
                    <label> Type(s) </label>

                    <v-flex v-for="(item, index) in eventTypes" :key="index"  @mouseover="editable.typeIndex = index" @mouseleave="editable.typeIndex = null">
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
                    <!-- <select v-model="eventMetadata.event_status">
                    <option disabled value="">Please select one</option>
                    <option v-for="item in statuses" :value="item.value">{{ item.text }}</option>
                    </select> -->
                    <v-select class="one-half" v-model="eventMetadata.event_status" label="status" :items="statuses" clearable>
                        <template slot="item" slot-scope="data">
                            <span :class="data.value">{{data.text}}</span>
                        </template>
                    </v-select>
                </div>

                <div class="one-third" id="eventAreas">
                    <label> Area(s) </label>
                    <div v-if="inEditArea">
                        <v-text-field v-if="inEditArea.address" v-model="inEditArea.address" disabled></v-text-field>
                        <vue-google-autocomplete  v-else ref="address" id="areaMap" types="" classname="form-control" placeholder="Please type your address" v-on:placechanged="getAddressData"></vue-google-autocomplete>
                        <label>Severity </label>
                        <v-slider v-model="inEditArea.severity.scale" :tick-labels="severityLabels" :min="1" :max="3" step="1" ticks="always" tick-size="1" ></v-slider>
                        <v-textarea solo label="analysis" class="inverse" v-model="inEditArea.severity.description"></v-textarea>
                        <span class="row-actions">
                            <a @click="submitArea()">confirm</a>
                            <a @click="clearArea()">cancel</a>
                        </span>
                    </div>
                    <div v-else-if="!inEditArea && eventMetadata.areas" v-for="(area, index) in eventMetadata.areas" class="tags" v-model="eventMetadata.areas" @mouseover="editable.areaIndex = index" @mouseleave="editable.areaIndex = null">
                        <span v-if="area.region"> {{area.region}}, {{area.country_code}} </span>
                        <span v-else> {{area.country}} </span>

                        <span class="severity-wrapper">
                            <span class="sub-tag" v-if="eventMetadata.severity_measures && eventMetadata.severity_measures[index]">
                                <span :class="allSeverity[eventMetadata.severity_measures[index].scale-1].text + 'Severity'">{{ allSeverity[eventMetadata.severity_measures[index].scale-1].text}} severity</span>
                                <span class="notes"><br/> {{ eventMetadata.severity_measures[index].description }} </span>
                            </span>
                        </span>

                        <span class="row-actions" v-show="editable.areaIndex == index">
                            <a @click="editArea(area, eventMetadata.severity_measures[index], index)">edit</a>
                            <a @click="deleteArea(index)">delete</a>
                        </span>
                    </div>

                    <a v-if="!inEditArea" class="form-actions" @click="addArea()">Add area</a>
                    <!-- <new-map-entry></new-map-entry> -->
                </div>
                <hr class="row-divider"/>
                <div class="not-editable one-third">
                    <label> OPEN DATE  </label>
                    {{ eventCreatedAt | fullDate }}
                </div>

                <div class="one-third">
                    <label>Local Date/Time </label>
                    <div class="datepicker-container">
                        <v-date-picker v-model="eventMetadata.event_local_time" :config="dateTimeConfig"></v-date-picker>
                        <!-- <v-menu ref="dateSelected" :close-on-content-click="false" v-model="dateSelected" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                            <v-text-field slot="activator" v-model="eventDate" label="Event Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" type="date"></v-text-field>
                            <v-date-picker v-model="eventDate" no-title @input="dateSelected = false"></v-date-picker>
                        </v-menu> -->
                    </div>
                </div>

                <div class="one-third">
                    <label> Mission Contact Person  </label>
                    <input type="text" v-model="eventMetadata.incharge_name" placeholder="Name" />
                    <input type="text" v-model="eventMetadata.incharge_position" placeholder="Position" />
                </div>
                <hr class="row-divider"/>
                <v-layout row wrap>
                    <v-flex xs6 style="display: inline-block;">
                    <label> Description </label>
                        <v-textarea solo auto-grow id="eventDescription" v-model="eventMetadata.description" placeholder="Event description"> </v-textarea>
                    </v-flex>
                    <v-flex xs6 style="display: inline-block;">
                        <label>PREVIEW</label>
                        <div class="markdown-fields" v-html="mdRender(eventMetadata.description)"></div>
                    </v-flex>
                </v-layout>
                <hr class="row-divider"/>

                <v-text-field clearable prepend-icon="link" label="SharePoint Link" v-model="eventMetadata.sharepoint_link" round ></v-text-field>
            </v-layout>
        </div>

        <div class="map-annotation">
            <map-annotation  mapId="generalAnnotation" :coordinates="eventCoordinates"></map-annotation>
        </div>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { DATETIME_DISPLAY_FORMAT,
    EVENT_TYPES,
    DEFAULT_EVENT_TYPE,
    DISEASE_OUTBREAK_TYPES,
    NATURAL_DISASTER_TYPES,
    DEFAULT_EVENT_AREA,
    EVENT_STATUSES,
    SEVERITY,
    SEVERITY_LABELS } from '@/common/common';
import MapAnnotation from '@/views/Map/MapAnnotation.vue';
import marked from 'marked';
import VueGoogleAutocomplete from 'vue-google-autocomplete';
import SharepointLink from '@/views/util/Sharepoint.vue';
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
            inEditArea: null,
            inEditAreaIndex: null,
            defaultArea: DEFAULT_EVENT_AREA,
            severityLabels: SEVERITY_LABELS,
            areaAutocomplete: {
                isLoading: false,
                items: [],
                model: null,
                search: null
            },
            addressAutocomplete: {},
            statuses: EVENT_STATUSES,
            dateTimeConfig: {
                format: DATETIME_DISPLAY_FORMAT
            }

        };
    },
    components:{
        //TODO: MAP goes here
        MapAnnotation, VueGoogleAutocomplete, SharepointLink
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
        mdRender(value){
            if(value) return marked(value);
        },
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
            this.inEditArea = this.defaultArea;
        },
        editArea(area, severity, index){
            console.log(' ------ ', area, severity);
            var tmpAddress = area.region ? `${area.region}, ${area.country_code}` : area.country;
            var tmpArea = { address: tmpAddress, severity };

            this.inEditArea = tmpArea;
            this.inEditAreaIndex = index;
        },
        submitArea(){
            var tmp = this.inEditArea;
            if(tmp.address){ // check if existing area obj
                this.eventMetadata.severity_measures[this.inEditAreaIndex] = tmp.severity;
                this.inEditAreaIndex = null;
            }else{
                this.eventMetadata.severity_measures.push(tmp.severity);
                this.eventMetadata.areas.push(this.addressAutocomplete); // double check this obj is useful for mapping [getAddressData]
            }
            this.clearArea();
        },
        clearArea(){
            for (var fields in this.inEditArea) delete this.inEditArea[fields];
            this.inEditArea = null;
            this.addressAutocomplete = null;
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
            this.addressAutocomplete = addressData;
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
