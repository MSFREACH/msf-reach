<template>
    <v-container class='eventSubContent SITREP-Container'>
        <div class="searchHeader">
            <v-text-field v-model='search' append-icon='search' label='Search' single-line hide-details xs10></v-text-field>
            <v-dialog v-model='dialog' max-width='1180px' dark>
                <v-btn slot='activator' class='mb-2' small fab flat><v-icon>add</v-icon></v-btn>
                <v-card class='editing'>
                    <v-flex>
                        <v-icon @click='close'>close</v-icon>
                    </v-flex>
                  <v-card-title>
                    <span class='headline'>{{formTitle}}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs6 style='display: inline-block;'>
                            <label>SITREP</label>
                            <v-textarea class='editTextArea' solo auto-grow label='Description'
                            background-color='white' color='secondary' v-model='editedSitRep.description'></v-textarea>
                        </v-flex>
                        <v-flex xs6 style='display: inline-block;'>
                            <label>PREVIEW</label>
                            <div class='markdown-fields' v-html='mdRender(editedSitRep.description)'></div>
                        </v-flex>
                        <v-divider light></v-divider>
                        <v-card class='file-attachment' light>
                            <form enctype='multipart/form-data'>
                              <input id='fileUpload' style='display: none' ref='myUpload' type='file' accept='*/*' multiple @change='onFilePicked'/>
                              <v-icon @click='pickFile' class='file-icon'> attach_file </v-icon>
                            </form>
                        </v-card>
                        <v-card class='file-attachment' v-for='(item, index) in previewFileUrls' :key='index'>
                            <embed :src='item' width='100%' height='100%'></embed>
                        </v-card>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <div><label> Operator </label> {{ editedSitRep.username }} </div>
                    <div><label> Updated </label>  {{ editedSitRep.created | relativeTime  }}</div>

                    <v-spacer></v-spacer>
                    <v-progress-circular v-if="request.inProgress" :size="50" color="primary" indeterminate></v-progress-circular>
                    <v-switch v-if='editIndex' label='save' @click='submit'></v-switch>
                    <v-btn v-else label='add' @click='submit'></v-btn>
                  </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
        <v-layout>
            <v-date-picker no-title
            v-model='date1'
            :events='arrayEvents'
            :allowed-dates='allowedDates'
            event-color='editing'
            width="150px !important"
            ></v-date-picker>
            <v-data-iterator
            content-tag='v-layout'
            :items='displaySITREPs'
            item-key="id"
            :search='search'
            no-data-text='No SITREP yet'
            class="sitrep-iterator"
            hide-actions
            wrap row>
                <template slot="item" slot-scope="props">
                    <v-flex @click="props.expanded = !props.expanded" :key="props.index">
                        <v-flex xs3>{{props.item.created | dayMonth}}</v-flex>
                        <v-flex xs6><span v-if='!props.item.description'> -- </span>{{ props.item.description | snippetNoMarkdown }}</v-flex>
                        <v-flex xs3><span class='file-attachment'>{{ props.item.files.length }}</span></v-flex>
                    </v-flex>
                </template>
                <template slot="expand" slot-scope="props">
                    <v-card class="expanded-field" flat :key="props.index" :id="props.index">
                        <v-card-actions class="text-xs-right">
                            <v-icon small class="mr-2" @click="editSitRep(props.item)"> edit </v-icon>
                            <v-icon small @click="deleteSitRep(props.item)"> delete </v-icon>
                        </v-card-actions>
                        <v-card-text v-html="mdRender(props.item.description)"></v-card-text>
                        <v-divider light></v-divider>

                        <v-card v-for="(item, index) in props.item.files" :key="index" class="file-attachment">
                             <v-img :src="item" contain></v-img>
                        </v-card>
                    </v-card>
                </template>
                <v-alert slot='no-results' :value='true' color='error' icon='warning'>
                    Your search for '{{ search }}' found no results.
                </v-alert>
            </v-data-iterator>
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
import { FETCH_SITREPS, CREATE_SITREP, EDIT_SITREP, FETCH_UPLOAD_URL, PUT_SIGNED_REQUEST } from '@/store/actions.type';
import { DEFAULT_SITREP_FIELDS } from '@/common/form-fields';
import { REQUEST_STATUSES } from '@/common/network-handler';

export default {
    name: 'r-event-sitrep',
    data(){
        return {
            dialog: false,
            editing: false,
            defaultSitRep: DEFAULT_SITREP_FIELDS,
            editedSitRep: DEFAULT_SITREP_FIELDS,
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
        this.fetchSitReps();
    },
    methods: {
        fetchSitReps(){
            this.$store.dispatch(FETCH_SITREPS, {eventId: parseInt(this.currentEventId)});
        },
        mdRender(value){
            if(value) return marked(value);
        },
        editSitRep(item){
            this.dialog = true;
            this.editIndex = _.findIndex(this.sitreps, item);
            this.editedSitRep = Object.assign({}, item);
        },
        deleteSitRep(item){
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
            this.request.inProgress = true;
            if(files.length > 0 ){
                this.processFiles(files);
            }else{
                this.save();
            }
        },
        save(){
            var timeNow = new Date();
            var isEdit = (this.editIndex && this.editedSitRep.id)  != -1;

            var action = isEdit ? EDIT_SITREP : CREATE_SITREP;
            var params = _.extend(this.editedSitRep, {
                username: this.currentUser.username,
            });

            if (isEdit){
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
                        setTimeout(() => this.close(), 1000);
                    }else{
                        this.request.failure = true;
                    }
                });
        },
        close () {
            this.dialog = false;
            setTimeout(() => {
                this.editedSitRep = Object.assign({}, this.defaultSitRep);
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
                if(!this.editedSitRep.updated){
                    this.editedSitRep.updated = new Date();
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
            'isLoadingSitReps',
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
