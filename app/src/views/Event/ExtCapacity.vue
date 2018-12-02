<template>
    <v-container class="eventSubContent">
        <div :class="editing ? 'edit-wrapper full-text-fields':'full-text-fields'">
            <div v-if="eventExtCapacity">
                <div class="actions">
                    <v-switch :label="editing ? `save` : `edit`" v-model="editing"></v-switch>
                    <span class="cancel" v-if="editing" @click="cancelEdit()">x</span>
                </div>
                <div class="primary-text">External capacity Analysis</div>
                <v-data-table :headers="headers" :items="displayCapacities" :dark="editing" item-key="arrivalDate" hide-actions>
                    <template slot="items" slot-scope="props">
                        <v-hover>
                            <tr :key="props.index"
                                v-show="editMode.offset != props.index"
                                slot-scope="{ hover }">
                                <td><span v-if="!props.item.name"> -- </span> {{ props.item.name }}</td>
                                <td><span v-if="!props.item.arrival_date"> -- </span>{{ props.item.arrival_date }}</td>
                                <td><span v-if="!props.item.deployment"> -- </span>{{ props.item.deployment}}</td>
                                <td class="justify-center layout px-0" v-if="editing" :class="hover ? 'showCrud' : 'hide'">
                                    <a @click="editItem(props.item, props.index)"> edit </a>
                                    <a @click="deleteItem(props.item)"> delete </a>
                                </td>
                            </tr>
                        </v-hover>
                        <tr :key="props.index"
                            v-show="editMode.offset == props.index">
                            <td><v-text-field v-model="editedItem.name" label="name"></v-text-field></td>
                            <td>
                                <v-menu ref="editMode.dateSelected" :close-on-content-click="false" v-model="editMode.dateSelected" lazy transition="scale-transition" offset-y full-width width="290px">
                                    <v-text-field slot="activator" v-model="editedItem.arrival_date" persistent-hint type="date"></v-text-field>
                                    <v-date-picker v-model="editedItem.arrival_date" no-title @input="editMode.dateSelected = false"></v-date-picker>
                                </v-menu>
                            </td>
                            <td><v-textarea solo label="description" v-model="editedItem.deployment" background-color="white" color="secondary"></v-textarea></td>
                        </tr>
                    </template>

                    <template slot="no-data">
                        No external capacities at the moment
                    </template>
                </v-data-table>
                <a v-if="editing" @click="addItem()">add</a>

            </div>
            <div v-else>
                Not available
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
import { DEFAULT_EXT_CAPACITY_HEADERS } from '@/common/common';
import { EXTERNAL_CAPACITY_FIELDS } from '@/common/form-fields';

export default {
    name: 'r-event-extCapacity',
    data(){
        return {
            editing: false,
            editMode:{
                offset: -1,
                dateSelected: false
            },
            editedItem: EXTERNAL_CAPACITY_FIELDS,
            defaultItem: EXTERNAL_CAPACITY_FIELDS,
            headers: DEFAULT_EXT_CAPACITY_HEADERS
        };
    },
    components: {
        //TODO: add + edit
    },
    watch: {
    },
    filters: {
    },
    computed: {
        ...mapGetters([
            'eventExtCapacity'
        ]),
        displayCapacities(){
            return this.eventExtCapacity.sort(function(a, b){
                return b.arrival_date - a.arrival_date;
            });
        }
        // displayGovCapacity(){
        //     return this.eventExtCapacity.filter(item =>{
        //         return item.type == 'governmental';
        //     }).sort(function(a, b){
        //         return b.arrival_date - a.arrival_date;
        //     });
        // },
        // displayNGOCapacity(){
        //     return this.eventExtCapacity.filter(item =>{
        //         return item.type == 'other';
        //     }).sort(function(a, b){
        //         return b.arrival_date - a.arrival_date;
        //     });
        // }
    },
    methods:{
        filterList(type){
            this.displayCapacities.filter(item =>{
                return item.type == type;
            });
        },
        addItem(type){
            console.log('add Entry clicked ---- ', type);
            var newInstance = this.defaultItem;
            this.displayResponse.push(newInstance);
            this.editedItem = Object.assign({}, newInstance);
            this.editMode.offset = this.displayResponse.length - 1; // the latest one
        },
        editItem(item, index){
            console.log(' editItem --- ', item, index);
            this.editedItem = Object.assign({}, item);
            this.editMode.offset = index;

        },
        deleteItem (item) {
            const index = this.eventExtCapacity.indexOf(item);
            confirm('Are you sure you want to delete this item?') && this.eventExtCapacity.splice(index, 1);
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
