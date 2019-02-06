<template>
    <v-container class="eventSubContent statusToggle responseContainer">
        <nav class="statusTabWrapper">
            <v-btn flat small :class="item+'-wrapper statusTabs'" v-for="(item, index) in statusHistory" :key="index" @click="switchStatus(item)">{{item}}</v-btn>
        </nav>

        <div :class="editing ? 'edit-wrapper split-text-fields':'split-text-fields'" dark>
            <v-layout class="actions" v-if="allowEdit">
                <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                <span class="cancel" v-if="editing" @click="cancelEdit()"><v-icon>close</v-icon></span>
            </v-layout>
            <v-layout row wrap v-if="editing" dark>
                <div class="row-spacing">
                    <label>Project Code</label>
                    <div class="round-borders pc">
                        <v-select :items="allOperationalCenters" v-model="editResponse.operational_center" label="OC"></v-select>
                        <input type="text"  v-model="editResponse.project_code" placeholder="######" />
                    </div>
                </div>
                <response-programmes :currentProgrammes="editResponse.programmes"></response-programmes>
                <hr class="row-divider"/>
                <div class="one-half">
                    <label>Response</label>
                    <v-flex d-flex>
                        <v-select dark :items="allResponseTypes" label="type" v-model="editResponse.metadata.type"></v-select>
                    </v-flex>
                    <v-textarea solo label="description" v-model="editResponse.metadata.description" auto-grow background-color="white" color="secondary"></v-textarea>
                </div>

                <div class="one-half">
                    <div class="dateRange">
                        <div class="one-half">
                            <label>Start date</label>
                            <v-menu ref="startDateSelected" :close-on-content-click="false" v-model="selectedDate.start" lazy transition="scale-transition" offset-y full-width>
                                <v-text-field slot="activator" v-model="selectedDate.startValue" persistent-hint type="date"></v-text-field>
                                <v-date-picker v-model="selectedDate.startValue" no-title @input="selectedDate.start = false"></v-date-picker>
                            </v-menu>
                        </div>
                        <div class="one-half">
                            <label>End date</label>
                            <v-menu ref="endDateSelected" :close-on-content-click="false" v-model="selectedDate.end" lazy transition="scale-transition" offset-y full-width>
                                <v-text-field slot="activator" v-model="selectedDate.endValue" persistent-hint type="date"></v-text-field>
                                <v-date-picker v-model="selectedDate.endValue" no-title @input="selectedDate.end = false"></v-date-picker>
                            </v-menu>
                        </div>
                    </div>
                    <div>
                        <label> Location of MSF Response: </label>
                        <!-- map as input -->
                    </div>
                </div>

                <v-text-field class="linkAttachment round-borders" xs12 v-model="editResponse.metadata.sharepoint_link" single-line prepend-icon="link" label="Sharepoint link"></v-text-field>
            </v-layout>
            <v-layout v-else-if="displayResponse">
                <v-layout row wrap>
                    <div class="top-level primary-text">
                        <label>Project Code</label>
                        <v-select :items="activeResponses" v-model="selectedResponseId" item-text="project_code" item-value="id"></v-select>
                        <new-response></new-response>
                    </div>

                    <div class="one-third">
                        <label>updated</label>
                        {{displayResponse.updated | relativeTime}}
                    </div>
                    <div class="one-third">
                        <label>status</label>
                        {{displayResponse.event_status}}
                    </div>
                    <div class="full-width">
                        <label>Type of programmes: </label>
                        <div v-if="item" v-for="item in displayResponse.programmes">
                                {{item.name}}
                                <b> {{item.scale}} </b>
                                <span class="notes"> {{item.deployment_scale}} </span>
                        </div>
                    </div>

                    <hr class="row-divider"/>
                    <div class="one-half">
                        <label>Response</label>
                        {{displayResponse.metadata.type}} -
                        <span class="notes"> {{displayResponse.metadata.description}} </span>
                    </div>

                    <div class="one-half">
                        <div class="dateRange">
                            <span class="start"> <label>Start date</label> {{displayResponse.metadata.start_date | date}} </span>
                            <span class="end">  <label>End date</label> {{displayResponse.metadata.end_date | date}} </span>
                        </div>
                        <div> <label> Location of MSF Response: </label>
                            <!-- {{displayResponse.location}} -->
                        </div>
                    </div>

                    <hr class="row-divider"/>
                    <div class="one-half">
                        <label>OPERATIONAL CENTRE</label>
                        {{displayResponse.operational_center}}
                    </div>

                    <hr class="row-divider"/>
                    <v-btn fab flat small v-if="displayResponse.metadata">
                        <a :href='displayResponse.metadata.sharepoint_link' target="_blank">
                            <v-icon>link</v-icon>
                        </a>
                    </v-btn>
                </v-layout>
            </v-layout>
            <v-layout v-else>
                    No response recorded yet
                    <new-response></new-response>
            </v-layout>
        </div>


        <div :class="editing ? 'editable-map map-annotation' : 'map-annotation'" v-if="eventStatus.toLowerCase() == 'ongoing' || eventStatus.toLowerCase() == 'intervention'" @click="openMap">
            <v-layout row justify-center>
              <v-dialog v-model="mapDialog" max-width="880px">
                <v-card>
                    <map-input ref="responseMapEntry" :coordinates="eventCoordinates"></map-input>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click.native="saveArea()">Save Area</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-layout>
            <map-annotation  mapId="responsesAnnotation" :coordinates="eventCoordinates"></map-annotation>
        </div>
    </v-container>

</template>

<script>

/*eslint no-debugger: off*/
/*eslint no-console: off*/
import { mapGetters } from 'vuex';
import { FETCH_MSF_RESPONSES, CREATE_MSF_RESPONSE, EDIT_MSF_RESPONSE, EDIT_MSF_RESPONSE_AREA, DELETE_MSF_RESPONSE} from '@/store/actions.type';
import { DEFAULT_MSF_RESPONSE } from '@/common/form-fields';
import { RESPONSE_TYPES,  OPERATIONAL_CENTERS } from '@/common/response-fields';
import MapAnnotation from '@/views/Map/MapAnnotation.vue';
import MapInput from '@/views/Map/MapInput.vue';
import NewResponse from '@/views/New/NewResponse.vue';
import ResponseProgrammes from '@/components/RowEntries/ResponseProgrammes.vue';

import moment from 'moment';


export default {
    name: 'r-event-responses',
    data(){
        return {
            editing: false,
            mapDialog: false,
            editableIndex: null,
            selectedStatus: null,
            selectedResponseId: {},
            editResponse: null,
            _beforeEditingCache: {},
            allResponseTypes: RESPONSE_TYPES,
            allOperationalCenters: OPERATIONAL_CENTERS,
            defaultResponse: DEFAULT_MSF_RESPONSE,
            selectedDate:{
                start: false,
                startValue: null,
                end: false,
                endValue: null
            }
        };
    },
    components: {
        MapAnnotation, MapInput, NewResponse, ResponseProgrammes
    },
    methods:{
        fetchReponses(){
            this.$store.dispatch(FETCH_MSF_RESPONSES, {eventId: this.$route.params.slug})
        },
        switchStatus(status){
            this.selectedStatus = status;
        },
        openMap(){
            if(this.editing) this.mapDialog = true;
        },
        cancelEdit(){
            // return fields back to its previous state
            Object.assign(this.displayResponse, this._beforeEditingCache);
            this.editResponse = this._beforeEditingCache = null;
        },
        save(){
            if(this.displayResponse){
                delete this.editResponse.event_id;
                delete this.editResponse.event_status;
                this.$store.dispatch(EDIT_MSF_RESPONSE, this.editResponse);
            }
        },
        saveArea(){
            console.log("saveArea ------ ", this.response.area);
            var params = {
                event_id: this.$route.params.slug,
                event_status: this.eventStatus,
                area : this.response.area
            };
            var emptyResponse = Object.values(this.editResponse).some(el => el == undefined);

            if(emptyResponse){
                this.$store.dispatch(CREATE_MSF_RESPONSE, params);
            }else{
                params.id = this.editResponse.id;
                this.$store.dispatch(EDIT_MSF_RESPONSE_AREA, params)
            }

        }
    },
    mounted(){
        this.fetchReponses();
    },
    watch: {
        editing(val){
            if(val){
                this._beforeEditingCache = Object.assign({}, this.displayResponse);
                this.editResponse = this.displayResponse;
                this.selectedDate.startValue = moment(this.editResponse.metadata.start_date).format('YYYY-MM-DD');
                this.selectedDate.endValue = moment(this.editResponse.metadata.end_date).format('YYYY-MM-DD');
            }else{
                this.save();
            }
        },
        mapDialog(val){
            if(val){
                var vm = this;
                setTimeout(function(){
                    vm.$refs.responseMapEntry.resizeMap(); }, 100);
            }
        }
    },
    computed: {
        ...mapGetters([
            'responses',
            'response',
            'eventStatus',
            'eventMetadata',
            'eventCoordinates'
        ]),
        isResponseStatus(){
            var currentStatus = this.eventStatus.toLowerCase();
            return currentStatus == 'ongoing' || currentStatus == 'intervention';
        },
        allowEdit(){
            if(!this.displayResponse && this.isResponseStatus) return true;
            if(this.displayResponse && (this.displayResponse.event_status == this.eventStatus)) return true;
            return false;

        },
        activeResponses(){
            if(!this.responses) return null;
            var currentStatus = this.selectedStatus ? this.selectedStatus : this.eventStatus;

            return this.responses.filter(item => {
                return item.event_status == currentStatus;
            });
        },
        displayResponse(){
            if(!_.isEmpty(this.selectedResponseId)){
                var filtered = this.responses.filter(item =>{
                    return item.id == this.selectedResponseId;
                });
                return filtered[0];
            }else if(!_.isEmpty(this.activeResponses)){
                return this.activeResponses[0];
            }else{
                return null;
            }
        },

        statusHistory(){
            if(!this.responses) return [this.eventStatus];

            var statuses = this.responses.map(item => item.event_status);
            return _.sortedUniq(statuses);
        }
    }
};

</script>

<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
