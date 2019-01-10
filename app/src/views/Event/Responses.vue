<template>
    <v-container class="eventSubContent statusToggle responseContainer">
        <nav v-if="eventResponses && eventResponses.length> 0" class="statusTabWrapper">
            <v-btn flat small :class="item.status.toLowerCase()+'-wrapper statusTabs'" v-for="(item, index) in eventResponses" :key="index" @click="switchStatus(item)">{{item.status}}</v-btn>
        </nav>
        <nav v-else class="statusTabWrapper">
            <v-btn flat small :class="eventStatus+'-wrapper statusTabs'">{{eventStatus}}</v-btn>
        </nav>

        <div :class="editing ? 'edit-wrapper split-text-fields':'split-text-fields'" dark>
            <v-layout class="actions" v-if="displayResponse && (displayResponse.status == activeResponse.status)">
                <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                <span class="cancel" v-if="editing" @click="cancelEdit()"><v-icon>close</v-icon></span>
            </v-layout>
            <v-layout row wrap v-if="editing" dark>
                <div class="quarter-width row-spacing">
                    <label>Project Code</label>
                    <input type="text" v-model="editResponse.project_code" placeholder="OCA-###" />
                </div>
                <div class="full-width row-spacing">
                    <label>Type of programmes</label>
                    <v-flex v-for="(program, index) in editResponse.type_of_programmes" :key="index" @mouseover="editableIndex = index">
                        <div v-if="inEditProgrammeIndex < 0">
                                {{program.name}}
                                <b> {{program.scale}} </b> {{program.arrival_date}}
                                <span class="notes"> {{program.deployment}} </span>
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
                                    <v-menu ref="programArrivalDate" :close-on-content-click="false" v-model="programArrivalDate" lazy transition="scale-transition" offset-y full-width width="290px">
                                        <v-text-field slot="activator" v-model="program.arrival_date" persistent-hint type="date"></v-text-field>
                                        <v-date-picker v-model="program.arrival_date" no-title @input="programArrivalDate = false"></v-date-picker>
                                    </v-menu>
                                </div>
                                <v-slider class="one-half" xs6 dark v-model="program.scale" label="Deployment scale" min="1" max="10"></v-slider>
                            </div>
                            <v-textarea xs6 v-model="program.deployment" label="specify" solo></v-textarea>
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
                        <v-select dark :items="allResponseTypes" label="type" :v-model="editResponse.response.type"></v-select>
                    </v-flex>
                    <v-textarea solo label="description" v-model="editResponse.response.description" auto-grow background-color="white" color="secondary"></v-textarea>
                </div>

                <div class="one-half">
                    <div class="dateRange">
                        <span>
                            <label>Start date</label>
                            <v-menu ref="startDateSelected" :close-on-content-click="false" v-model="startDateSelected" lazy transition="scale-transition" offset-y full-width width="290px">
                                <v-text-field slot="activator" v-model="editResponse.start_date" persistent-hint type="date"></v-text-field>
                                <v-date-picker v-model="editResponse.start_date" no-title @input="startDateSelected = false"></v-date-picker>
                            </v-menu>
                        </span>
                        <span>
                            <label>End date</label>
                            <v-menu ref="endDateSelected" :close-on-content-click="false" v-model="endDateSelected" lazy transition="scale-transition" offset-y full-width width="290px">
                                <v-text-field slot="activator" v-model="editResponse.end_date" persistent-hint type="date"></v-text-field>
                                <v-date-picker v-model="editResponse.end_date" no-title @input="endDateSelected = false"></v-date-picker>
                            </v-menu>
                        </span>
                    </div>
                    <div>
                        <label> Location of MSF Response: </label>
                        <!-- map as input -->
                    </div>
                </div>
                <div class="one-half">
                    <label> Operational Center </label>
                    <v-radio-group v-model="editResponse.operational_center" :mandatory="true">
                        <v-radio v-for="oc in allOperationalCenters" :key="oc" :label="oc" :value="oc"></v-radio>
                    </v-radio-group>
                </div>
                <div class="one-half">
                    <label> Supply Chain Specificities </label>
                    <v-flex d-flex>
                        <v-select :items="allSupplyChains" v-model="editResponse.supply_chain.type"></v-select>
                    </v-flex>
                    <v-textarea solo label="description" v-model="editResponse.supply_chain.description" background-color="white" color="secondary"></v-textarea>
                </div>
                <v-text-field class="linkAttachment" xs12 v-model="editResponse.sharepoint_link" single-line prepend-icon="link" label="link" background-color="white"></v-text-field>
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
                        {{displayResponse.status}}
                    </div>
                    <div class="full-width">
                        <label>Type of programmes: </label>
                        <div v-if="item" v-for="item in displayResponse.type_of_programmes">
                                {{item.name}}
                                <b> {{item.scale}} </b>
                                <span class="notes"> {{item.deployment}} </span>
                        </div>
                    </div>

                    <hr class="row-divider"/>
                    <div class="one-half">
                        <label>Response</label>
                        {{displayResponse.response.type}} -
                        <span class="notes"> {{displayResponse.response.description}} </span>
                    </div>

                    <div class="one-half">
                        <div class="dateRange">
                            <span class="start"> <label>Start date</label> 2019 {{displayResponse.start_date | date}} </span>
                            <span class="end">  <label>End date</label>  13123898 {{displayResponse.end_date | date}} </span>
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


                    <div class="one-half">
                        <label>SUPPLY CHAIN SPECIFITIES</label>
                        {{displayResponse.supply_chain.type}} -
                        <span class="notes">  {{displayResponse.supply_chain.description}} </span>
                    </div>
                    <hr class="row-divider"/>
                    <v-btn fab flat small>
                        <a :href='displayResponse.sharepoint_link' target="_blank">
                            <v-icon>link</v-icon>
                        </a>
                    </v-btn>
                </v-layout>
            </v-layout>
            <v-layout v-else>
                No response recorded yet
                <v-btn v-if="eventStatus == 'ongoing' || eventStatus == 'intervention'" @click="add"> add response </v-btn>
            </v-layout>
        </div>


        <!-- TODO:  Editing mode + * Analysis suggestions * component-->
    </v-container>
</template>

<script>

/*eslint no-debugger: off*/
/*eslint no-console: off*/
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';
import { DEFAULT_EVENT_RESPONSE } from '@/common/form-fields';
import { RESPONSE_TYPES, REPONSE_PROGRAMME_TYPES,DEFAULT_RESPONSE_PROGRAMME,  RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES, RESPONSE_NCDS_PROGRAMMES, SUPPLY_CHAIN_SPECIALITIES, OPERATIONAL_CENTERS } from '@/common/response-fields';

export default {
    name: 'r-event-responses',
    data(){
        return {
            editing: false,
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
            allSupplyChains: SUPPLY_CHAIN_SPECIALITIES,
            defaultResponse: DEFAULT_EVENT_RESPONSE,
            programArrivalDate: false,
            startDateSelected: false,
            endDateSelected: false
        };
    },
    components: {
        //TODO: add + edit Response
    },
    methods:{
        switchStatus(response){
            this.displayResponse = Object.assign({}, response);
        },
        add(){
            this.editing = true;
            this.editResponse = this.defaultResponse;
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
        addProgram(){
            this.editResponse.type_of_programmes.push(this.defaultProgram);
            this.inEditProgrammeIndex = this.editResponse.type_of_programmes.length -1;
        },
        editProgramme(program, index){
            this._beforeEditingProgrammeCache = program;
            this.inEditProgrammeIndex = index;
            console.log(' ------ ', program, index);
        },
        deleteProgramme(index){
            this.editResponse.type_of_programmes.splice(index, 1);
        },
        submitProgramme(){
            this.inEditProgrammeIndex = -1;
            this._beforeEditingProgrammeCache = {};
        },
        cancelEditProgramme(index){
            this.editResponse.type_of_programmes[index] = this._beforeEditingProgrammeCache;
            this.inEditProgrammeIndex = -1;
        }
    },
    mounted(){

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
        }
    },
    computed: {
        ...mapGetters([
            'eventResponses',
            'eventStatus'
        ]),
        activeResponse(){
            if(!this.eventResponses) return null;

            var result = this.eventResponses.filter(item =>{
                return item.status == this.eventStatus;
            });
            return result[0];
        },
        displayResponse(){
            if(this.eventStatus == 'complete'){
                return this.eventResponses[this.eventResponses.length-1];
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
