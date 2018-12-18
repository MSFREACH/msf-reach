<template>
    <v-container class="eventSubContent statusToggle">
        <nav v-if="eventResources.perStatus && eventResources.perStatus.length> 0" class="statusTabWrapper">
            <v-btn flat small :class="item.status+'Tab statusTabs'" v-for="(item, index) in eventResources.perStatus" :key="index" @click="switchStatus(item)">{{item.status}}</v-btn>
        </nav>
        <div :class="editing ? 'edit-wrapper full-text-fields':'full-text-fields'" dark>
            <div v-if="eventResources">
                    <v-layout row wrap class="actions" v-if="allowEdit">
                        <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                        <span class="cancel" v-if="editing" @click="cancelEdit()">x</span>
                    </v-layout>

                    <v-layout row wrap v-if="editing" dark>
                        <v-text-field label="Staff List" v-model="editStatusResource.listFileUrl"></v-text-field>
                        <v-text-field label="Number of Expatriate" v-model="editStatusResource.expatriateCount"></v-text-field>
                        <v-text-field label="Number of National Staff" v-model="editStatusResource.nationalStaffCount"></v-text-field>

                        <v-flex xs12>
                            <div class="primary-text">Nationalities that requires Visa</div>
                            <v-autocomplete v-model="editResources.visa_requirement" :disabled="autoNationality.isUpdating" :items="allSelections.countries" box chips color="blue-grey lighten-2" label="Nationalities"
                            item-text="nationality" item-value="nationality" multiple>
                                <template slot="selection" slot-scope="data">
                                    <v-chip :selected="data.selected" close class="chip--select-multi" @input="removeNationality(data.item)">
                                        {{ data.item.nationality }}
                                    </v-chip>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs12>
                            <div class="primary-text">Health and vaccination requirements</div>

                            <v-text-field label="Required" v-model="editResources.vaccination_requirement.required"></v-text-field>
                            <v-autocomplete v-model="editResources.vaccination_requirement.required"
                                :disabled="autoVaccinationRequired.isUpdating"
                                :items="allSelections.vaccinations.required"
                                box chips label="Required" multiple>
                            </v-autocomplete>

                            <v-text-field label="Recommended" v-model="editResources.vaccination_requirement.recommended"></v-text-field>
                            <v-autocomplete v-model="editResources.vaccination_requirement.recommended"
                                :disabled="autoVaccinationRecommended.isUpdating"
                                :items="allSelections.vaccinations.recommended"
                                box chips label="Recommended" multiple>
                            </v-autocomplete>
                        </v-flex>
                        <v-text-field label="Total Budget" type="number" v-model="editStatusResource.budget.total"></v-text-field>
                        <v-select :items="allSelections.currencies" v-model="editStatusResource.budget.currency" item-text="currency" item-value="currency">
                        </v-select>

                        <v-text-field label="Institutional Donors" v-model="editResources.institutional_donors"></v-text-field>

                    </v-layout>
                    <v-layout v-else>
                        <v-flex xs12 :class="displayStatusResources.status+'Wrapper'">
                            <div class="full-width">
                                <label>Staff List</label>
                                <span v-if="!displayStatusResources.staff.listFileUrl">--</span> {{displayStatusResources.staff.listFileUrl}}
                            </div>
                            <div class="one-half">
                                <label>Number of Expatriate</label>
                                <span v-if="!displayStatusResources.staff.expatriateCount">--</span> {{displayStatusResources.staff.expatriateCount}}
                            </div>
                            <div class="one-half">
                                <label>Number of National staff</label>
                                <span v-if="!displayStatusResources.staff.nationalStaffCount">--</span> {{displayStatusResources.staff.nationalStaffCount}}
                            </div>
                        </v-flex>
                        <hr class="row-divider"/>
                        <div>
                            <div class="primary-text">Nationalities that requires Visa</div>
                            <label>Nationalities</label>
                            <span v-if="!eventResources.visa_requirement">--</span> {{eventResources.visa_requirement.toString()}}
                        </div>
                        <hr class="row-divider"/>
                        <div>
                            <div class="primary-text">Health and vaccination requirements</div>
                            <label>Required</label>
                            <span v-if="!eventResources.vaccination_requirement.required">--</span> {{eventResources.vaccination_requirement.required.toString()}}
                            <label>Recommended</label>
                            <span v-if="!eventResources.vaccination_requirement.recommended">--</span> {{eventResources.vaccination_requirement.recommended.toString()}}
                        </div>
                        <hr class="row-divider"/>


                        <v-flex xs12 :class="displayStatusResources.status+'Wrapper'">
                            <div class="one-half">
                                <label>Total Budget</label>
                                <span v-if="displayStatusResources.budget.total > 0">--</span> {{displayStatusResources.budget.total}} {{displayStatusResources.budget.currency}}
                            </div>
                            <div class="one-half">
                                <label>Institutional Donors</label>
                                <span v-if="eventResources.institutional_donors.length ==0">--</span>
                                <span v-else>{{eventResources.institutional_donors}} </span>
                            </div>
                        </v-flex>
                    </v-layout>

            </div>
            <div v-else>
                No resources recorded yet
            </div>
        </div>
    </v-container>

        <!-- TODO: * Analysis suggestions: contacts -->
    </div>
</template>

<!-- TODO: seee https://vuetifyjs.com/en/components/autocompletes for autocomplete examples -->


<script>
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';
import COUNTRIES from '@/common/countries.json';
import CURRENCIES from '@/common/currency-symbols.json';
import VACCINATION from '@/common/WHO_vaccinations.json';
export default {
    name: 'r-event-resources',
    data(){
        return {
            editing: false,
            _beforeEditingCache: {},
            _beforeEditPerStatusCache: {},
            editResources: {},
            editStatusResource: {},
            requiredNationalities: [],
            autoNationality:{
                autoUpdate: true,
                isUpdating: false
            },
            requireVaccinations: [],
            autoVaccinationRequired:{
                autoUpdate: true,
                isUpdating: false
            },
            recommendedVaccination: [],
            autoVaccinationRecommended:{
                autoUpdate: true,
                isUpdating: false
            },
            allSelections:{
                countries: COUNTRIES,
                currencies: CURRENCIES,
                vaccinations: VACCINATION
            }
        };
    },
    components: {
        //TODO: add + edit
    },
    methods: {
        switchStatus(statusResource){
            this.displayStatusResources = Object.assign({}, statusResource);
        },
        cancelEdit(){
            Object.assign(this.eventResources, this._beforeEditingCache);
            Object.assign(this.activeStatusResources, this._beforeEditPerStatusCache);

            this.editResources = this._beforeEditingCache = null;
            this.editStatusResource = this._beforeEditPerStatusCache = null;
        },
        save(){
            /// tricky to get the response field where status == active status
        },
        removeNationality (item) {
            const index = this.editResources.visa_requirement.indexOf(item.nationality);
            if (index >= 0) this.editResources.visa_requirement.splice(index, 1);
        }
    },
    watch: {
        editing(val){
            if(val){
                this._beforeEditingCache = this.editResources = this.eventResources;
                this._beforeEditPerStatusCache = this.editStatusResource = this.activeStatusResources;
            }
        },
        autoNationality(val){
            if(val.isUpdating){
                setTimeout(() => (this.autoNationality.isUpdating = false), 3000);
            }
        }
    },
    filters: {
    },
    computed: {
        ...mapGetters([
            'eventResources',
            'eventStatus'
        ]),

        activeStatusResources(){
            if(!this.eventResources) return null;
            var result = this.eventResources.perStatus.filter(item =>{
                return item.status == this.eventStatus;
            });
            return result[0];
        },
        displayStatusResources(){
            if(!_.isEmpty(this.activeStatusResources)){
                return this.activeStatusResources;
            }else{
                return null;
            }
        },
        allowEdit(){
            if(this.displayStatusResource){
                if(!_.isEmpty(this.displayStatusResources)){
                    return displayStatusResources.status == activeStatusResources.status;
                }else{
                    return (this.eventStatus != 'monitoring') && (this.eventStatus !='complete');
                }
            }
            return this.eventStatus != 'monitoring';
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
