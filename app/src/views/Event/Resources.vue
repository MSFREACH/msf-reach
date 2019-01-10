<template>
    <v-container class="eventSubContent statusToggle">
        <nav v-if="eventResources.perStatus && eventResources.perStatus.length> 0" class="statusTabWrapper">
            <v-btn flat small :class="item.status.toLowerCase()+'-wrapper statusTabs'" v-for="(item, index) in eventResources.perStatus" :key="index" @click="switchStatus(item)">{{item.status}}</v-btn>
        </nav>
        <div :class="editing ? 'edit-wrapper full-text-fields':'full-text-fields'" dark>
            <div v-if="eventResources">
                    <v-layout row wrap class="actions" v-if="allowEdit">
                        <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                        <span class="cancel" v-if="editing" @click="cancelEdit()"><v-icon>close</v-icon></span>
                    </v-layout>

                    <v-layout row wrap v-if="editing" dark>
                        <v-flex xs8 ref="staff-list">
                            <v-text-field label="Staff List" v-model="editStatusResource.listFileUrl"></v-text-field>
                        </v-flex>
                        <v-flex xs4></v-flex>
                        <v-flex xs3 ref="expatriates">
                            <v-text-field class="no-border" label="Number of Expatriate" v-model="editStatusResource.expatriateCount"></v-text-field>
                        </v-flex>
                        <v-spacer></v-spacer>
                        <v-flex xs3 ref="national-staff">
                            <v-text-field class="no-border" label="Number of National Staff" v-model="editStatusResource.nationalStaffCount"></v-text-field>
                        </v-flex>
                        <v-flex xs4></v-flex>
                        <hr class="row-divider"/>
                        <div ref="visa-requirements">
                            <div class="primary-text">Nationalities that requires Visa</div>
                            <v-autocomplete class="autocomplete-fields" v-model="editResources.visa_requirement" :disabled="autoNationality.isUpdating" :items="allSelections.countries" box chips cache-items color="blue-grey lighten-2" label="Nationalities"
                            item-text="nationality" item-value="nationality" multiple>
                                <template slot="selection" slot-scope="data">
                                    <v-chip :selected="data.selected" close class="chip--select-multi" @input="removeNationality(data.item)">
                                        {{ data.item.nationality }}
                                    </v-chip>
                                </template>
                            </v-autocomplete>
                        </div>

                        <hr class="row-divider"/>
                        <div ref="vaccination-requirements">
                            <div class="primary-text">Health and vaccination requirements</div>
                            <!-- <v-text-field label="Required" v-model="editResources.vaccination_requirement.required"></v-text-field> -->
                            <v-autocomplete  class="autocomplete-fields" v-model="editResources.vaccination_requirement.required"
                                :disabled="autoVaccinationRequired.isUpdating"
                                :items="allSelections.vaccinations.required"
                                box cache-items label="Required" multiple>
                                <template slot="selection" slot-scope="data">
                                    <v-chip :selected="data.selected" close @input="removeVaccinRequired(data.item)">
                                        {{ data.item.text }}
                                    </v-chip>
                                </template>
                            </v-autocomplete>

                            <!-- <v-text-field label="Recommended" v-model="editResources.vaccination_requirement.recommended"></v-text-field> -->
                            <v-autocomplete class="autocomplete-fields" v-model="editResources.vaccination_requirement.recommended"
                                :disabled="autoVaccinationRecommended.isUpdating"
                                :items="allSelections.vaccinations.recommended"
                                box cache-items label="Recommended" multiple>
                                <template slot="selection" slot-scope="data">
                                    <v-chip :selected="data.selected" close @input="removeVaccinRequired(data.item)">
                                        {{ data.item.text }}
                                    </v-chip>
                                </template>
                            </v-autocomplete>
                        </div>
                        <hr class="row-divider"/>
                        <v-text-field ref="total-budget" label="Total Budget" type="number" v-model="editStatusResource.budget.total"></v-text-field>
                        <v-select :items="allSelections.currencies" v-model="editStatusResource.budget.currency" item-text="currency" item-value="currency">
                        </v-select>

                        <v-text-field ref="institutional-donors" label="Institutional Donors" v-model="editResources.institutional_donors"></v-text-field>

                    </v-layout>
                    <v-layout row wrap v-else>
                        <v-flex xs12 :class="displayStatusResources.status+'Wrapper'">
                            <div class="full-width" ref="staff-list">
                                <label>Staff List</label>
                                <span v-if="!displayStatusResources.staff.listFileUrl">--</span> {{displayStatusResources.staff.listFileUrl}}
                            </div>
                            <div class="one-half" ref="expatriates">
                                <label>Number of Expatriate</label>
                                <span v-if="!displayStatusResources.staff.expatriateCount">--</span> {{displayStatusResources.staff.expatriateCount}}
                            </div>
                            <div class="one-half" ref="national-staff">
                                <label>Number of National staff</label>
                                <span v-if="!displayStatusResources.staff.nationalStaffCount">--</span> {{displayStatusResources.staff.nationalStaffCount}}
                            </div>
                        </v-flex>
                        <hr class="row-divider"/>
                        <div ref="visa-requirements">
                            <div class="primary-text">Nationalities that requires Visa</div>
                            <label>Nationalities</label>
                            <span v-if="!eventResources.visa_requirement">--</span> {{eventResources.visa_requirement.toString()}}
                        </div>
                        <hr class="row-divider"/>
                        <div ref="vaccination-requirements">
                            <div class="primary-text">Health and vaccination requirements</div>
                            <label>Required</label>
                            <span v-if="!eventResources.vaccination_requirement.required">--</span> {{eventResources.vaccination_requirement.required.toString()}}
                            <label>Recommended</label>
                            <span v-if="!eventResources.vaccination_requirement.recommended">--</span> {{eventResources.vaccination_requirement.recommended.toString()}}
                        </div>
                        <hr class="row-divider"/>


                        <v-flex xs12 :class="displayStatusResources.status+'Wrapper'">
                            <div class="one-half" ref="total-budget">
                                <label>Total Budget</label>
                                <span v-if="displayStatusResources.budget.total">
                                    {{displayStatusResources.budget.total.amount}} {{displayStatusResources.budget.currency}} - {{displayStatusResources.budget.total.from_who}}
                                </span>
                                <span v-else> -- </span>
                            </div>
                            <div class="one-half" ref="institutional-donors">
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
    props: {
        reviewFields:{
            type: Array
        }
    },
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
    mounted(){
        if(this.reviewFields) this.highlightReview();
    },
    methods: {
        highlightReview(isEdit){
            var vm = this;
            this.reviewFields.forEach(function(field){
                console.log('review fields under resources ----- ', field);
                vm.$refs[field].style.background = isEdit ? 'rgba(255,255,255, .25)' : '#E5F0F9';
            });
        },
        removeHighlight(){
            var vm = this;
            this.reviewFields.forEach(function(field){
                vm.$refs[field].style.background = "none";
            })
        },
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
        },
        removeVaccinRequired (item) {
            const index = this.editResources.vaccination_requirement.required.indexOf(item.value);
            if (index >= 0) this.editResources.vaccination_requirement.required.splice(index, 1);
        },
        removeVaccinRec (item) {
            const index = this.editResources.vaccination_requirement.recommended.indexOf(item.nationality);
            if (index >= 0) this.editResources.vaccination_requirement.recommended.splice(index, 1);
        }
    },
    watch: {
        editing(val){
            if(val){
                this._beforeEditingCache = this.editResources = this.eventResources;
                this._beforeEditPerStatusCache = this.editStatusResource = this.activeStatusResources;
            }

            if(this.reviewFields){
                var vm = this;
                if(val) {
                    setTimeout(function(){ vm.highlightReview(true)}, 500);
                }else{
                    setTimeout(function(){ vm.removeHighlight()}, 500);
                }
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
