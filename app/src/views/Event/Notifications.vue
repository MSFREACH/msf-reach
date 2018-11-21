<template>
    <v-container class="eventSubContent">
        <div class="notification-rows">

                <v-dialog v-model="dialog" max-width="500px">
                    <v-btn slot="activator" color="primary" dark class="mb-2"><v-icon>create</v-icon></v-btn>
                    <v-card>
                      <v-card-title>
                        <span class="headline">{{formTitle }}</span>
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

                <!-- <ul v-show="eventNotifications.length > 0">
                    <li v-for="(elem, index) in displayNotifications">
                        <span v-if="elem.hasOwnProperty('username')">{{elem.username}}</span>
                        <span v-else>(username N/A)</span>
                        <span> {{ (elem.notification_time*1000) | relativeTime }} </span>
                        <p> {{ elem.notification }}
                            <a v-if="elem.notificationFileUrl" :href="elem.notificationFileUrl" target="_blank">(attachment)</a>
                        </p>
                    </li>
                </ul> -->

                <v-data-table :headers="headers" :items="displayNotifications" item-key="timestamp" class="elevation-1" hide-actions>
                    <template slot="items" slot-scope="props">
                        <tr @click="props.expanded = !props.expanded" :key="props.index">
                            <td><span v-if="!props.item.username"> -- </span> {{ props.item.username }}</td>
                            <td>{{ (props.item.timestamp * 1000) | relativeTime  }}</td>
                            <td><span v-if="!props.item.category"> -- </span>{{ props.item.category }}</td>
                            <td><span v-if="!props.item.description"> -- </span>{{ props.item.description | snippetNoMarkdown }}</td>
                            <td>{{ props.item.files.length }}</td>
                            <td class="justify-center layout px-0">
                              <v-icon small class="mr-2" @click="editItem(props.item)"> edit </v-icon>
                              <v-icon small @click="deleteItem(props.item)"> delete </v-icon>
                            </td>
                        </tr>
                    </template>
                    <template slot="expand" slot-scope="props">
                        <v-card flat :key="props.index" :id="props.index">
                            <v-card-text v-html="mdRender(props.item.description)"></v-card-text>
                        </v-card>
                    </template>
                    <template slot="no-data">
                        No updates yet
                    </template>
                </v-data-table>
            </div>
        </div>
    </v-container>
</template>

<script>
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
/*eslint no-console: off*/
import { mapGetters } from 'vuex';
import marked from 'marked';
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
                { text: 'UPDATED', value: 'timestamp', sortable: false},
                { text: 'Category', value: 'category', sortable: false},
                { text: 'Notification', value: 'description', sortable: false},
                { text: 'Files', value: 'files.length', sortable: false},
                { text: 'Actions', value: 'name', sortable: false}],
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
        },
        formTitle () {
            return this.editedIndex === -1 ? 'Enter new notification' : 'Edit notification';
        }
    },
    watch: {
        dialog (val) {
            val || this.close();
        }
    },
    methods: {
        mdRender(value){
            return marked(value);
        },
        filterByCategory(category){
            this.displayNotifications = this.eventNotifications.filter(item => {
                if(item.category && item.category == category) return item;
            });
        },
        editItem(item){
            this.dialog = true;
            this.editIndex = this.eventNotifications.indexOf(item);
            this.editedItem = Object.assign({}, item);
        },
        deleteItem (item) {
            const index = this.eventNotifications.indexOf(item);
            confirm('Are you sure you want to delete this item?') && this.eventNotifications.splice(index, 1);
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
