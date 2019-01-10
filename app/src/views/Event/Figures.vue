<template>
    <v-container class="eventSubContent statusToggle">

        <nav v-if="eventFigures.keyFigures && eventFigures.keyFigures.length > 0" class="statusTabWrapper">
            <v-btn flat small :class="item.status+'-wrapper statusTabs'" v-for="(item, index) in eventFigures.keyFigures" :key="index" @click="switchStatus(item)">{{item.status}}</v-btn>
        </nav>
        <nav v-else class="statusTabWrapper">
            <v-btn flat small :class="eventStatus+'-wrapper statusTabs'">{{eventStatus}}</v-btn>
        </nav>

        <div :class="editing ? 'edit-wrapper  full-text-fields':' full-text-fields'" dark>

            <div v-if="eventFigures">
                <v-layout class="actions" v-if="allowEdit">
                    <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                    <span class="cancel" v-if="editing" @click="cancelEdit()"><v-icon>close</v-icon></span>
                </v-layout>
                <v-layout row wrap v-if="editing" dark>
                    <label>KEY FIGURES</label>
                    <div class="full-width">
                        <v-layout row wrap v-if="activeKeyFigures" ref="key-figures">
                            <v-data-iterator  :items="activeKeyFigures" content-tag="v-layout" row wrap hide-actions>
                                <template slot="items" slot-scope="props">
                                    <v-hover>
                                        <v-flex xs4 :key="props.index"
                                            v-show="editMode.offset != props.index"
                                            slot-scope="{hover}">
                                            <v-list dense>
                                                <v-list-tile>
                                                    <v-list-tile-content class="category-text align-end">{{item.category}} </v-list-tile-content>
                                                    <v-list-tile-content class="sub-category-text"> {{item.subCategory}} </v-list-tile-content>
                                                    <v-list-tile-content> {{item.value}} </v-list-tile-content>
                                                    <v-list-tile-content v-if="editing" :class="hover ? 'showCrud' : 'hide'">
                                                        <a @click="editKeyFig(props.item, props.index)"> edit </a>
                                                        <a @click="deleteKeyFig(props.item)"> delete </a>
                                                    </v-list-tile-content>
                                                </v-list-tile>
                                            </v-list>
                                        </v-flex>
                                    </v-hover>
                                    <v-flex xs4 :key="props.index"
                                        v-show="editMode.offset == props.index">
                                        <v-select dark  v-model="editKeyFigure.category" :items="allSelections.keyFigs"></v-select>
                                        <v-select dark  v-model="editKeyFigure.subCategory" :items="allKeyFigSubSelection" ></v-select>
                                        <v-text-field label="value" v-model="editKeyFigure.value"></v-text-field>
                                        <a @click="confirmKeyFig(props.index)"> edit </a>
                                        <a @click="cancelEditKeyFig(props.index)"> delete </a>
                                    </v-flex>
                                </template>
                            </v-data-iterator>
                            <a v-if="editing && editMode.offset == -1" @click="addKeyFig()"> add </a>
                        </v-layout>
                        <div class="one-half" ref="key-figures" v-else>
                            <div> -- </div>
                            <a class="form-actions" @click="addKeyFig()"> add Key figures </a>
                        </div>
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
                    <v-flex xs3>
                        <v-text-field label="Country Population" type="number" v-model="editFigures.population.total"></v-text-field>
                    </v-flex>
                    <v-flex xs3>
                        <v-text-field label="Affected Population" type="number" v-model="editFigures.population.impacted"></v-text-field>
                    </v-flex>

                    <v-flex xs3>
                        <v-text-field type="number" label="MORTALITY Rate" v-model="editFigures.population.mortality.rate"></v-text-field>
                        <v-select label="Population at risk" v-model="editFigures.population.mortality.population" :items="allSelections.population"></v-select>
                        <v-text-field v-if="editFigures.population.mortality.population == 'other'" v-model="editFigures.population.mortality.population"></v-text-field>
                        <v-select label="Speficied Time period" v-model="editFigures.population.mortality.peroid" :items="allSelections.period"></v-select>
                        <v-text-field v-if="editFigures.population.mortality.peroid == 'other'" v-model="editFigures.population.mortality.peroid"></v-text-field>
                    </v-flex>
                    <v-flex xs3>
                        <v-text-field type="number" label="MORBIDITY Rate" v-model="editFigures.population.morbidity.rate"></v-text-field>
                        <v-select label="Population at risk" v-model="editFigures.population.morbidity.population" :items="allSelections.population"></v-select>
                        <v-text-field v-if="editFigures.population.morbidity.population == 'other'" v-model="editFigures.population.morbidity.population"></v-text-field>
                        <v-select label="Speficied Time period" v-model="editFigures.population.morbidity.peroid" :items="allSelections.period"></v-select>
                        <v-text-field v-if="editFigures.population.morbidity.peroid == 'other'" v-model="editFigures.population.morbidity.peroid"></v-text-field>
                    </v-flex>
                    <hr class="row-divider">
                    <v-flex xs8>
                        <v-select label="Collection" v-model="editFigures.satistics.collection" :items="allSelections.collectionMeans"></v-select>
                        <v-spacer></v-spacer>
                        <v-select label="Source" v-model="editFigures.satistics.source" :items="allSelections.sources"></v-select>
                        <v-text-field v-if="editFigures.satistics.source == 'other'" v-model="editFigures.satistics.source"></v-text-field>
                    </v-flex>
                </v-layout>
                <v-layout row wrap v-else>
                    <v-flex v-if="displayKeyFigures" ref="key-figures">
                        <div ref="key-figures" v-for="(item, index) in displayKeyFigures" :key="index">
                            <div class="specified-primary">
                                {{item.value}}
                            </div>
                            <div class="sub-category-text">
                                {{item.subCategory}}
                                <div class="category-text"> {{item.category}} </div>
                            </div>
                        </div>
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
// import { EDIT_EVENT } from '@/store/actions.type';
import { DEFAULT_EVENT_FIGURES, DEFAULT_KEY_FIGURES } from '@/common/form-fields';
import { KEY_FIGURES, FIGURES_COLLECTION, FIGURES_SOURCES, POPULATION_RANGES, RISK_PERIOD } from '@/common/keyFigures-fields';

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
            editKeyFigure: DEFAULT_KEY_FIGURES,
            editFigures: DEFAULT_EVENT_FIGURES,
            _beforeEditingCache: {},
            _beforeEditKeyFigCache: {},
            defaulKeyFigure: DEFAULT_KEY_FIGURES,
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
        //TODO: add + edit
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
        addKeyFig(){
            var newKeyFig = this.defaulKeyFigure;
            if(this.displayKeyFigures){
                this.displayKeyFigures.push(newKeyFig);
            }else{
                this.displayKeyFigures = [newKeyFig];
            }

            this.editKeyFigure = Object.assign({}, newKeyFig);
            this.editMode.offset = this.displayKeyFigures.length - 1; // the latest one
        },
        editKeyFig(item, index){
            // Keep track of original
            this.editKeyFigure = Object.assign({}, item);
            this.editMode.offset = index;
        },
        deleteKeyFig(item){
            const index = this.displayKeyFigures.indexOf(item);
            confirm('Are you sure you want to delete this item?') && this.displayKeyFigures.splice(index, 1);
        },
        confirmKeyFig(item){
            Object.assign(this.displayKeyFigures[index], this.editKeyFig);
            this.editKeyFig = this._beforeEditKeyFigCache = null;
            this.editMode.offset = -1;
        },
        cancelEditKeyFig(index){
            Object.assign(this.displayKeyFigures[index], this._beforeEditKeyFigCache);
            this.editKeyFig = this._beforeEditKeyFigCache = null;
            this.editMode.offset = -1;
        },

        addEventFigures(){
            this.editFigures = this.defaultFigures;
        },
        editEventFigures(){
            this._beforeEditingCache = Object.assign({}, this.displayFigures);
            this.editFigures = this.displayFigures;
        },
        cancelEdit(){
            // return fields back to its previous state
            Object.assign(this.displayFigures, this._beforeEditingCache);
            this.editFigures = this._beforeEditingCache = null;
        },
        save(){
            /// tricky to get the response field where status == active status
        }
    },
    watch: {
        editing(val){
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
            'eventStatus'
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
            // TODO calculate total value
            return 100;
        },
        totalServices(){
            // TODO calculate cases
            return 100;
        },
        allKeyFigSubSelection(){
            var selectedCategory = this.editKeyFigure.category;
            var results = this.allSelections.keyFigs.filter(item => {
                if(item.value == selectedCategory){
                    return item.options;
                }
            });
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
