<template>
    <v-container class="eventSubContent">
        <div :class="editing ? 'edit-wrapper split-text-fields':'split-text-fields'" dark>

            <div v-if="eventFigures">
                <div v-for="(item, index) in eventFigures.keyFigures">
                    <nav v-if="eventFigures.keyFigures && eventFigures.keyFigures.length> 0" class="actions">
                        <a class="statusTabs" v-for="(item, index) in eventFigures.keyFigures" :key="index" @click="switchStatus(item)">{{item.status}}</a>
                    </nav>
                </div>

                <v-layout row wrap v-if="editing" dark>
                    <v-data-iterator v-if="displayKeyFigures" :items="displayKeyFigures" content-tag="v-layout" row wrap>
                        <v-flex slot="item" slot-scope="props" xs12>
                            <v-list dense>
                                <v-list-tile>
                                    <v-list-tile-content class="category-text align-end">{{item.category}} </v-list-tile-content>
                                    <v-list-tile-content class="sub-category-text"> {{item.subCategory}} </v-list-tile-content>
                                    <v-list-tile-content> {{item.value}} </v-list-tile-content>
                                </v-list-tile>
                            </v-list>
                        </v-flex>
                    </v-data-iterator>
                </v-layout>
                <v-layout v-else>
                    <v-layout v-if="displayKeyFigures">
                        <v-layout class="actions" v-if="displayKeyFigures.status == activeKeyFigures.status">
                            <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                            <span class="cancel" v-if="editing" @click="cancelEdit()">x</span>
                        </v-layout>

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
                        <div class="full-width"> No Key figures yet </div>
                    </v-layout>
                    <v-divider></v-divider>
                    <v-layout>
                        <v-flex xs3>
                            <label>COUNTRY POPULATION</label>
                            {{eventFigures.population.total}}
                        </v-flex>
                        <v-flex xs3>
                            <label>IMPACTED POPULATION</label>
                            {{eventFigures.population.impacted}}
                        </v-flex>
                        <v-flex xs3>
                            <label>MORTALITY</label>
                            {{eventFigures.population.mortality}}
                        </v-flex>
                        <v-flex xs3>
                            <label>MORBIDITY</label>
                            {{eventFigures.population.morbidity}}
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
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';
import { DEFAULT_EVENT_FIGURES } from '@/common/form-fields';

export default {
    name: 'r-event-figures',
    data(){
        return {
            editing: false,
            editFigures: null,
            _beforeEditingCache: {},
            defaultFigures: DEFAULT_EVENT_FIGURES
        };
    },
    components: {
        //TODO: add + edit
    },
    methods: {
        switchStatus(keyFigures){
            this.displayKeyFigures = Object.assign({}, keyFigures);
        },
        add(){
            this.editing = true;
            this.editFigures = this.defaultFigures;
        },
        edit(){
            this.editing = true;
            // Keep track of original
            this._beforeEditingCache = Object.assign({}, this.displayFigures);
            // Put object into editing mode
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
        totalBeneficiaries(){
            // TODO calculate total value
            return 100;
        },
        totalServices(){
            // TODO calculate cases
            return 100;
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
