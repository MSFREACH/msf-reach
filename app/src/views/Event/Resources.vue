<template>
    <v-container class="eventSubContent">
        <div :class="editing ? 'edit-wrapper split-text-fields':'split-text-fields'" dark>
            <div v-if="eventResources">
                    <div v-for="(item, index) in eventResources.perStatus">
                        <nav v-if="eventResources.perStatus.length> 0" class="actions">
                            <a :class="'statusTabs' + item.status" v-for="(item, index) in eventResources.perStatus" :key="index" @click="switchStatus(item)">{{item.status}}</a>
                        </nav>
                    </div>
                    <v-layout class="actions" v-if="allowEdit">
                        <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                        <span class="cancel" v-if="editing" @click="cancelEdit()">x</span>
                    </v-layout>

                    <v-layout row wrap v-if="editing" dark>
                        <label>Staff List</label>
                        <v-text-field label="value" v-model="editStatusResource.listFileUrl"></v-text-field>

                        <label>Number of Expatriate</label>
                        <v-text-field label="value" v-model="editStatusResource.expatriateCount"></v-text-field>
                        <label>Number of National Staff</label>
                        <v-text-field label="value" v-model="editStatusResource.nationalStaffCount"></v-text-field>


                        <label>Nationalities</label>
                        <v-text-field label="value" v-model="editResources.visa_requirement"></v-text-field>
                        <v-flex xs12>
                            <v-autocomplete v-model="editResources.visa_requirement" :disabled="autoNationality.isUpdating" :items="allSelections.countries" box chips color="blue-grey lighten-2" label="Select"
                            item-text="nationality" item-value="nationality" multiple>
                                <template slot="selection" slot-scope="data">
                                    <v-chip :selected="data.selected" close class="chip--select-multi" @input="removeNationality(data.item)">
                                        {{ data.item.nationality }}
                                    </v-chip>
                                </template>
                            </v-autocomplete>
                        </v-flex>

                        <label>Required</label>
                        <v-text-field label="value" v-model="editResources.vaccination_requirement.required"></v-text-field>
                        <label>Recommended</label>
                        <v-text-field label="value" v-model="editResources.vaccination_requirement.recommended"></v-text-field>

                        <label>Total Budget</label>
                        <v-text-field label="value" v-model="editStatusResource.budget.total"></v-text-field>
                        <v-select :items="allSelections.currencies" v-model="editStatusResource.budget.currency"></v-select>

                        <label>Institutional Donors</label>
                        <v-text-field label="value" v-model="editResources.institutional_donors"></v-text-field>

                    </v-layout>
                    <v-layout v-else>
                        <v-flex :class="displayStatusResources.status+'Wrapper'">
                            <div class="full-width">
                                <label>Staff List</label>
                                <span v-if="!displayStatusResources.staff.listFileUrl">--</span>{{displayStatusResources.staff.listFileUrl}}
                            </div>

                            <div class="one-half">
                                <label>Number of Expatriate</label>
                                <span v-if="!displayStatusResources.staff.expatriateCount">--</span>{{displayStatusResources.staff.expatriateCount}}
                            </div>

                            <div class="one-half">
                                <label>Number of National staff</label>
                                <span v-if="!displayStatusResources.staff.nationalStaffCount">--</span>{{displayStatusResources.staff.nationalStaffCount}}
                            </div>
                        </v-flex>
                        <div class="full-width">
                            <div class="primary-text">Nationalities that requires Visa</div>
                            <label>Nationalities</label>
                            <span v-if="!eventResources.visa_requirement">--</span> {{eventResources.visa_requirement.toString()}}
                        </div>

                        <div class="full-width">
                            <div class="primary-text">Health and vaccination requirements</div>
                            <label>Required</label>
                            <span v-if="!eventResources.vaccination_requirement.required">--</span> {{eventResources.vaccination_requirement.required.toString()}}
                            <label>Recommended</label>
                            <span v-if="!eventResources.vaccination_requirement.recommended">--</span> {{eventResources.vaccination_requirement.recommended.toString()}}
                        </div>
                        <v-flex :class="displayStatusResources.status+'Wrapper'">
                            <div class="one-half">
                                <label>Total Budget</label>
                                <span v-if="!displayStatusResources.budget.total">--</span>{{displayStatusResources.budget.total}} {{displayStatusResources.budget.currency}}
                            </div>

                            <div class="one-half">
                                <label>Institutional Donors</label>
                                <span v-if="!eventResources.institutional_donors">--</span>{{eventResources.institutional_donors}}
                            </div>
                        </v-flex>

                    </v-layout>

            </div>
            <div v-else>
                NO RECORD YET
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
                currencies: CURRENCIES
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
            const index = this.requiredNationalities.indexOf(item.nationality);
            if (index >= 0) this.requiredNationalities.splice(index, 1);
        }
    },
    watch: {
        editing(val){
            if(val) {
                Object.assign(this._beforeEditingCache, this.eventResources);
                Object.assign(this._beforeEditPerStatusCache, this.activeStatusResources);
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
            'eventResources'
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
            if(!_.isEmpty(this.displayStatusResources)){
                return displayStatusResources.status == activeStatusResources.status;
            }else{
                return (this.eventStatus != 'monitoring') && (this.eventStatus !='complete');
            }
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
