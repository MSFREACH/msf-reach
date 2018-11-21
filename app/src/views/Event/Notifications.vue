<template>
    <v-container class="eventSubContent">
        <div class="notification-rows">
            <div v-if="eventNotifications">

                <v-dialog v-model="dialog" max-width="500px">
                    <v-btn slot="activator" color="primary" dark class="mb-2">New Item</v-btn>
                    <v-card>
                      <v-card-title>
                        <span class="headline"> Enter new notification</span>
                      </v-card-title>

                      <v-card-text>
                        <v-container grid-list-md>
                          <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                              <v-select :items="allNotificationCategories" v-model="editedItem.category" label="category"></v-select>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                              <v-text-field v-model="editedItem.description" label="description"></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
                        <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>

                <v-btn-toggle v-model="selectedCategory">
                    <span v-for="(category, index) in allNotificationCategories"
                    :value="category"
                    :key="index"
                    :class="category + '-fill select-category-filter'"
                    @click="filterByCategory(category)">
                    </span>
                </v-btn-toggle>

                <span> {{displayNotifications.length}} </span>
                <ul v-show="eventNotifications.length > 0">
                    <li v-for="(elem, index) in displayNotifications">
                        <span v-if="elem.hasOwnProperty('username')">{{elem.username}}</span>
                        <span v-else>(username N/A)</span>
                        <span> {{ (elem.notification_time*1000) | relativeTime }} </span>
                        <p> {{ elem.notification }}
                            <a v-if="elem.notificationFileUrl" :href="elem.notificationFileUrl" target="_blank">(attachment)</a>
                        </p>
                    </li>
                </ul>

                <v-data-table :headers="headers" :items="displayNotifications" class="elevation-1" >
                    <template slot="items" slot-scope="props">
                        <td>{{ props.item.username }}</td>
                        <td class="text-xs-right">{{ props.item.timestamp }}</td>
                        <td class="text-xs-right">{{ props.item.category }}</td>
                        <td class="text-xs-right">{{ props.item.descrption }}</td>
                        <td class="text-xs-right">{{ props.item.files.length }}</td>
                    </template>
                    <template slot="no-data">
                        
                    </template>
                </v-data-table>
            </div>
            <div v-else>No updates yet </div>
        </div>
    </v-container>
</template>

<script>
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
/*eslint no-console: off*/

import { mapGetters } from 'vuex';
import { EVENT_NOTIFICATION_CATEGORIES } from '@/common/common';
// import { EDIT_EVENT } from '@/store/actions.type';

export default {
    name: 'r-event-notifications',
    data(){
        return {
            dialog: false,
            editing: false,
            allNotificationCategories: EVENT_NOTIFICATION_CATEGORIES,
            selectedCategory: '',
            headers: [
                { text: 'Operator', align: 'left', sortable: false, value: 'username'},
                { text: 'UPDATED', value: 'timestamp' },
                { text: 'Category', value: 'category' },
                { text: 'Notification', value: 'description' },
                { text: 'Files', value: 'files.length' },
                { text: 'Actions', value: 'name', sortable: false }],
            editedItem:{
                category: '',
                descrption: ''
            },
            editedIndex: -1,
            defaultItem:{
                category: '',
                descrption: ''
            }
        };
    },
    components: {
        //TODO: add + edit notification
    },

    filters: {
    },
    computed: {
        ...mapGetters([
            'eventNotifications'
        ]),
        reversedNotifications: function (){
            if(this.eventNotifications && this.eventNotifications.length > 0){
                return this.eventNotifications.slice().sort((a,b) => {
                    return b.notification_time - a.notification_time;
                });
            }
        },
        displayNotifications: function(){
            return  _.map(this.eventNotifications, _.clone);
        }
    },
    watch: {
    },
    methods: {
        filterByCategory(category){
            this.displayNotifications = this.eventNotifications.filter(item => {
                if(item.category && item.category == category) return item;
            });
        },
        save(){

        },
        close () {
            this.dialog = false;
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            }, 300);
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
