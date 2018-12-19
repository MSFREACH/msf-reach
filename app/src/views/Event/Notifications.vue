<template>
    <v-container class="eventSubContent notification-rows">
        <div class="searchHeader">
            <v-text-field v-model='search' label='Search' single-line hide-details xs10></v-text-field>
            <v-select v-model="selectedCategory" :items="allNotificationCategories" label="Category" round></v-select>
            <v-dialog v-model="dialog" max-width="880px" dark>
                <v-btn slot='activator' class='mb-2' small fab flat><v-icon>add</v-icon></v-btn>
                <v-card class="editing">
                    <v-flex xs>
                        <v-icon @click="close">close</v-icon>
                    </v-flex>
                  <v-card-title>
                    <span class="headline">{{formTitle}}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs10>
                          <v-select :items="allNotificationCategories" v-model="editedItem.category" label="category"></v-select>
                        </v-flex>
                        <v-flex xs6 style="display: inline-block;">
                            <label>Notification</label>
                            <v-textarea class="editTextArea" solo label="description" value="" auto-grow background-color="white" color="secondary" v-model="editedItem.description"></v-textarea>
                        </v-flex>
                        <v-flex xs6 style="display: inline-block;">
                            <label>PREVIEW</label>
                            <div class="markdown-fields" v-html="mdRender(editedItem.description)"></div>
                        </v-flex>
                        <v-layout>
                            <v-divider light></v-divider>
                        </v-layout>
                        <v-card class="file-attachment" light>
                            <form enctype="multipart/form-data">
                              <input id="fileUpload" style="display: none" ref="myUpload" type="file" accept="*/*" multiple @change="onFilePicked"/>
                              <v-icon @click='pickFile' class="file-icon"> attach_file </v-icon>
                              <v-btn v-if="readyToUpload" label="upload" @click="processFiles" ></v-btn>
                            </form>
                        </v-card>
                        <v-card class="file-attachment" v-for="(item, index) in previewFileUrls" :key="index">
                            <embed :src="item" width="100%" height="100%"></embed>
                        </v-card>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                      <v-flex>
                          <label> Operator </label> {{ editedItem.username }} <br/>
                          <label> Updated </label>  {{ editedItem.created | relativeTime  }}
                      </v-flex>

                    <v-spacer></v-spacer>
                    <v-progress-circular v-if="request.inProgress" :size="50" color="primary" indeterminate></v-progress-circular>
                    <v-switch v-if='editIndex' label='save' @click='submit'></v-switch>
                    <v-btn v-else label='add' @click='submit'></v-btn>

                  </v-card-actions>
                </v-card>
              </v-dialog>
        </div>

        <v-data-table :headers="headers" :items="displayNotifications" :search="search" item-key="id" class="elevation-1" hide-actions>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded" :key="props.index">
                    <td><span v-if="!props.item.username"> -- </span> {{ props.item.username }}</td>
                    <td>{{ props.item.created | relativeTime  }}</td>
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

                    <v-card v-for="(item, index) in props.item.files" :key="index" class="file-attachment">
                         <v-img :src="item" contain></v-img>
                    </v-card>
                </v-card>

            </template>
            <template slot="no-data">
                No updates yet
            </template>
        </v-data-table>
    </v-container>
</template>

<script>
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
/*eslint no-console: off*/
import { mapGetters } from 'vuex';
import $ from 'jquery';
import marked from 'marked';
import { EVENT_NOTIFICATION_CATEGORIES, EVENT_NOTIFICATION_HEADERS } from '@/common/common';
import { FETCH_EVENT_NOTIFICATIONS, CREATE_EVENT_NOTIFICATION, EDIT_EVENT_NOTIFICATION, DELETE_EVENT_NOTIFICATION, FETCH_UPLOAD_URL, PUT_SIGNED_REQUEST } from '@/store/actions.type';
import { DEFAULT_EVENT_NOTIFICATION_FIELDS } from '@/common/form-fields';
import { REQUEST_STATUSES } from '@/common/network-handler';

export default {
    name: 'r-event-notifications',
    data(){
        return {
            dialog: false,
            editing: false,
            allNotificationCategories: EVENT_NOTIFICATION_CATEGORIES,
            selectedCategory: '',
            displayNotifications: [],
            headers: EVENT_NOTIFICATION_HEADERS,
            defaultItem: DEFAULT_EVENT_NOTIFICATION_FIELDS,
            editedItem: DEFAULT_EVENT_NOTIFICATION_FIELDS,
            editIndex: -1,
            search: '',
            readyToUpload: false,
            sampleFiles:[
                'https://cdn.vuetifyjs.com/images/cards/halcyon.png'
            ],

            request: REQUEST_STATUSES,
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
            'oldEventNotifications',
            'eventNotifications'
        ]),
        // reversedNotifications: function (){
        //     if(this.eventNotifications && this.eventNotifications.length > 0){
        //         return this.eventNotifications.slice().sort((a,b) => {
        //             return b.notification_time - a.notification_time;
        //         });
        //     }
        // },
        formTitle () {
            return this.editIndex === -1 ? 'Enter new notification' : 'Edit notification';
        }
    },
    watch: {
        dialog (val) {
            if (val){
                if(!this.editedItem.updated){
                    this.editedItem.updated = new Date();
                }
            }else{
                this.close();
            }
        },
        selectedCategory(newVal){
            var totalNotifications = _.merge(this.eventNotifications, this.oldEventNotifications);
            this.displayNotifications = totalNotifications.filter(item => {
                if(!newVal) return item;
                if(item.category == newVal) {
                    return item;
                }
            });
        },
        eventNotifications(newVal){
            if(this.eventNotifications.length == 0){
                this.migrateOldEntries();
            }
            this.displayNotifications = _.map(newVal, _.clone);
        }
    },
    mounted(){
        this.fetchEventNotifications();
    },
    methods: {
        migrateOldEntries(){
            var temp = this.oldEventNotifications;
            if(temp.length > 0){
                for(var i = 0; i < temp.length; i++){
                    this.$store.dispatch(CREATE_EVENT_NOTIFICATION, temp[i]);
                    if(i == temp.length-1) this.fetchEventNotifications(); // on the last one refresh again
                }
            }
        },
        fetchEventNotifications(){
            this.$store.dispatch(FETCH_EVENT_NOTIFICATIONS, {eventId: parseInt(this.currentEventId)});
        },
        mdRender(value){
            if(value) return marked(value);
        },
        editItem(item){
            this.dialog = true;
            this.editIndex = _.findIndex(this.eventNotifications, item);
            this.editedItem = Object.assign({}, item);
        },
        deleteItem (item) {
            const itemIndex = _.findIndex(this.eventNotifications, item);
            this.$store.dispatch(DELETE_EVENT_NOTIFICATION, parseInt(item.id));
            this.eventNotifications.splice(itemIndex, 1);
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
            var vm = this;
            // name, size, type;
            for(var f=0; f< files.length; f++){
                var fileName = files[f].name;
                var fileType = files[f].type;
                var fileSize = files[f].size;
                var file = files[f];
                var params = {key: ('event/'+this.currentEventId+'/notifications'), filename: fileName};
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
            if(files.length > 0 ){
                this.processFiles(files);
            }else{
                this.save();
            }
        },
        save(){
            var timeNow = new Date();
            var isEdit = this.editIndex && this.editedItem.id;

            var action = isEdit? EDIT_EVENT_NOTIFICATION : CREATE_EVENT_NOTIFICATION;
            var params  = _.extend(this.editedItem, {
                username: this.currentUser.username
            });

            if (isEdit){
                params.updated = timeNow;
                delete params.created;
                delete params.eventid;
            }else{
                params.eventId = this.currentEventId;
                params.created = timeNow;
                delete params.updated;
            }

            console.log(' -----save-- ', isEdit, params);
            this.$store.dispatch(action, params)
                .then((payload) =>{
                    this.request.inProgress = false;
                    if(payload.status == 200){
                        this.request.success = true;
                        this.fetchEventNotifications();
                        setTimeout(() => this.close(), 1000);
                    }else{
                        this.request.failure = true;
                    }
                });
        },
        close () {
            this.dialog = false;
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.previewFileUrls = [];
                this.signedFileUrls = [];
                this.editIndex = -1;
            }, 300);
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';


</style>
