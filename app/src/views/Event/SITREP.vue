<template>
    <v-container class='eventSubContent SITREP-Container'>
        <div class="searchHeader">
            <v-text-field v-model='search' append-icon='search' label='Search' single-line hide-details xs10></v-text-field>
            <v-dialog v-model='dialog' max-width='1180px' :dark="editIndex != -1">
                <v-btn slot='activator' class='mb-2' small fab flat><v-icon>add</v-icon></v-btn>
                <v-card :class="editIndex != -1 ? 'editing': 'create-new'">
                <v-flex right>
                    <v-icon class="action-link" @click='close'>close</v-icon>
                </v-flex>
                  <v-card-text>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs6 style='display: inline-block;'>
                            <label>SITREP</label>
                            <v-textarea class='editTextArea' auto-grow label='Description' flat color='secondary' background-color="white" v-model='editedSitrep.description'></v-textarea>
                        </v-flex>
                        <v-flex xs6 style='display: inline-block;'>
                            <label>PREVIEW</label>
                            <div class='markdown-fields' v-html='mdRender(editedSitrep.description)'></div>
                        </v-flex>
                        <hr class="row-divider"/>
                        <v-card class='file-attachment' light>
                            <form enctype='multipart/form-data'>
                              <input id='fileUpload' style='display: none' ref='myUpload' type='file' accept='*/*' multiple @change='onFilePicked'/>
                              <v-icon @click='pickFile' class='file-icon'> attach_file </v-icon>
                            </form>
                        </v-card>
                        <v-card class='file-attachment' v-for='(item, index) in previewFileUrls' :key='index'>
                            <v-icon @click='removeFile(index)' class="remove-file-icon"> close </v-icon>
                            <embed :src='item' width='100%' height='100%'></embed>
                        </v-card>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <div v-if="editedSitrep.created">
                        <label> Operator </label> {{ editedSitrep.username }} <br/>
                        <label> Updated </label>  {{ editedSitrep.created | relativeTime  }}
                    </div>

                    <v-spacer></v-spacer>
                    <v-progress-circular v-if="request.inProgress" :size="50" color="primary" indeterminate></v-progress-circular>
                    <v-switch v-if='editIndex != -1' label='save' @click='submit'></v-switch>
                    <v-btn v-else @click='submit' flat dark color="grey lighten-1">add</v-btn>
                  </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
        <v-layout class="full-text-fields sitrep-rows" v-if="displaySITREPs.length > 0">
            <v-date-picker no-title v-model='date1' :events='arrayEvents' :allowed-dates='allowedDates'
            event-color='editing' width="150px !important"></v-date-picker>

            <v-expansion-panel  expand focusable>
              <v-expansion-panel-content  v-for="(item, i) in displaySITREPs" :key="i">
                <v-layout row wrap slot="header">
                    <v-flex xs3 class="calendar-date">{{item.created | dayMonth}}</v-flex>
                    <v-flex xs6><span v-if='!item.description'> -- </span>{{ item.description | snippetNoMarkdown }}</v-flex>
                    <v-flex xs3><span class='file-attachment count'>{{ item.files.length }}</span></v-flex>
                </v-layout>
                <v-card class="grey lighten-3">
                    <v-card-text v-html="mdRender(item.description)">
                    </v-card-text>
                    <hr class="row-divider"/>
                    <v-card v-for="(item, index) in item.files" :key="index" class="file-attachment">
                         <v-img :src="item" contain></v-img>
                    </v-card>
                    <v-card-actions class="text-xs-right list-actions">
                        <v-switch label='edit' @click="editSitrep(item)"></v-switch>
                        <v-icon small @click="deleteSitrep(item)"> delete </v-icon>
                    </v-card-actions>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>

        </v-layout>
        <v-layout v-else>
            <div class="no-data-available">
                No SITREP available
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
import { FETCH_SITREPS, CREATE_SITREP, EDIT_SITREP, DELETE_SITREP, FETCH_UPLOAD_URL, PUT_SIGNED_REQUEST } from '@/store/actions.type';
import { DEFAULT_SITREP_FIELDS } from '@/common/form-fields';
import { REQUEST_STATUSES } from '@/common/network-handler';

export default {
    name: 'r-event-sitrep',
    data(){
        return {
            dialog: false,
            editing: false,
            defaultSitrep: DEFAULT_SITREP_FIELDS,
            editedSitrep: DEFAULT_SITREP_FIELDS,
            editIndex: -1,
            previewFileUrls: [],
            signedFileUrls: [],
            date1: new Date().toISOString().substr(0, 10),
            arrayEvents: null,
            search: '',
            request: REQUEST_STATUSES,
            displaySITREPs:[]
        };
    },
    components: {
        //TODO: add + edit
    },
    mounted(){
        this.fetchSitreps();
    },
    methods: {
        removeFile(index){
            $('#fileUpload').val("");
            this.previewFileUrls.splice(index, 1);
        },
        fetchSitreps(){
            this.$store.dispatch(FETCH_SITREPS, {eventId: parseInt(this.currentEventId)});
        },
        mdRender(value){
            if(value) return marked(value);
        },
        editSitrep(item){
            this.dialog = true;
            this.editIndex = _.findIndex(this.sitreps, item);
            this.editedSitrep = Object.assign({}, item);
        },
        deleteSitrep(item){
            const itemIndex = _.findIndex(this.sitreps, item);
            this.$store.dispatch(DELETE_SITREP, parseInt(item.id));
            this.sitreps.splice(itemIndex, 1);
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
            for(var f=0; f< files.length; f++){
                var fileName = files[f].name;
                var fileType = files[f].type;
                var fileSize = files[f].size;
                var file = files[f];
                var params = {key: ('event/'+this.currentEventId+'/sitreps'), filename: fileName};
                this.$store.dispatch(FETCH_UPLOAD_URL, params)
                    .then((payload) => {
                        if(payload){
                            var fileLink = payload.url;
                            vm.signedFileUrls.push(fileLink);
                            console.log('1111 ---- dispatch.then ---- ', fileLink);
                            this.uploadFile(file);
                            return;
                        }
                    });
            }
        },
        uploadFile(file){
            console.log('222 ----uploadFile', file);

            this.$store.dispatch(PUT_SIGNED_REQUEST,  file)
                .then(() => {
                    console.log('444 ----uploadFile', file);
                    this.save();
                });
        },
        submit(){
            var files = this.$refs.myUpload.files;
            this.request.inProgress = true;
            if(files.length > 0 ){
                this.processFiles(files);
            }else{
                this.save();
            }
        },
        save(){
            var timeNow = new Date();
            var isEdit = (this.editIndex > -1) && this.editedSitrep.id;
            var action = (!!isEdit) ? EDIT_SITREP : CREATE_SITREP;
            var params = _.extend(this.editedSitrep, {
                username: this.currentUser.username,
            });

            if (!!isEdit){
                params.updated = timeNow;
                delete params.created;
                delete params.eventid;
            }else{
                params.created = timeNow;
                params.eventId = this.currentEventId;
                delete params.updated;
            }
            this.$store.dispatch(action, params)
                .then((payload) =>{
                    this.request.inProgress = false;
                    if(payload.status == 200){
                        this.request.success = true;
                        this.$router.push({
                            name: 'event-sitrep',
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
            setTimeout(() => {
                this.editedSitrep = Object.assign({}, this.defaultSitrep);
                this.previewFileUrls = [];
                this.signedFileUrls = [];
                this.editIndex = -1;
            }, 300);
        },
        allowedDates(val){
            if(this.arrayEvents && this.arrayEvents.indexOf(val) !== -1){
                return val;
            }
        }
    },
    watch: {
        dialog (val) {
            if (val){
                if(!this.editedSitrep.updated){
                    this.editedSitrep.updated = new Date();
                }
            }else{
                this.close();
            }
        },
        sitreps(val){
            this.displaySITREPs = _.map(this.sitreps, _.clone);

            this.arrayEvents = this.sitreps.map(item => {
                return item.created.substr(0, 10);
            });

            this.allowedDates();
        }
    },
    filters: {
    },
    computed: {
        ...mapGetters([
            'oldEventReflection',
            'currentUser',
            'currentEventId',
            'sitreps',
            'isLoadingSitreps',
            'fetchSitrepError'
        ]),
        formTitle () {
            return this.editIndex == -1 ? 'Create new' : 'Edit SITREP';
        }
    }
};

</script>
<style lang='scss'>
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
    .SITREP-Container{
        .v-picker--date{
            .v-picker__body{
                width: 150px;
            }
        }
    }
    .v-date-picker-header .v-btn{
        display: none;
    }

    .v-date-picker-table--date .v-btn {
        height: 20px;
        width: 20px;
    }
    .sitrep-iterator{
        margin-left: 4em;
    }


</style>
