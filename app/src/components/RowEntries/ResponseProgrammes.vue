<template>
    <div class="full-width row-spacing">
        <label class="mb-2">Type of programmes</label>
        <v-flex v-for="(program, index) in programmes" :key="index" @mouseover="editableIndex = index" @mouseleave="editableIndex = null" class="programme-rows">
            <div v-if="editIndex < 0">
                <div class="note-text">
                    <div class="secondary-text">{{program.value | removeSnakeCase}} </div><span v-if="program.sub_program" class="sub-category-text"> {{program.sub_program | removeSnakeCase}}</span>
                    <span class="specified-text"> {{program.notes}} </span>
                    <div> {{program.open_date}} | Deployment scale - {{program.deployment_scale}}</div>
                </div>
                <span class="form-actions right ml-5" v-show="editableIndex == index">
                    <a @click="editProgramme(program, index)">Edit</a><br/>
                    <a @click="deleteProgramme(index)">Delete</a>
                </span>
            </div>
            <v-layout row wrap v-else-if="editIndex == index">
                <v-flex xs7>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <v-select xs6 v-model="program.value" label="type" :items="allProgrammes"></v-select>
                            <v-select xs6 label="sub-type" v-if="(program.value == 'infectious_diseases' || program.value == 'ncds')"
                                v-model="program.sub_program"
                                :items="subProgrammes[program.value]">
                            </v-select>
                        </v-flex>
                        <v-flex xs6 class="content-block">
                            <label>Open date</label>
                            <v-menu ref="arrivalDate" :close-on-content-click="false" v-model="arrivalDate" lazy transition="scale-transition" offset-y full-width width="290px">
                                <v-text-field slot="activator" v-model="program.open_date" persistent-hint type="date"></v-text-field>
                                <v-date-picker v-model="program.open_date" no-title @input="arrivalDate = false"></v-date-picker>
                            </v-menu>
                        </v-flex>
                        <v-flex xs6 class="content-block scale-label">
                            <label>Deployment scale</label>
                            <v-slider v-model="program.deployment_scale" min="1" max="10" step="1"></v-slider>
                            <span v-text="program.deployment_scale"></span>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-textarea xs5 v-model="program.notes" placeholder="Specify..." solo></v-textarea>
                <v-flex class="row-actions" xs12>
                    <a @click="submitProgramme()">confirm</a>
                    <a @click="cancelEditProgramme(index)">cancel</a>
                </v-flex>
            </v-layout>
        </v-flex>
        <a v-if="editIndex < 0" class="form-actions" @click="addProgramme()">Add</a>
    </div>
</template>

<script>
/*eslint no-debugger: off*/
/*eslint no-console: off*/
import { REPONSE_PROGRAMME_TYPES, DEFAULT_RESPONSE_PROGRAMME,  RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES, RESPONSE_NCDS_PROGRAMMES } from '@/common/response-fields';
import { UPDATE_RESPONSE_PROGRAMMES } from '@/store/mutations.type';
export default {
    name: 'response-programmes',
    data(){
        return{
            programmes: [],
            editIndex: -1,
            editableIndex: null,
            _beforeEditingCache: {},
            arrivalDate: false,
            allProgrammes: REPONSE_PROGRAMME_TYPES,
            defaultProgram: DEFAULT_RESPONSE_PROGRAMME,
            subProgrammes: {
                infectious_diseases: RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES,
                ncds: RESPONSE_NCDS_PROGRAMMES
            },
        }
    },
    props: {
        currentProgrammes: {
            type: Array
        }
    },
    mounted(){

    },
    watch: {
        currentProgrammes(val){
            if(val) this.programmes = val;
        }
    },
    methods: {
        addProgramme(){
            this.programmes.push(this.defaultProgram);
            this.editIndex = this.programmes.length -1;
        },
        editProgramme(program, index){
            this._beforeEditingCache = program;
            this.editIndex = index;
        },
        deleteProgramme(index){
            this.programmes.splice(index, 1);
        },
        submitProgramme(){
            this.editIndex = -1;
            this._beforeEditingCache = {};
            this.$store.commit(UPDATE_RESPONSE_PROGRAMMES, {programmes: this.programmes})
        },
        cancelEditProgramme(index){
            if(_.isEmpty(this._beforeEditingCache)){
                this.programmes.splice(-1, 1);
            }else{
                this.programmes[index] = this._beforeEditingCache;
            }
            this.editIndex = -1;
        },
        subProgramSelections(program){
            var result = this.allProgrammes.filter(item => {
                return item.value == program;
            });

            return result[0].subPrograms;
        }
    }
}
</script>

<style lang="scss">
.v-select__selections{
    font-size: 14px;
}
.v-list__tile{
    font-size: 12px;
}
</style>
