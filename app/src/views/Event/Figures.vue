<template>
    <v-container class="eventSubContent statusToggle">

        <nav v-if="eventFigures.keyFigures && eventFigures.keyFigures.length > 0" class="statusTabWrapper">
            <v-btn flat small :class="item.status.toLowerCase()+'-wrapper statusTabs'" v-for="(item, index) in eventFigures.keyFigures" :key="index" @click="switchStatus(item)">{{item.status}}</v-btn>
        </nav>
        <nav v-else class="statusTabWrapper">
            <v-btn flat small :class="eventStatus.toLowerCase()+'-wrapper statusTabs'">{{eventStatus}}</v-btn>
        </nav>

        <div :class="editing ? 'edit-wrapper  full-text-fields':' full-text-fields'" dark>

            <div v-if="eventFigures">
                <v-layout class="actions" v-if="allowEdit">
                    <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                    <span class="cancel" v-if="editing" @click="cancelEdit()"><v-icon>close</v-icon></span>
                </v-layout>
                <v-layout row wrap v-if="editing" dark>
                    <label>KEY FIGURES</label>
                    <div class="full-width" ref="key-figures">
                        <key-figures :activeKeyFigures="activeKeyFigures"></key-figures>
                    </div>
                    <hr class="row-divider">
                    <div class="one-half" ref="total-beneficiaries">
                        <label>NUMBER OF BENEFICIARIES </label>
                        {{totalBeneficiaries}}
                    </div>
                    <v-spacer></v-spacer>
                    <div class="one-half">
                        <label>NUMBER OF SERVICES PROVIDED </label>
                        {{totalServices}}
                    </div>
                    <hr class="row-divider">
                    <v-flex xs6>
                        <v-text-field label="Country Population" type="number" v-model="editFigures.population.total"></v-text-field>
                        <v-text-field label="Affected Population" type="number" v-model="editFigures.population.impacted"></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                    </v-flex>

                    <v-flex xs6>
                        <div class="one-third">
                            <label> MORTALITY Rate </label>
                            <v-text-field type="number" v-model="editFigures.population.mortality.rate"></v-text-field>
                        </div>
                        <div class="one-third">
                            <label> Population at risk </label>
                            <v-select v-model="editFigures.population.mortality.population" :items="allSelections.population"></v-select>
                            <v-text-field v-if="editFigures.population.mortality.population == 'other'" v-model="editFigures.population.mortality.population"></v-text-field>
                        </div>
                        <div class="one-third">
                            <label> Speficied Time period </label>
                            <v-select v-model="editFigures.population.mortality.period" :items="allSelections.period"></v-select>
                            <v-text-field v-if="editFigures.population.mortality.period == 'other'" v-model="editFigures.population.mortality.period"></v-text-field>
                        </div>
                    </v-flex>
                    <v-flex xs6>
                        <div class="one-third">
                            <label> MORBIDITY Rate </label>
                            <v-text-field type="number" v-model="editFigures.population.morbidity.rate"></v-text-field>
                        </div>
                        <div class="one-third">
                            <label> Population at risk </label>
                            <v-select v-model="editFigures.population.morbidity.population" :items="allSelections.population"></v-select>
                            <v-text-field v-if="editFigures.population.morbidity.population == 'other'" v-model="editFigures.population.morbidity.population"></v-text-field>
                        </div>
                        <div class="one-third">
                            <label> Speficied Time period </label>
                            <v-select v-model="editFigures.population.morbidity.period" :items="allSelections.period"></v-select>
                            <v-text-field v-if="editFigures.population.morbidity.period == 'other'" v-model="editFigures.population.morbidity.period"></v-text-field>
                        </div>
                    </v-flex>
                    <hr class="row-divider">
                    <v-flex xs8>
                        <v-select label="Collection" v-model="editFigures.statistics.collection" :items="allSelections.collectionMeans"></v-select>
                        <v-select label="Source" v-model="editFigures.statistics.source" :items="allSelections.sources"></v-select>
                        <v-text-field v-if="editFigures.statistics.source == 'other'" v-model="editFigures.statistics.source"></v-text-field>
                    </v-flex>
                </v-layout>
                <v-layout row wrap v-else>
                    <v-flex v-if="displayKeyFigures" ref="key-figures" xs12>
                        <v-flex xs4 ref="key-figures" v-for="(item, index) in displayKeyFigures.figures" :key="index">
                            <div class="specified-primary">
                                {{item.value}}
                            </div>
                            <div class="sub-category-text ml-2">
                                <div class="category-text"> {{item.category}} </div>
                                {{item.subCategory}}
                            </div>
                        </v-flex>
                    </v-flex>
                    <div class="full-width" v-else>
                        <div class="one-half" ref="key-figures">
                            <label>Key Figures</label>
                            --
                        </div>
                    </div>
                    <hr class="row-divider"/>
                    <v-flex xs12>
                        <div class="one-half" ref="total-beneficiaries">
                            <label>NUMBER OF BENEFICIARIES </label>
                            {{totalBeneficiaries}}
                        </div>
                        <div class="one-half">
                            <label>NUMBER OF SERVICES PROVIDED </label>
                            {{totalServices}}
                        </div>
                    </v-flex>
                    <hr class="row-divider"/>
                    <v-flex xs12 v-if="eventFigures">
                        <div class="quarter-width">
                            <label>COUNTRY POPULATION</label>
                            <span v-if="!eventFigures.population.total">--</span>{{eventFigures.population.total}}
                        </div>
                        <div class="quarter-width">
                            <label>IMPACTED POPULATION</label>
                            <span v-if="!eventFigures.population.impacted">--</span>{{eventFigures.population.impacted}}
                        </div>
                        <div class="quarter-width">
                            <label>MORTALITY</label>
                            <span v-if="!eventFigures.population.mortality.rate">--</span>{{eventFigures.population.mortality.rate}}
                        </div>
                        <div class="quarter-width">
                            <label>MORBIDITY</label>
                            <span v-if="!eventFigures.population.morbidity.rate">--</span>{{eventFigures.population.morbidity.rate}}
                        </div>
                    </v-flex>
                </v-layout>
            </div>
        </div>
    </v-container>
</template>

<script>
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
/*eslint no-console: off*/

import { mapGetters } from 'vuex';
import { EDIT_EVENT_FIGURES } from '@/store/actions.type';
import { UPDATE_EVENT_FIGURES } from '@/store/mutations.type';

import { DEFAULT_EVENT_FIGURES, DEFAULT_KEY_FIGURES } from '@/common/form-fields';
import { KEY_FIGURES, FIGURES_COLLECTION, FIGURES_SOURCES, POPULATION_RANGES, RISK_PERIOD } from '@/common/keyFigures-fields';
import KeyFigures from '@/components/RowEntries/KeyFigures.vue';



export default {
    name: 'r-event-figures',
    props: {
        reviewFields:{
            type: Array
        }
    },
    data(){
        return {
            editing: false,
            editMode:{
                offset: -1
            },
            _beforeEditingCache: {},
            editFigures: DEFAULT_EVENT_FIGURES,
            defaultFigures: DEFAULT_EVENT_FIGURES,
            allSelections: {
                keyFigs:KEY_FIGURES,
                collectionMeans: FIGURES_COLLECTION,
                sources: FIGURES_SOURCES,
                population: POPULATION_RANGES,
                period: RISK_PERIOD
            }
        };
    },
    components: {
        KeyFigures
    },
    mounted(){
        if(this.reviewFields) this.highlightReview();
    },
    methods: {
        highlightReview(isEdit){
            var vm = this;
            this.reviewFields.forEach(function(field){
                vm.$refs[field].style.background = isEdit ? 'rgba(255,255,255, .25)' : '#E5F0F9';
            });
        },
        removeHighlight(){
            var vm = this;
            this.reviewFields.forEach(function(field){
                vm.$refs[field].style.background = "none";
            })
        },
        switchStatus(keyFigures){
            this.displayKeyFigures = Object.assign({}, keyFigures);
        },

        save(){
            this.$store.commit(UPDATE_EVENT_FIGURES, this.editFigures);
            this.$store.dispatch(EDIT_EVENT_FIGURES).then((data) => {
            })
            this.editFigures = this._beforeEditingCache = _.clone(this.defaultFigures);
        },
        cancelEdit(){
            this.displayFigures = _.clone(this._beforeEditItemCache);
            this.editFigures = this._beforeEditingCache = _.clone(this.defaultFigures);
            this.editing = false;
        }
    },
    watch: {
        editing(val){
            if(val){
                var tmpObj = this.displayFigures ?  this.displayFigures : this.defaultFigures;
                this.editFigures = this._beforeEditingCache = _.clone(tmpObj);
            }else{
                this.save();
            }

            if(this.reviewFields){
                if(val) {
                    var vm = this;
                    setTimeout(function(){ vm.highlightReview(true)}, 500);
                }else{
                    this.removeHighlight();
                }
            }
        }
    },
    filters: {
    },
    computed: {
        ...mapGetters([
            'eventFigures',
            'eventStatus',
        ]),

        activeKeyFigures(){
            if(!this.eventFigures) return null;
            var result = this.eventFigures.keyFigures.filter(item =>{
                return item.status == this.eventStatus;
            });
            return result[0];
        },
        displayKeyFigures(){
            if(!_.isEmpty(this.activeKeyFigures)){
                return this.activeKeyFigures;
            }else{
                return null;
            }
        },
        allowEdit(){
            if(!_.isEmpty(this.displayKeyFigures)){
                return this.displayKeyFigures.status == this.activeKeyFigures.status;
            }else{
                return (this.eventStatus != 'monitoring') && (this.eventStatus !='complete');
            }
        },
        totalBeneficiaries(){
            if(!this.displayKeyFigures) return;
            return _.sumBy(this.displayKeyFigures.figures, 'value'); /// TODO: parseInt first on the values;
        },
        totalServices(){
            if(!this.displayKeyFigures) return;
            return this.displayKeyFigures.figures.length;
        }

    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
