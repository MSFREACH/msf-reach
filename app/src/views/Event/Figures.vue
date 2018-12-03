<template>
    <v-container class="eventSubContent">
        <div :class="editing ? 'edit-wrapper split-text-fields':'split-text-fields'" dark>

            <div v-if="eventFigures">
                <div v-for="(item, index) in eventFigures.keyFigures">
                    <nav v-if="eventFigures.keyFigures && eventFigures.keyFigures.length> 0" class="actions">
                        <a class="statusTabs" v-for="(item, index) in eventFigures.keyFigures" :key="index" @click="switchStatus(item)">{{item.status}}</a>
                    </nav>
                </div>
                <v-layout class="actions" v-if="allowEdit">
                    <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                    <span class="cancel" v-if="editing" @click="cancelEdit()">x</span>
                </v-layout>
                <v-layout row wrap v-if="editing" dark>
                    <label>KEY FIGURES</label>
                    <v-data-iterator v-if="activeKeyFigures" :items="activeKeyFigures" content-tag="v-layout" row wrap>
                        <template slot="items" slot-scope="props">
                            <v-hover>
                                <v-flex xs12 :key="props.index"
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
                            <v-flex xs12 :key="props.index"
                                v-show="editMode.offset == props.index">
                                <v-select dark  v-model="editKeyFigure.category" :items="allSelections.keyFigs" ></v-select>
                                <v-select dark  v-model="editKeyFigure.subCategory" :items="allKeyFigSubSelection" ></v-select>
                                <v-text-field label="value" v-model="editKeyFigure.value"></v-text-field>
                                <a @click="confirmKeyFig(props.index)"> edit </a>
                                <a @click="cancelEditKeyFig(props.index)"> delete </a>
                            </v-flex>
                        </template>
                    </v-data-iterator>
                    <v-flex v-else> -- </v-flex>
                    <a v-if="editing && !editMode.offset" @click="addKeyFig()"> add </a>

                    <v-divider></v-divider>
                    <v-text-field label="Country Population" v-model="editFigures.population.total"></v-text-field>
                    <v-text-field label="Affected Population" v-model="editFigures.population.impacted"></v-text-field>

                    <v-flex>
                        <v-text-field label="MORTALITY" v-model="editFigures.population.mortality.rate"></v-text-field>
                        <v-select label="Population at risk" v-model="editFigures.population.mortality.population" :items="allSelections.population"></v-select>
                        <v-text-field v-if="editFigures.population.mortality.population == 'other'" v-model="editFigures.population.mortality.population"></v-text-field>
                        <v-select label="Speficied Time period" v-model="editFigures.population.mortality.peroid" :items="allSelections.period"></v-select>
                        <v-text-field v-if="editFigures.population.mortality.peroid == 'other'" v-model="editFigures.population.mortality.peroid"></v-text-field>

                    </v-flex>
                    <v-flex>
                        <v-text-field label="MORBIDITY" v-model="editFigures.population.morbidity.rate"></v-text-field>
                        <v-select label="Population at risk" v-model="editFigures.population.morbidity.population" :items="allSelections.population"></v-select>
                        <v-text-field v-if="editFigures.population.morbidity.population == 'other'" v-model="editFigures.population.morbidity.population"></v-text-field>
                        <v-select label="Speficied Time period" v-model="editFigures.population.morbidity.peroid" :items="allSelections.period"></v-select>
                        <v-text-field v-if="editFigures.population.morbidity.peroid == 'other'" v-model="editFigures.population.morbidity.peroid"></v-text-field>
                    </v-flex>
                    <v-select label="Collection" v-model="editFigures.satistics.collection" :items="allSelections.collectionMeans"></v-select>
                    <v-select label="Source" v-model="editFigures.satistics.source" :items="allSelections.sources"></v-select>
                    <v-text-field v-if="editFigures.satistics.source == 'other'" v-model="editFigures.satistics.source"></v-text-field>

                </v-layout>
                <v-layout v-else>
                    <v-layout v-if="displayKeyFigures">

                        <v-flex v-for="(item, index) in displayKeyFigures" :key="index">
                            <v-flex>
                                <div class="specified-primary"> {{item.value}}</div>
                            </v-flex>
                            <v-flex>
                                <div class="sub-category-text"> {{item.subCategory}} </div>
                                <div class="category-text"> {{item.category}} </div>
                            </v-flex>
                        </v-flex>

                        <div class="one-half">
                            <label>NUMBER OF BENEFICIARIES </label>
                            {{totalBeneficiaries}}
                        </div>
                        <div class="one-half">
                            <label>NUMBER OF SERVICES PROVIDED </label>
                            {{totalServices}}
                        </div>

                    </v-layout>
                    <v-layout v-else>
                        <v-flex xs12>
                            <div class="full-width"> No Key figures yet </div>
                        </v-flex>
                    </v-layout>
                    <v-divider></v-divider>
                    <v-layout>
                        <v-flex>
                            <label>COUNTRY POPULATION</label>
                            {{eventFigures.population.total}}
                        </v-flex>
                        <v-flex>
                            <label>IMPACTED POPULATION</label>
                            {{eventFigures.population.impacted}}
                        </v-flex>
                        <v-flex>
                            <label>MORTALITY</label>
                            {{eventFigures.population.mortality.rate}}
                        </v-flex>
                        <v-flex>
                            <label>MORBIDITY</label>
                            {{eventFigures.population.morbidity.rate}}
                        </v-flex>
                        <v-flex>
                            <label>COUNTRY POPULATION</label>
                            {{eventFigures.satistics.collection}}
                        </v-flex>
                        <v-flex>
                            <label>COUNTRY POPULATION</label>
                            {{eventFigures.satistics.source}}
                        </v-flex>
                    </v-layout>
                </v-layout>

            </div>
            <div v-else>
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
    data(){
        return {
            editing: false,
            editMode:{
                offset: -1
            },
            editKeyFigure: null,
            editFigures: null,
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
    methods: {
        switchStatus(keyFigures){
            this.displayKeyFigures = Object.assign({}, keyFigures);
        },
        addKeyFig(){
            var newKeyFig = this.defaulKeyFigure;
            this.displayKeyFigures.push(newKeyFig);
            this.editKeyFigure = Object.assign({}, newKeyFig);
            this.editMode.offset = this.displayKeyFigures.length - 1; // the latest one
        },
        editKeyFig(item, index){
            console.log(' editItem --- ', item, index);
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
                return displayKeyFigures.status == activeKeyFigures.status;
            }else{
                //TODO: POPULATION FIGURES CAN BE editted during Monitoring ...
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
