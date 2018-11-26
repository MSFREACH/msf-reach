<template>
    <v-container class="eventSubContent">
        <div :class="editing ? 'edit-wrapper split-text-fields':'split-text-fields'">

            <div v-if="eventResponses && eventResponses.length> 0" class="actions">
                <nav>
                    <a class="statusTabs" v-for="(item, index) in eventResponses" :key="index" @click="switchStatus(item)">{{item.status}}</a>
                </nav>
            </div>
            <div v-else>
                No response recorded yet
                <v-btn v-if="eventStatus == 'ongoing' || eventStatus == 'emergency'" @click="add"> add record </v-btn>
            </div>
                <v-layout row wrap v-if="editing">
                    <div class="quarter-width">
                        <label>Project Code</label>
                        <input type="text" v-model="editResponse.project_code" placeholder="OCA-###" />
                    </div>

                    <div class="full-width">
                        <v-flex v-for="(program, index) in editResponse.type_of_programmes" :key="index">
                            <v-select v-model="program.value" :items="allProgrammes" ></v-select>
                            <!-- item-value="value" item-text="text" -->
                            <v-select v-if="program.subProgram"
                                v-model="program.subProgram"
                                :items="subProgramSelections(program.value)">
                            </v-select>
                            <v-slider v-model="program.deployment" :label="program.deployment"></v-slider>
                            <v-text-field v-model="program.notes" single-line label="specify"></v-text-field>
                        </v-flex>

                        <v-btn class="form-actions" @click="addProgramRow()">add</v-btn>
                    </div>


                    <hr class="row-divider"/>
                    <div class="one-half">
                        <label>Response</label>
                        <v-select :items="allResponseTypes" :v-model="editResponse.response.type"></v-select>
                        <v-textarea solo label="description" v-model="editResponse.response.description" auto-grow background-color="white" color="secondary"></v-textarea>
                    </div>

                    <div class="one-half">
                        <div class="dateRange">
                            <span class="start"> <label>Start date</label>
                                <!-- datepicker start_date -->
                                <v-menu ref="startDateSelected" :close-on-content-click="false" v-model="startDateSelected" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                    <v-text-field slot="activator" v-model="editResponse.start_date" label="Event Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" type="date"></v-text-field>
                                    <v-date-picker v-model="editResponse.start_date" no-title @input="startDateSelected = false"></v-date-picker>
                                </v-menu>
                            </span>
                            <v-spacer></v-spacer>
                            <span class="end">  <label>End date</label>
                                <!-- datepicker end_date -->
                                <v-menu ref="endDateSelected" :close-on-content-click="false" v-model="endDateSelected" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
                                    <v-text-field slot="activator" v-model="editResponse.end_date" label="Event Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" type="date"></v-text-field>
                                    <v-date-picker v-model="editResponse.end_date" no-title @input="endDateSelected = false"></v-date-picker>
                                </v-menu>
                            </span>
                        </div>
                        <div> <label> Location of MSF Response: </label>
                            <!-- map as input -->
                        </div>
                    </div>


                </v-layout>
                <v-layout v-else-if="displayResponse">

                    <v-layout class="actions" v-if="displayResponse.status == activeResponse.status">
                        <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                        <span class="cancel" v-if="editing" @click="cancelEdit()">x</span>
                    </v-layout>
                    <v-layout row wrap>
                        <div class="top-level primary-text">
                            <label>Project Code</label>
                            {{displayResponse.project_code}}
                        </div>
                        <div class="one-third">
                            <label>updated</label>
                            {{displayResponse.timestamp | relativeTime}}
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
        </div>


        <!-- TODO:  Editing mode + * Analysis suggestions * component-->
    </v-container>
</template>

<script>

/*eslint no-debugger: off*/
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';
import { DEFAULT_EVENT_RESPONSE } from '@/common/form-fields';
import { RESPONSE_TYPES, REPONSE_PROGRAMME_TYPES } from '@/common/response-fields';

export default {
    name: 'r-event-response',
    data(){
        return {
            editing: false,
            editResponse: null,
            _beforeEditingCache: {},
            allProgrammes: REPONSE_PROGRAMME_TYPES,
            allResponseTypes: RESPONSE_TYPES,
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
                deployment: null,
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
