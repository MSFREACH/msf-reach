<template>
    <v-container class="eventSubContent">
        <div class="notification-rows">

                <v-dialog v-model="dialog" color="editing" max-width="880px" dark >
                    <v-btn slot="activator" color="editing" dark class="mb-2"><v-icon>create</v-icon></v-btn>
                    <v-card>
                      <v-card-title>
                        <span class="headline">{{formTitle }}</span>
                      </v-card-title>

                      <v-card-text>
                        <v-container grid-list-md>
                          <v-layout wrap>
                            <v-flex xs10>
                              <v-select :items="allNotificationCategories" v-model="editedItem.category" label="category"></v-select>
                            </v-flex>
                            <v-flex xs2>
                                <v-icon @click="close">close</v-icon>
                            </v-flex>
                            <v-flex xs6 style="display: inline-block;">
                                <label>Notification</label>
                                <v-textarea solo label="description" value="" auto-grow background-color="white" color="secondary" v-model="editedItem.description"></v-textarea>
                            </v-flex>
                            <v-flex xs6 style="display: inline-block;">
                                <label>PREVIEW</label>
                                <div class="markdown-fields" v-html="mdRender(editedItem.description)"></div>
                            </v-flex>
                            <v-divider light></v-divider>
                            <v-card class="file-attachment">
                                <form enctype="multipart/form-data">
                                  <input id="fileUpload" style="display: none" ref="myUpload" type="file" accept="*/*" multiple @change="onFilePicked"/>
                                  <v-icon @click='pickFile'> attach_file </v-icon>
                                  <v-btn v-if="readyToUpload" label="upload" @click="processFiles" ></v-btn>
                                </form>
                            </v-card>
                            <v-card class="file-attachment" v-for="(item, index) in previewFileUrls" :key="index">
                                <embed :src="item" width="100%" height="100%"></embed>
                            </v-card>
                            <!-- add | list of uploaded files  -->

                          </v-layout>
                        </v-container>
                      </v-card-text>
                      <v-card-actions>
                          <v-flex>
                              <label> Operator </label> {{ editedItem.username }} <br/>
                              <label> Updated </label>  {{ (editedItem.timestamp * 1000) | relativeTime  }}
                          </v-flex>
                        <v-spacer></v-spacer>
                        <v-switch label="save" @click="submit"></v-switch>
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

                <v-data-table :headers="headers" :items="displayNotifications" item-key="timestamp" class="elevation-1" hide-actions>
                    <template slot="items" slot-scope="props">
                        <tr @click="props.expanded = !props.expanded" :key="props.index">
                            <td><span v-if="!props.item.username"> -- </span> {{ props.item.username }}</td>
                            <td>{{ (props.item.timestamp * 1000) | relativeTime  }}</td>
                            <td><span v-if="!props.item.category"> -- </span>{{ props.item.category }}</td>
                            <td><span v-if="!props.item.description"> -- </span>{{ props.item.description | snippetNoMarkdown }}</td>
                            <td>{{ props.item.files.length }}</td>
                        </tr>
                    </template>
                    <template slot="expand" slot-scope="props">

                        <v-card class="expanded-field" flat :key="props.index" :id="props.index">
                            <v-card-actions class="text-xs-right">
                                <v-icon small class="mr-2" @click="editItem(props.item)"> edit </v-icon>
                                <v-icon small @click="deleteItem(props.item)"> delete </v-icon>
                            </v-card-actions>
                            <v-card-text v-html="mdRender(props.item.description)"></v-card-text>
                            <v-divider light></v-divider>

                            <v-card class="file-attachment">
                                 <v-img src='https://cdn.vuetifyjs.com/images/cards/halcyon.png' contain></v-img>
                            </v-card>
                            <v-card class="file-attachment">
                                 <v-img src='https://docs.google.com/document/d/1tuZFpkZoDPgy8bMw0aJDGJ5LuiKtt1kBzp9_eDbjaro/edit' contain></v-img>
                            </v-card>
                            <v-card class="file-attachment">
                                 <v-img src='http://www.africau.edu/images/default/sample.pdf' contain></v-img>
                            </v-card>
                            <v-card class="file-attachment">
                                 <v-img src='http://homepages.inf.ed.ac.uk/neilb/TestWordDoc.doc' contain></v-img>
                            </v-card>
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
import { CREATE_NOTIFICATION, FETCH_UPLOAD_URL, PUT_SIGNED_REQUEST } from '@/store/actions.type';

import $ from 'jquery';
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
                { text: 'Files', value: 'files.length', sortable: false}
            ],
            editedItem:{
                category: '',
                descrption: '',
                timestamp: null
            },
            editedIndex: -1,
            defaultItem:{
                category: '',
                descrption: '',
                timestamp: null,
            },
            readyToUpload: false,
            sampleFiles:[
                'https://cdn.vuetifyjs.com/images/cards/halcyon.png',
                'https://docs.google.com/document/d/1tuZFpkZoDPgy8bMw0aJDGJ5LuiKtt1kBzp9_eDbjaro/edit',
                'http://www.africau.edu/images/default/sample.pdf',
                'http://homepages.inf.ed.ac.uk/neilb/TestWordDoc.doc'
            ],
            previewFileUrls: [],
            signedFileUrls: []

        };
    },
    components: {
        //TODO: add + edit notification
    },

    filters: {
    },
    computed: {
        ...mapGetters([
            'currentUser',
            'currentEventId',
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
            if (val){
                if(!this.editedItem.timestamp){
                    this.editedItem.timestamp = new Date();
                }
            }else{
                this.close();
            }
            // val || this.close();
        }
    },
    methods: {
        mdRender(value){
            if(value) return marked(value);
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
        pickFile(){
            this.$refs.myUpload.click();
        },
        onFilePicked(e){
            const files = e.target.files;
            for(var f=0; f< files.length; f++){
                const fr = new FileReader();
                fr.readAsDataURL(files[f]);
                fr.addEventListener('load', () => {
                    var fileUrl = fr.result;
                    this.previewFileUrls.push(fileUrl);
                });
            }
        },
        processFiles(files){
            console.log('hey == process files ! ');
            var vm = this;
            // name, size, type;
            for(var f=0; f< files.length; f++){
                var fileName = files[f].name;
                var fileType = files[f].type;
                var fileSize = files[f].size;
                var file = files[f];
                var params = {key: ('event/'+this.currentEventId), filename: fileName};
                this.$store.dispatch(FETCH_UPLOAD_URL, params)
                    .then((payload) => {
                        if(payload){
                            var fileLink = payload.url;
                            vm.signedFileUrls.push(fileLink);
                            console.log('1111 ---- dispatch.then ---- ', fileLink);
                            this.uploadFile(file);
                        }
                    });
            }
        },
        uploadFile(file){
            this.$store.dispatch(PUT_SIGNED_REQUEST,  file)
                .then(() => {
                    this.save();
                });
        },
        submit(){
            var files = this.$refs.myUpload.files;
            if(files){
                this.processFiles(files);
            }else{
                this.save();
            }
        },
        save(){
            var timeNow = new Date();
            var params = _.extend(this.editedItem, {
                timestamp: timeNow,
                username: this.currentUser.username
            });
            this.$store.dispatch(CREATE_NOTIFICATION, this.params) /// new notification table or edit events
                .then((payload) =>{

                    // show confimation or direct to MAP view to show nearby reports
                });
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
