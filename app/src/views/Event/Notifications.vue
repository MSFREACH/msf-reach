<template>
    <v-container class="eventSubContent notification-rows">
        <div class="searchHeader">
            <v-text-field v-model='search' label='Search' single-line hide-details xs10></v-text-field>
            <v-select v-model="selectedCategory" :items="allNotificationCategories" label="Category" round clearable></v-select>
            <markdown-panel v-if="showMarkdown && dialog"></markdown-panel>
            <v-dialog v-model="dialog" max-width="880px" :dark="editIndex != -1">
                <v-btn slot='activator' class='mb-2' small fab flat><v-icon>add</v-icon></v-btn>
                <v-card :class="editIndex != -1 ? 'editing': 'create-new'">
                    <v-flex right>
                        <v-icon @click="close">close</v-icon>
                    </v-flex>
                  <v-card-text>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs4>
                          <v-select :items="allNotificationCategories" v-model="editedItem.category" label="category"></v-select>
                        </v-flex>
                        <v-flex xs12></v-flex>
                        <v-flex xs8>
                            <span class="reminder-notes" v-if="editedItem.category =='EXPLO_FINDINGS'">
                                Type of needs, capacities on the ground <br/>
                                How many people affected, Call for int'l aid by authorities? <br/>
                                MSF proposed intervention <br/>
                                type of activities location of activities
                            </span>
                        </v-flex>
                        <v-flex xs6 style="display: inline-block;">
                            <label>Notification</label>
                            <v-textarea class="editTextArea" :solo="editIndex != -1" label="description" value="" auto-grow background-color="white" color="secondary" v-model="editedItem.description"></v-textarea>
                        </v-flex>
                        <v-flex xs6 style="display: inline-block;">
                            <label>PREVIEW</label>
                            <div class="markdown-fields" v-html="mdRender(editedItem.description)"></div>
                        </v-flex>
                        <v-btn class='mb-2' color="grey lighten" small flat @click="showMarkdown = !showMarkdown"><v-icon>short_text</v-icon> markdown syntax guide</v-btn>

                        <hr class="row-divider">
                        <v-card class="file-attachment" light>
                            <form enctype="multipart/form-data">
                              <input id="fileUpload" style="display: none" ref="myUpload" type="file" accept="*/*" multiple @change="onFilePicked"/>
                              <v-icon @click='pickFile' class="file-icon"> attach_file </v-icon>
                              <v-btn v-if="readyToUpload" label="upload" @click="processFiles" ></v-btn>
                            </form>
                        </v-card>
                        <v-card class="file-attachment" v-for="(item, index) in previewFileUrls" :key="index">
                            <v-icon @click='removeFile(index)' class="remove-file-icon"> close </v-icon>
                            <embed :src="item" width="100%" height="100%"></embed>
                        </v-card>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                      <div>
                          <label> Operator </label> {{ editedItem.username }} <br/>
                          <label> Updated </label>  {{ editedItem.created | relativeTime  }}
                      </div>

                    <v-spacer></v-spacer>
                    <v-progress-circular v-if="request.inProgress" :size="50" color="primary" indeterminate></v-progress-circular>
                    <v-switch v-if='editIndex != -1' label='save' @click='submit'></v-switch>
                    <v-btn v-else @click='submit' flat> add </v-btn>

                  </v-card-actions>
                </v-card>
            </v-dialog>
            <v-btn @click="addExploFindings" class="exploration" right flat v-if="showExploFindings"> add Explo findings </v-btn>
        </div>
        <v-layout v-if="displayNotifications.length > 0" row wrap>
            <v-data-table :headers="headers" :items="displayNotifications" :search="search" item-key="id" class="elevation-1" hide-actions>
                <template slot="items" slot-scope="props">
                    <tr @click="props.expanded = !props.expanded" :key="props.index">
                        <td><span v-if="!props.item.username"> -- </span> {{ props.item.username }}</td>
                        <td>{{ props.item.created | relativeTime  }}</td>
                        <td><span v-if="!props.item.category"> -- </span>
                            <span v-if="props.item.category && props.item.category == 'EXPLO_FINDINGS'" class="exploration">
                                EXPLORATION findings
                            </span>
                            <span v-else>
                                {{ props.item.category }}
                            </span>
                        </td>
                        <td><span v-if="!props.item.description"> -- </span>{{ props.item.description | snippetNoMarkdown }}</td>
                        <td>{{ props.item.files.length }}</td>
                    </tr>
                </template>
                <template slot="expand" slot-scope="props">
                    <v-card class="expanded-field" flat :key="props.index" :id="props.index">
                        <v-card-text v-html="mdRender(props.item.description)"></v-card-text>
                        <v-divider light></v-divider>

                        <v-card v-for="(item, index) in props.item.files" :key="index" class="file-attachment" @click="previewDialog = true">
                             <!-- <v-img :src="item" contain></v-img> -->
                             <embed :src="item" width="100%" height="100%"></embed>
                        </v-card>
                        <v-dialog v-model="previewDialog" justify-center max-width="800px" transition="dialog-transition">
                            <v-carousel hide-controls>
                                <v-carousel-item v-for="(item, i) in props.item.files" :key="i" :src="item"></v-carousel-item>
                            </v-carousel>
                        </v-dialog>
                        <v-card-actions class="text-xs-right list-actions">
                            <v-switch label='edit' @click="editItem(props.item)"></v-switch>
                            <v-icon small @click="deleteItem(props.item)"> delete </v-icon>
                        </v-card-actions>
                    </v-card>

                </template>
            </v-data-table>
        </v-layout>
        <v-layout v-else>
            <div class="no-data-available">
                No notifications yet
            </div>
        </v-layout>
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
// import MarkDownExplain from '@/views/util/MarkdownExplain.vue'
import MarkdownPanel from '@/views/util/MarkdownPanel.vue'

export default {
    name: 'r-event-notifications',
    props:{
        reviewFields:{
            type: Array
        }
    },
    data(){
        return {
            dialog: false,
            showMarkdown: false,
            previewDialog: false,
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
        MarkdownPanel
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
        showExploFindings(){
            if(this.reviewFields) return this.reviewFields.indexOf('explo-findings') != -1;
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
        selectedCategory(val){
            this.displayNotifications = this.eventNotifications.filter(item => {
                if(val) return item.category == val;
                return item;
            });
        },
        eventNotifications(newVal){
            this.displayNotifications = _.map(newVal, _.clone);
        }
    },
    mounted(){
        this.fetchEventNotifications();
    },
    methods: {
        addExploFindings(){
            this.dialog = true;
            this.editedItem.category = 'EXPLO_FINDINGS';
        },
        removeFile(index){
            $('#fileUpload').val("");
            this.previewFileUrls.splice(index, 1);
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
                            this.uploadFile(file);
                        }
                    });
            }
        },
        uploadFile(file){
            this.$store.dispatch(PUT_SIGNED_REQUEST,  file)
                .then((data) => {
                    console.log("PUT_SIGNED_REQUEST ----- success------- ", data);
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
            var isEdit = (this.editIndex > -1) && this.editedItem.id;
            var action = (!!isEdit) ? EDIT_EVENT_NOTIFICATION : CREATE_EVENT_NOTIFICATION;

            var params  = _.extend(this.editedItem, {
                username: this.currentUser.username
            });
            params.files = this.signedFileUrls;

            if (!!isEdit){
                params.updated = timeNow;
                delete params.created;
                delete params.eventid;
            }else{
                params.eventId = parseInt(this.currentEventId);
                params.created = timeNow;
                delete params.updated;
            }

            this.$store.dispatch(action, params)
                .then((payload) =>{
                    this.request.inProgress = false;
                    if(payload.status == 200){
                        this.request.success = true;
                        this.$router.push({
                            name: 'event-notifications',
                            params: { slug: this.currentEventId}
                        });
                        setTimeout(() => this.close(), 1000);
                    }else{
                        this.request.failure = true;
                    }
                });
        },
        close () {
            this.dialog = false;
            this.showMarkdown = false;
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
    .v-carousel,
    .v-carousel__item{
        height: inherit !important;
    }
    .reminder-notes{
        color: $text-light-grey;
        font-style: italic;
        margin-bottom: 21px;
    }
    .theme--dark{
        .reminder-notes{
            color: #fff;
        }
    }
</style>
