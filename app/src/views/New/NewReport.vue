<template>
    <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" fab small flat>
            <v-icon color="grey darken-1"> add </v-icon>
        </v-btn>
        <v-card>
            <v-card-title>
                <span class="headline"> New Report Card </span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12>
                            <v-text-field v-model="report.username" label="Username"></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                            <v-textarea v-model="report.description" autoGrow label="description"></v-textarea>
                        </v-flex>
                        <!-- UPLOAD IMAGE  -->
                        <v-flex xs12>
                            <img :src="imageUrl" height="150" v-if="imageUrl"/>
                            <v-text-field label="Select Image" @click='pickFile' v-model='imageName' prepend-icon='attach_file'></v-text-field>
                            <input type="file" style="display: none" ref="image" accept="image/*" @change="onFilePicked">
                        </v-flex>
                        <!-- GEOJSON -->
                        <!-- CONSENTS -->
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn flat @click.native="close">Cancel</v-btn>
                <v-btn flat @click.native="submit">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
/*eslint no-debugger: off*/
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
import { mapGetters } from 'vuex';
import { DEFAULT_REPORT_CARD_FIELDS } from '@/common/form-fields.js';
import { CREATE_REPORT, FETCH_UPLOAD_URL, PUT_SIGNED_REQUEST } from '@/store/actions.type';

export default {
    name: 'new-report-card',
    data(){
        return {
            dialog: false,
            report: DEFAULT_REPORT_CARD_FIELDS,
            imageName: '',
            imageUrl: '',
            imageFile: ''
        };
    },
    methods: {
        close(){
            this.dialog = false;
            setTimeout(() =>{
                this.report = Object.assign({}, DEFAULT_REPORT_CARD_FIELDS);
            }, 300);
        },
        submit(){
            var timestamp = new Date();
            var ISOTime = timestamp.toISOString();
            if(!this.report.eventId){
                delete this.report.eventId;
            }
            this.report.created = ISOTime;

            // TODO: replace geoJSON with map input
            this.report.location = {
                lat: 52.5200,
                lng: 13.4050
            };

            if(this.imageFile){
                this.$store.dispatch(FETCH_UPLOAD_URL, this.imageName)
                    .then((payload) => {
                        var url = payload.signedRequest;
                        var imageLink = payload.url;
                        this.uploadFile(url, imageLink);
                    });
            }else{
                this.save();
            }

        },
        uploadFile(url, imageLink){
            this.$store.dispatch(PUT_SIGNED_REQUEST, {url, photo: this.imageFile})
                .then(() => {
                    this.save(imageLink);
                });
        },
        pickFile () {
            this.$refs.image.click();
        },
        onFilePicked (e) {
            const files = e.target.files;
            if(files[0] !== undefined) {
                this.imageName = files[0].name;
                if(this.imageName.lastIndexOf('.') <= 0) return;
                const fr = new FileReader();
                fr.readAsDataURL(files[0]);
                fr.addEventListener('load', () => {
                    this.imageUrl = fr.result;
                    this.imageFile = files[0]; // this is an image file that can be sent to server...
                });
            } else {
                this.imageName = '';
                this.imageFile = '';
                this.imageUrl = '';
            }
        },
        save(imageLink){
            console.log('[SAVE ---- ] ', imageLink);
            if(imageLink){
                this.report.content.image_link = imageLink;
            }
            this.$store.dispatch(CREATE_REPORT, this.report)
                .then((payload) =>{

                    // show confimation or direct to MAP view to show nearby reports
                });
        }
    }
};

</script>
