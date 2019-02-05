<template>
    <v-container class="eventSubContent statusToggle responseContainer">
        <nav v-if="responses && responses.length> 0" class="statusTabWrapper">
            <v-btn flat small :class="item.event_status.toLowerCase()+'-wrapper statusTabs'" v-for="(item, index) in responses" :key="index" @click="switchStatus(item)">{{item.event_status}}</v-btn>
        </nav>
        <nav v-else class="statusTabWrapper">
            <v-btn flat small :class="eventStatus+'-wrapper statusTabs'">{{eventStatus}}</v-btn>
        </nav>

        <div :class="editing ? 'edit-wrapper split-text-fields':'split-text-fields'" dark>
            <v-layout class="actions" v-if="displayResponse && (displayResponse.event_status == activeResponse.event_status)">
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
                <div class="full-width row-spacing">
                    <label>Type of programmes</label>
                    <v-flex v-for="(program, index) in editResponse.programmes" :key="index" @mouseover="editableIndex = index">
                        <div v-if="inEditProgrammeIndex < 0">
                                {{program.name}}
                                <b> {{program.deployment_scale}} </b> {{program.open_date}}
                                <span class="notes"> {{program.notes}} </span>
                                <span v-show="editableIndex == index">
                                    <a @click="editProgramme(program, index)">edit</a>
                                    <a @click="deleteProgramme(index)">delete</a>
                                </span>
                        </div>
                        <v-layout row wrap v-else-if="inEditProgrammeIndex == index">
                            <div class="one-half">
                                <div class="full-width">
                                    <v-select class="one-half" v-model="program.value" label="type" :items="allProgrammes" clearable></v-select>
                                    <v-select class="one-half" label="sub-type" v-if="program.value == ('infectious_diseases' || 'ncds')"
                                        v-model="program.subProgram"
                                        :items="subProgrammes[program.value]">
                                    </v-select>
                                </div>
                                <div class="one-half">
                                    <label>arrival date</label>
                                    <v-menu ref="programOpenDate" :close-on-content-click="false" v-model="programOpenDate" lazy transition="scale-transition" offset-y full-width width="290px">
                                        <v-text-field slot="activator" v-model="program.open_date" persistent-hint type="date"></v-text-field>
                                        <v-date-picker v-model="program.open_date" no-title @input="programOpenDate = false"></v-date-picker>
                                    </v-menu>
                                </div>
                                <v-slider class="one-half" xs6 dark v-model="program.deployment_scale" label="Deployment scale" min="1" max="10"></v-slider>
                            </div>
                            <v-textarea xs6 v-model="program.notes" label="specify" solo></v-textarea>
                            <v-flex class="row-actions" xs12>
                                <a @click="submitProgramme()">confirm</a>
                                <a @click="cancelEditProgramme(index)">cancel</a>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <a v-if="!inEditProgrammeIndex" class="form-actions" @click="addProgram()">Add</a>
                </div>
                <hr class="row-divider"/>
                <div class="one-half">
                    <label>Response</label>
                    <v-flex d-flex>
                        <v-select dark :items="allResponseTypes" label="type" :v-model="editResponse.metadata.type"></v-select>
                    </v-flex>
                    <v-textarea solo label="description" v-model="editResponse.metadata.description" auto-grow background-color="white" color="secondary"></v-textarea>
                </div>

                <div class="one-half">
                    <div class="dateRange">
                        <div class="one-half">
                            <label>Start date</label>
                            <v-menu ref="startDateSelected" :close-on-content-click="false" v-model="startDateSelected" lazy transition="scale-transition" offset-y full-width>
                                <v-text-field slot="activator" v-model="editResponse.metadata.start_date" persistent-hint type="date"></v-text-field>
                                <v-date-picker v-model="editResponse.metadata.start_date" no-title @input="startDateSelected = false"></v-date-picker>
                            </v-menu>
                        </div>
                        <div class="one-half">
                            <label>End date</label>
                            <v-menu ref="endDateSelected" :close-on-content-click="false" v-model="endDateSelected" lazy transition="scale-transition" offset-y full-width>
                                <v-text-field slot="activator" v-model="editResponse.metadata.end_date" persistent-hint type="date"></v-text-field>
                                <v-date-picker v-model="editResponse.metadata.end_date" no-title @input="endDateSelected = false"></v-date-picker>
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
                        {{displayResponse.project_code}}
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
                            <span class="start"> <label>Start date</label> 2019 {{displayResponse.metadata.start_date | date}} </span>
                            <span class="end">  <label>End date</label>  13123898 {{displayResponse.metadata.end_date | date}} </span>
                        </div>
                        <div> <label> Location of MSF Response: </label>
                            {{displayResponse.location}}
                        </div>
                    </div>


                    <hr class="row-divider"/>
                    <div class="one-half">
                        <label>OPERATIONAL CENTRE</label>
                        {{displayResponse.operational_center}}
                    </div>

                    <hr class="row-divider"/>
                    <v-btn fab flat small>
                        <a :href='displayResponse.metadata.sharepoint_link' target="_blank">
                            <v-icon>link</v-icon>
                        </a>
                    </v-btn>
                </v-layout>
            </v-layout>
            <v-layout v-else>
                    No response recorded yet
                    <v-btn v-if="eventStatus.toLowerCase() == 'ongoing' || eventStatus.toLowerCase() == 'intervention'" @click="add" fab flat> <v-icon>add</v-icon> </v-btn>
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
            <map-annotation  mapId="generalAnnotation" :coordinates="eventCoordinates" :address="eventMetadata.areas[0]"></map-annotation>
        </div>
    </v-container>

</template>

<script>

/*eslint no-debugger: off*/
/*eslint no-console: off*/
import { mapGetters } from 'vuex';
import { FETCH_MSF_RESPONSES, CREATE_MSF_RESPONSE, EDIT_MSF_RESPONSE, EDIT_MSF_RESPONSE_AREA, DELETE_MSF_RESPONSE} from '@/store/actions.type';
import { DEFAULT_MSF_RESPONSE } from '@/common/form-fields';
import { RESPONSE_TYPES, REPONSE_PROGRAMME_TYPES, DEFAULT_RESPONSE_PROGRAMME,  RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES, RESPONSE_NCDS_PROGRAMMES,  OPERATIONAL_CENTERS } from '@/common/response-fields';
import MapAnnotation from '@/views/Map/MapAnnotation.vue';
import MapInput from '@/views/Map/MapInput.vue';


export default {
    name: 'r-event-responses',
    data(){
        return {
            editing: false,
            mapDialog: false,
            editableIndex: null,
            inEditProgrammeIndex: null,
            _beforeEditingProgrammeCache: {},
            editResponse: null,
            _beforeEditingCache: {},
            allProgrammes: REPONSE_PROGRAMME_TYPES,
            defaultProgram: DEFAULT_RESPONSE_PROGRAMME,
            allResponseTypes: RESPONSE_TYPES,
            subProgrammes: {
                infectious_diseases: RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES,
                ncds: RESPONSE_NCDS_PROGRAMMES
            },
            allOperationalCenters: OPERATIONAL_CENTERS,
            defaultResponse: DEFAULT_MSF_RESPONSE,
            programOpenDate: false,
            startDateSelected: false,
            endDateSelected: false
        };
    },
    components: {
        MapAnnotation, MapInput
    },
    methods:{
        fetchReponses(){
            this.$store.dispatch(FETCH_MSF_RESPONSES, {eventId: this.$route.params.slug})
        },
        switchStatus(response){
            this.displayResponse = Object.assign({}, response);
        },
        add(){
            this.editing = true;
            this.editResponse = this.defaultResponse;
        },
        openMap(){
            if(this.editing) this.mapDialog = true;
        },
        // edit(){
        //     this.editing = true;
        //     // Keep track of original
        //     this._beforeEditingCache = Object.assign({}, this.displayResponse);
        //     // Put object into editing mode
        //     this.editResponse = this.displayResponse;
        // },
        cancelEdit(){
            // return fields back to its previous state
            Object.assign(this.displayResponse, this._beforeEditingCache);
            this.editResponse = this._beforeEditingCache = null;
        },
        save(){
            /// tricky to get the response field where status == active status
        },
        saveArea(){
            console.log("saveArea ------ ", this.response.area);
            var params = {
                eventId: this.$route.params.slug,
                eventStatus: this.eventStatus,
                area : this.response.area
            };
            var emptyResponse = Object.values(this.editResponse).some(el => el == undefined);

            if(emptyResponse){
                this.$store.dispatch(CREATE_MSF_RESPONSE, params);
            }else{
                params.id = this.editResponse.id;
                this.$store.dispatch(EDIT_MSF_RESPONSE_AREA, params)
            }

        },
        addProgram(){
            this.editResponse.programmes.push(this.defaultProgram);
            this.inEditProgrammeIndex = this.editResponse.programmes.length -1;
        },
        editProgramme(program, index){
            this._beforeEditingProgrammeCache = program;
            this.inEditProgrammeIndex = index;
            console.log(' ------ ', program, index);
        },
        deleteProgramme(index){
            this.editResponse.programmes.splice(index, 1);
        },
        submitProgramme(){
            this.inEditProgrammeIndex = -1;
            this._beforeEditingProgrammeCache = {};
        },
        cancelEditProgramme(index){
            this.editResponse.programmes[index] = this._beforeEditingProgrammeCache;
            this.inEditProgrammeIndex = -1;
        }
    },
    mounted(){
        this.fetchReponses();
    },
    watch: {
        editing(val){
            if(val){
                if(this.displayResponse){
                    this._beforeEditingCache = Object.assign({}, this.displayResponse);
                    this.editResponse = this.displayResponse;
                }else{
                    this.editResponse = this.defaultResponse;
                }
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
        activeResponse(){
            if(!this.responses) return null;

            var result = this.responses.filter(item =>{
                return item.event_status == this.eventStatus;
            });
            return result[0];
        },
        displayResponse(){
            if(this.eventStatus == 'complete'){
                return this.responses[this.responses.length-1];
            }else if(!_.isEmpty(this.activeResponse)){
                return this.activeResponse;
            }else{
                return null;
            }
        },
        subProgramSelections(program){
            var result = this.allProgrammes.filter(item => {
                return item.value == program;
            });

            return result[0].subPrograms;
        }
    }
};

</script>

<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
