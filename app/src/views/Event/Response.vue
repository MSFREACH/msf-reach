<template>
    <v-container class="eventSubContent statusToggle">
        <nav v-if="eventResponses && eventResponses.length> 0" class="statusTabWrapper">
            <v-btn flat small :class="item.status+'Tab statusTabs'" v-for="(item, index) in eventResponses" :key="index" @click="switchStatus(item)">{{item.status}}</v-btn>
        </nav>
        <div :class="editing ? 'edit-wrapper split-text-fields':'split-text-fields'" dark>
            <v-layout row wrap v-if="editing" dark>
                <div class="quarter-width">
                    <label>Project Code</label>
                    <input type="text" v-model="editResponse.project_code" placeholder="OCA-###" />
                </div>

                <div class="full-width" v-for="(program, index) in editResponse.type_of_programmes" :key="index">
                    <label>Type of programmes</label>
                    <v-flex>
                        <v-flex xs4 d-flex>
                            <v-select dark  v-model="program.value" :items="allProgrammes" ></v-select>
                        </v-flex>
                        <v-flex xs4 d-flex>
                            <v-select dark xs3 v-if="program.value == ('infectious_diseases' || 'ncds')"
                                v-model="program.subProgram"
                                :items="subProgrammes[program.value]">
                            </v-select>
                        </v-flex>
                        <v-slider dark xs4 v-model="program.deployment" :label="program.deployment.toString()" min="1" max="10"></v-slider>
                        <v-text-field xs12 v-model="program.notes" single-line label="specify" background-color="white"></v-text-field>
                    </v-flex>
                    <a class="form-actions" @click="addProgramRow()">Add</a>
                </div>
                <v-divider/>
                <div class="one-half">
                    <label>Response</label>
                    <v-flex d-flex>
                        <v-select dark :items="allResponseTypes" :v-model="editResponse.response.type"></v-select>
                    </v-flex>
                    <v-textarea solo label="description" v-model="editResponse.response.description" auto-grow background-color="white" color="secondary"></v-textarea>
                </div>

                <div class="one-half">
                    <div class="dateRange">
                        <v-flex xs4 class="start" d-flex>
                            <label>Start date</label>
                            <v-menu ref="startDateSelected" :close-on-content-click="false" v-model="startDateSelected" lazy transition="scale-transition" offset-y full-width width="290px">
                                <v-text-field slot="activator" v-model="editResponse.start_date" persistent-hint type="date"></v-text-field>
                                <v-date-picker v-model="editResponse.start_date" no-title @input="startDateSelected = false"></v-date-picker>
                            </v-menu>
                        </v-flex>
                        <v-spacer></v-spacer>
                        <v-flex xs4 class="end" d-flex>
                            <label>End date</label>
                            <v-menu ref="endDateSelected" :close-on-content-click="false" v-model="endDateSelected" lazy transition="scale-transition" offset-y full-width width="290px">
                                <v-text-field slot="activator" v-model="editResponse.end_date" persistent-hint type="date"></v-text-field>
                                <v-date-picker v-model="editResponse.end_date" no-title @input="endDateSelected = false"></v-date-picker>
                            </v-menu>
                        </v-flex>
                    </div>
                    <div>
                        <label> Location of MSF Response: </label>
                        <!-- map as input -->
                    </div>
                </div>
                <div class="one-half">
                    <label> Operational Center </label>
                    <v-radio v-for="oc in allOperationalCenters" :key="oc" :label="oc" :value="oc"></v-radio>
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

                <v-layout class="actions" v-if="displayResponse.status == activeResponse.status">
                    <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                    <span class="cancel" v-if="editing" @click="cancelEdit()"><v-icon>close</v-icon></span>
                </v-layout>
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
                                {{item.name | noUnderscore | capitalize }}
                                <b> {{item.deployment}} </b>
                                <span class="notes"> {{item.notes}} </span>
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
                            <span class="start"> <label>Start date</label> {{displayResponse.start_date | date}} </span>
                            <v-spacer></v-spacer>
                            <span class="end">  <label>End date</label>  {{displayResponse.end_date | date}} </span>
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
                    <v-btn fab dark>
                        <a :href='displayResponse.sharepoint_link' target="_blank">
                            <v-icon>link</v-icon>
                        </a>
                    </v-btn>
                </v-layout>
            </v-layout>
            <v-layout v-else>
                No response recorded yet
                <v-btn v-if="eventStatus == 'ongoing' || eventStatus == 'emergency'" @click="add"> add record </v-btn>
            </v-layout>
        </div>


        <!-- TODO:  Editing mode + * Analysis suggestions * component-->
    </v-container>
</template>

<script>

/*eslint no-debugger: off*/
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';
import { DEFAULT_EVENT_RESPONSE } from '@/common/form-fields';
import { RESPONSE_TYPES, REPONSE_PROGRAMME_TYPES, RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES, RESPONSE_NCDS_PROGRAMMES, SUPPLY_CHAIN_SPECIALITIES, OPERATIONAL_CENTERS } from '@/common/response-fields';

export default {
    name: 'r-event-response',
    data(){
        return {
            editing: false,
            editResponse: null,
            _beforeEditingCache: {},
            allProgrammes: REPONSE_PROGRAMME_TYPES,
            allResponseTypes: RESPONSE_TYPES,
            subProgrammes: {
                infectious_diseases: RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES,
                ncds: RESPONSE_NCDS_PROGRAMMES
            },
            allOperationalCenters: OPERATIONAL_CENTERS,
            allSupplyChains: SUPPLY_CHAIN_SPECIALITIES,
            defaultResponse: DEFAULT_EVENT_RESPONSE,
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
        edit(){
            this.editing = true;
            // Keep track of original
            this._beforeEditingCache = Object.assign({}, this.displayResponse);
            // Put object into editing mode
            this.editResponse = this.displayResponse;
        },
        cancelEdit(){
            // return fields back to its previous state
            Object.assign(this.displayResponse, this._beforeEditingCache);
            this.editResponse = this._beforeEditingCache = null;
        },
        save(){
            /// tricky to get the response field where status == active status
        },
        addProgramRow(){
            this.editResponse.type_of_programmes.push({
                name: '',
                value: null,
                deployment: 1,
                notes: ''
            });
        }
    },
    mounted(){

    },
    watch: {

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
