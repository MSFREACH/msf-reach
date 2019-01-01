<template>
    <v-layout row justify-center>
        <v-dialog v-model="dialog" persistent max-width="1080px">
            <v-btn slot="activator" fab small flat dark color="grey darken-1">
                <v-icon> add </v-icon>
            </v-btn>
            <template>
              <v-stepper v-model="e1">
                <v-stepper-header flat>
                  <v-stepper-step editable :complete="e1 > 1" step="1">Geolocation</v-stepper-step>
                  <v-divider></v-divider>
                  <v-stepper-step editable :complete="e1 > 2" step="2">General</v-stepper-step>
                  <v-divider></v-divider>
                  <v-stepper-step editable step="3">Notification</v-stepper-step>
                  <!-- <v-spacer></v-spacer> -->
                  <v-icon class="action-link" @click="close">close</v-icon>
                </v-stepper-header>
                <v-stepper-items>
                  <v-stepper-content step="1">
                    <new-map-entry ref="mapEntry"></new-map-entry>
                    <v-btn color="primary" @click="e1 = 2"> Continue</v-btn>
                    <v-btn flat>Cancel</v-btn>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                      <v-card>
                          <v-card-text>
                              <v-container grid-list-md class="create-wrapper">

                                  <div class="one-half">
                                      <v-text-field label="Name" v-model="metadata.name" required></v-text-field>
                                  </div>
                                  <div class="quarter-width">
                                      <label>REACH Operator</label>
                                      <span> {{ operatorName }} </span>
                                  </div>
                                  <hr class="row-divider"/>
                                  <div class="top-align">
                                      <div class="one-third">
                                          <label> Type(s) </label>

                                          <v-flex v-for="(item, index) in metadata.types" :key="index"  @mouseover="editable.typeIndex = index" @mouseleave="editable.typeIndex = null">
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
                                              <v-text-field class="inverse" v-if="newType.type == 'other' || (subTypeSelect && newType.subtype == 'other') " placeholder="specify" v-model="newType.specify"></v-text-field>
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
                                          <v-select  v-model="metadata.event_status" :items="statuses"></v-select>
                                      </div>
                                      <div class="one-third">
                                          <label> Area(s) </label>
                                          <div v-if="inEditArea">
                                              <v-text-field v-if="inEditArea.address" v-model="inEditArea.address" disabled></v-text-field>
                                              <vue-google-autocomplete  v-else ref="address" id="areaMap" types="" classname="form-control" placeholder="Please type your address" v-on:placechanged="getAddressData"></vue-google-autocomplete>
                                              <label>Severity </label>
                                              <v-slider v-model="inEditArea.severity.scale" :tick-labels="severityLabels" :min="1" :max="3" step="1" ticks="always" tick-size="1" ></v-slider>
                                              <v-textarea label="analysis" v-model="inEditArea.severity.description"></v-textarea>
                                              <span class="row-actions">
                                                  <a @click="submitArea()">confirm</a>
                                                  <a @click="clearArea()">cancel</a>
                                              </span>
                                          </div>
                                          <div v-else-if="!inEditArea && metadata.areas" v-for="(area, index) in metadata.areas" class="tags" v-model="metadata.areas" @mouseover="editable.areaIndex = index" @mouseleave="editable.areaIndex = null">
                                              <span v-if="area.region"> {{area.region}}, {{area.country_code}} </span>
                                              <span v-else> {{area.country}} </span>

                                              <span class="severity-wrapper">
                                                  <span class="sub-tag" v-if="metadata.severity_measures && metadata.severity_measures[index]">
                                                      <span :class="allSeverity[metadata.severity_measures[index].scale-1].text + 'Severity'">{{ allSeverity[metadata.severity_measures[index].scale-1].text}} severity</span>
                                                      <span class="notes"><br/> {{ metadata.severity_measures[index].description }} </span>
                                                  </span>
                                              </span>

                                              <span class="row-actions" v-show="editable.areaIndex == index">
                                                  <a @click="editArea(area, metadata.severity_measures[index], index)">edit</a>
                                                  <a @click="deleteArea(index)">delete</a>
                                              </span>
                                          </div>

                                          <a v-if="!inEditArea" class="form-actions" @click="addArea()">Add area</a>
                                      </div>
                                  </div>
                                  <hr class="row-divider"/>
                                  <div class="top-align">
                                      <div class="one-third">
                                          <v-menu ref="dateSelected" :close-on-content-click="false" v-model="dateSelected" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                              <v-text-field slot="activator" v-model="eventDate" label="Event Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" type="date"></v-text-field>
                                              <v-date-picker v-model="eventDate" no-title @input="dateSelected = false"></v-date-picker>
                                          </v-menu>
                                      </div>
                                      <div class="one-third">
                                          <v-menu ref="menu" :close-on-content-click="false" v-model="timeSelected" :nudge-right="40" :return-value.sync="eventTime" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                              <v-text-field slot="activator" time v-model="eventTime" label="Local event time" prepend-icon="access_time" type="time"></v-text-field>
                                              <v-time-picker v-if="timeSelected" v-model="eventTime" event-color="black" color="grey lighten-1" format="24hr" @change="$refs.menu.save(eventTime)" ></v-time-picker>
                                          </v-menu>
                                      </div>
                                      <div class="one-third">
                                          <label> Mission Contact Person </label>
                                          <v-text-field label="Name" v-model="metadata.incharge_name" ></v-text-field>
                                          <v-text-field label="Position" v-model="metadata.incharge_position" ></v-text-field>
                                      </div>
                                  </div>
                                  <hr class="row-divider"/>
                                  <v-layout row wrap>
                                      <v-flex xs6 style="display: inline-block;">
                                      <label> Description </label>
                                          <v-textarea auto-grow id="eventDescription" v-model="metadata.description" placeholder="Event description"> </v-textarea>
                                      </v-flex>
                                      <v-flex xs6 style="display: inline-block;">
                                          <label>PREVIEW</label>
                                          <div class="markdown-fields" v-html="mdRender(metadata.description)"></div>
                                      </v-flex>
                                  </v-layout>
                                  <hr class="row-divider"/>

                                  <v-text-field clearable prepend-icon="link" label="SharePoint Link" v-model="metadata.sharepoint_link" round ></v-text-field>
                                  </v-text-field>
                              </v-container>
                          </v-card-text>
                          <v-progress-linear v-if="inProgress" :indeterminate="true"></v-progress-linear>
                          <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn round flat @click.native="save">Create</v-btn>
                          </v-card-actions>
                      </v-card>
                    <v-btn color="primary" @click="e1 = 3"> Continue</v-btn>
                    <v-btn flat>Cancel</v-btn>
                  </v-stepper-content>

                  <v-stepper-content step="3">
                    <v-card class="mb-5" color="grey lighten-1" height="200px"></v-card>
                    <v-btn color="primary" @click="e1 = 1"> Continue </v-btn>
                    <v-btn flat>Cancel</v-btn>
                  </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
            </template>

        </v-dialog>
    </v-layout>
</template>


<script>

/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
/*eslint no-console: off*/
import marked from 'marked';
import { mapGetters } from 'vuex';
import { EVENT_TYPES,
    DEFAULT_EVENT_TYPE,
    DISEASE_OUTBREAK_TYPES,
    NATURAL_DISASTER_TYPES,
    DEFAULT_EVENT_AREA,
    EVENT_STATUSES,
    SEVERITY,
    SEVERITY_LABELS } from '@/common/common';
import { DEFAULT_EVENT_METADATA } from '@/common/form-fields';
import { CREATE_EVENT } from '@/store/actions.type';
import VueGoogleAutocomplete from 'vue-google-autocomplete';
import NewMapEntry from '@/views/Map/NewEntry.vue';


export default {
    name: 'new-event',
    data: () => ({
        e1: 0,
        dialog: false,
        allSeverity: SEVERITY,
        allEventTypes: EVENT_TYPES,
        subTypes: {
            disease_outbreak: DISEASE_OUTBREAK_TYPES ,
            natural_disaster: NATURAL_DISASTER_TYPES
        },
        editable: {
            typeIndex:null,
            areaIndex: null,
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
        selectedStatus: null,

        eventDate: null,
        eventTime: null,
        dateSelected: false,
        timeSelected: false,

        metadata: DEFAULT_EVENT_METADATA,
        inProgress: false
    }),
    components:{
        NewMapEntry
    },
    computed:{
        ...mapGetters([
            'currentUser'
        ]),
        operatorName(){
            if(this.currentUser){
                return this.currentUser.username;
            }
            return '--';
        },
        subTypeSelect(){
            return this.newType.type == 'disease_outbreak' || this.newType.type == 'natural_disaster';
        }
    },
    watch:{
        dialog(val){
            if(val){
                var vm = this;
                setTimeout(function(){
                    vm.$refs.mapEntry.$refs.mapAnnotation.map.invalidateSize();
                }, 500);
            }
        }
    },
    methods:{
        mdRender(value){
            if(value) return marked(value);
        },
        deleteType(index){
            this.metadata.types.splice(index, 1);
        },
        addType(){
            this.newType = this.defaultType;
        },
        submitType(){
            var tmp = this.newType;
            if(this.subTypeSelect){
                tmp.subtype == 'other' ? this.metadata.types.push(tmp.specify) : this.metadata.types.push(tmp.subtype);
            }else{
                this.metadata.types.push(tmp.type);
            }
            this.clearType();
        },
        clearType(){
            for (var fields in this.newType) delete this.newType[fields];
            this.newType = null;
        },
        close(){
            this.dialog = false;
            for (var fields in this.metadata) delete this.metadata[fields];
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
        parseDate (date) {
            if (!date) return null;
            const [month, day, year] = date.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
};
</script>

<style lang="scss">
    @import '@/assets/css/form.scss';
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
