<template>
    <v-layout row>
        <markdown-panel class="createNewSidePanel" :elevation="210" v-if="showMarkdown && dialog && e1 == 2"></markdown-panel>
        <v-dialog v-model="dialog" persistent max-width="880px" hide-overlay>
            <v-btn slot="activator" fab small flat dark :size="40">
                <v-icon> add </v-icon>
            </v-btn>
            <template>
              <v-stepper v-model="e1" class="elevation-0">
                <v-stepper-header flat>
                  <v-stepper-step :complete="e1 > 1" step="1">Geolocation <small>map</small></v-stepper-step>
                  <v-divider></v-divider>
                  <v-stepper-step :complete="e1 > 2" step="2">General <small>metadata</small></v-stepper-step>
                  <v-spacer></v-spacer>
                  <v-icon class="action-link" @click="close">close</v-icon>
                </v-stepper-header>
                <v-stepper-items>
                  <v-stepper-content step="1">
                    <map-input ref="mapEntry"></map-input>
                    <v-btn class="right" flat @click="e1 = 2"> Continue</v-btn>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                      <v-container grid-list-md class="create-wrapper">

                          <div class="one-half">
                              <v-text-field label="Event Name" v-model="metadata.name" required></v-text-field>
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
                                  <v-select  v-model="selectedStatus" :items="statuses">
                                      <template slot="selection" slot-scope="data">
                                          <span :class="data.item.value">{{data.item.text}}</span>
                                      </template>
                                      <template slot="item" slot-scope="data">
                                          <span :class="data.item.value">{{data.item.text}}</span>
                                      </template>
                                  </v-select>
                              </div>
                              <div class="one-third">
                                  <label> Area(s) </label>
                                  <div v-if="metadata.areas" v-for="(area, index) in metadata.areas" class="tags" v-model="metadata.areas">
                                      <span v-if="area.region"> {{area.region}}, {{area.country}}</span>

                                      <span class="severity-wrapper">
                                          <span class="sub-tag" v-if="metadata.severity_measures && metadata.severity_measures[index]">
                                              <span :class="allSeverity[metadata.severity_measures[index].scale-1].text + 'Severity'">{{ allSeverity[metadata.severity_measures[index].scale-1].text}} severity</span>
                                              <span class="notes"><br/> {{ metadata.severity_measures[index].description }} </span>
                                          </span>
                                      </span>
                                  </div>
                                  <a @click="e1 = 1" class="form-actions">edit area</a>
                              </div>
                          </div>
                          <hr class="row-divider"/>
                          <div class="top-align">
                              <div class="one-third">
                                  <v-menu ref="dateSelected" :close-on-content-click="false" v-model="dateSelected" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                      <v-text-field slot="activator" v-model="eventDate" label="Event Date" hint="MM/DD/YYYY format" persistent-hint type="date"></v-text-field>
                                      <v-date-picker v-model="eventDate" no-title @input="dateSelected = false"></v-date-picker>
                                  </v-menu>
                              </div>
                              <div class="one-third">
                                  <v-menu ref="menu" :close-on-content-click="false" v-model="timeSelected" :nudge-right="40" :return-value.sync="eventTime" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                      <v-text-field slot="activator" time v-model="eventTime" label="Local event time" type="time"></v-text-field>
                                      <v-time-picker v-if="timeSelected" v-model="eventTime" event-color="black" color="grey lighten-1" format="24hr" @change="$refs.menu.save(eventTime)" ></v-time-picker>
                                  </v-menu>
                              </div>
                              <div class="one-third">
                                  <label> Mission Contact Person </label>

                                  <v-text-field label="Name" v-if="metadata.incharge_contact" v-model="metadata.incharge_contact.local.name" ></v-text-field>
                                  <v-text-field label="Position" v-if="metadata.incharge_contact" v-model="metadata.incharge_contact.local.position" ></v-text-field>
                              </div>
                          </div>
                          <hr class="row-divider"/>
                          <v-layout row wrap>
                              <v-flex xs6 style="display: inline-block;">
                              <label> Description </label>
                                  <v-textarea auto-grow id="eventDescription" v-model="metadata.description" placeholder="* supports markdown text formatting"> </v-textarea>
                              </v-flex>
                              <v-flex xs6 style="display: inline-block;">
                                  <label>PREVIEW</label>
                                  <div class="markdown-fields" v-html="mdRender(metadata.description)"></div>
                              </v-flex>
                          </v-layout>
                          <v-btn class='mb-2' color="grey lighten" small flat @click="showMarkdown = !showMarkdown"><v-icon>short_text</v-icon> markdown syntax guide</v-btn>
                          <hr class="row-divider"/>
                          <v-text-field class="sharepoint-input" clearable prepend-icon="link" label="SharePoint Link" v-model="metadata.sharepoint_link" round ></v-text-field>
                          </v-text-field>
                      </v-container>
                      <span class="right">
                          <v-progress-circular v-if="inProgress" :indeterminate="true"></v-progress-circular>
                          <v-btn round flat @click.native="save">Create</v-btn>
                      </span>
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
import MapInput from '@/views/Map/MapInput.vue';
// import MarkDownExplain from '@/views/util/MarkdownExplain.vue'
import MarkdownPanel from '@/views/util/MarkdownPanel.vue'

export default {
    name: 'new-event',
    data: () => ({
        e1: 0,
        dialog: false,
        showMarkdown: false,
        allSeverity: SEVERITY,
        allEventTypes: EVENT_TYPES,
        subTypes: {
            disease_outbreak: DISEASE_OUTBREAK_TYPES,
            natural_disaster: NATURAL_DISASTER_TYPES
        },
        editable: {
            typeIndex:null
        },
        newType: null,
        defaultType: DEFAULT_EVENT_TYPE,
        severityLabels: SEVERITY_LABELS,
        statuses: EVENT_STATUSES,
        selectedStatus: null,
        eventDate: null,
        eventTime: null,
        dateSelected: false,
        timeSelected: false,
        defaultMetadata: DEFAULT_EVENT_METADATA,
        metadata: DEFAULT_EVENT_METADATA,
        inProgress: false,
        toggle_format: [0, 1]
    }),
    components:{
        MapInput, MarkdownPanel
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
                    vm.$refs.mapEntry.resizeMap(); }, 100);
                this.e1 = 1;
                this.metadata = this.defaultMetadata;
            }else{
                this.showMarkdown = false;
            }
        },
        e1(val){
            if(val == 2){
                var address = this.$refs.mapEntry.addressData;
                var semanticAddress = _(address).omit(_.isUndefined).omit(_.isNull).value();
                delete semanticAddress.latitude;
                delete semanticAddress.longitude;
                semanticAddress["region"] = semanticAddress.administrative_area_level_1 ? [semanticAddress.locality, semanticAddress.administrative_area_level_1].join(',') : semanticAddress.locality;
                this.metadata.areas = [semanticAddress];
                this.extractAddress();
            }
        }
    },
    methods:{
        mdRender(value){
            if(value) return marked(value);
        },
        extractAddress(){
            console.log(this.address);
        },
        deleteType(index){
            this.metadata.types.splice(index, 1);
        },
        addType(){
            this.newType = this.defaultType;
        },
        addSyntax(type){
            var selection = window.getSelection();
        },
        submitType(){
            var tmp = this.newType;
            if(this.subTypeSelect){
                tmp.subtype == 'other' ? this.metadata.types.push(tmp.specify) : this.metadata.types.push(tmp.subtype);
            }else if(tmp.type == 'other'){
                 this.metadata.types.push(tmp.specify);
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
            for (var fields in this.metadata) delete this.metadata[fields];
            this.metadata = _.cloneDeep(this.defaultMetadata);
            this.dialog = false;
            this.clearType();
        },
        save(){
            var address = this.$refs.mapEntry.addressData;
            this.lintDateTime();
            this.lintStatus();
            this.metadata.types = _.compact(this.metadata.types);
            this.metadata.incharge_contact.operator.name = this.currentUser.username;
            this.inProgress = true;
            // TODO: replace geoJSON with map input
            var timestamp = new Date();
            var ISOTime = timestamp.toISOString();
            var payload = {
                location:{
                    lat: address.latitude,
                    lng: address.longitude
                },
                created_at: ISOTime,
                type: this.metadata.types.join(','),
                status: 'active',
                metadata: this.metadata
            };
            var vm = this;
            this.$store.dispatch(CREATE_EVENT, payload)
                .then((payload) =>{
                    var eventID = payload.data.result.objects.output.geometries[0].properties.id;
                    this.inProgress = false;
                    this.$router.push({
                        name: 'event-general',
                        params: { slug: eventID, firstTime: true }
                    });
                    setTimeout(() => vm.close(), 1000);
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
            this.metadata.status_updates = [{type: this.selectedStatus, timestamp: ISOTime}];
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
    .v-stepper__header{
        box-shadow: none;
        border-bottom: 1px solid lightgray;
    }
    .v-expansion-panel{
        box-shadow: none;
    }
    .createNewSidePanel{
        position: fixed;
        top: 0 !important;
        height: 100vh !important;
        background: #fff;
        width: 100% !important;
        z-index: 300 !important;
        div{
            display: inline-block !important;
        }

    }
    .listHeader .v-toolbar__content div{

    }

</style>
