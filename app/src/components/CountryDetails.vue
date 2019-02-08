<template>
    <v-container class="relatedContent full-text-fields" app>
        <v-layout row wrap>
            <v-navigation-drawer class="CD-drawer" width="200">
                <v-list>
                    <v-list-tile class="round-borders">
                        <v-select :items="countries" v-model="selectedCountry" label="Country" item-text="country" item-value="country_code"></v-select>
                    </v-list-tile>
                    <v-list-tile avatar>
                        General
                    </v-list-tile>
                    <v-list-group no-action sub-group value="true" prepend-icon="remove">
                        <v-list-tile slot="activator">
                            <v-list-tile-title><label>Country Strategic Papers</label> </v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile v-for="(item, i) in documents.strategy" :key="i" @click="goTo(item.metadata.url)">
                            <v-list-tile-title v-text="item.metadata.operational_center"></v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile-action>
                            <a class="form-actions" @click="openDetailsModal('link', 'strategy')">add link</a>
                        </v-list-tile-action>
                        <v-list-tile-action>
                            <a class="form-actions" @click="openDetailsModal('file', 'strategy')">upload file</a>
                        </v-list-tile-action>
                    </v-list-group>
                </v-list>
            </v-navigation-drawer>
            <v-dialog v-model="dialog" max-width="500px" transition="dialog-transition">
                <v-card>
                    <v-card-text>
                        <v-layout row wrap  class="create-wrapper" v-if="this.details.type == 'file'">
                            <v-flex xs5 class="label-blocks">
                                <label> Description </label>
                                <v-text-field v-model="details.metadata.description"></v-text-field>
                            </v-flex>
                            <v-flex xs5 class="label-blocks">
                                <label> Attach file </label>
                                <v-card class="file-attachment" v-if="previewFileUrl">
                                    <v-icon @click='removeFile()' class="remove-file-icon"> close </v-icon>
                                    <embed :src="previewFileUrl" width="100%" height="100%"></embed>
                                </v-card>
                                <v-card class="file-attachment" light v-else>
                                    <form enctype="multipart/form-data">
                                      <input id="fileUpload" style="display: none" ref="mymyUpload" type="file" accept="*/*" multiple @change="onFilePicked"/>
                                      <v-icon @click='pickFile' class="file-icon"> attach_file </v-icon>
                                      <v-btn v-if="readyToUpload" label="upload" @click="processFiles" ></v-btn>
                                    </form>
                                </v-card>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap v-else>
                            <v-flex xs6>
                                <v-select :items="allOCs" v-model="details.metadata.operational_center" label="Operational Center"></v-select>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field prepend-icon="link" name="url" label="link" v-model="details.metadata.url"></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="active" @click="submit">add</v-btn>
                    </v-card-actions>
                </v-card>

            </v-dialog>
            <iframe style="height:78vh; width:calc(100% - 221px);" :src="CIAWorldFactbookUrl"></iframe>
        </v-layout>
    </v-container>
</template>

<script>
/*eslint no-debugger: off*/
/*eslint no-console: off*/

import $ from 'jquery';
import { mapGetters } from 'vuex';
import { FETCH_EVENT, FETCH_COUNTRY_DETAILS, CREATE_COUNTRY_DETAILS, EDIT_COUNTRY_DETAILS, DELETE_COUNTRY_DETAILS, FETCH_UPLOAD_URL, PUT_SIGNED_REQUEST } from '@/store/actions.type';
import { OPERATIONAL_CENTERS } from '@/common/response-fields';
import { DEFAULT_COUNTRY_DETAILS_ROW } from '@/common/country-details-fields';
export default {
    name: 'country-details',
    data(){
        return{
            dialog: false,
            allOCs: OPERATIONAL_CENTERS,
            selectedCountry: null,
            admins: [
                ['Management', 'people_outline'],
                ['Settings', 'settings']
            ],
            documents: {
                map: [],
                strategy: [],
                security: [],
                mission: [],
                toolbox: [],
                document_repo: []
            },

            defaultDetails: DEFAULT_COUNTRY_DETAILS_ROW,
            details: DEFAULT_COUNTRY_DETAILS_ROW,
            readyToUpload: false,
            previewFileUrl: null
        }
    },
    computed: {
        ...mapGetters([
            'eventAreas',
            'countryDetails'
        ]),
        countryCodes(){
            var tmp = this.eventAreas.map(item => item.country_code);
            return _.sortedUniq(tmp);
        },
        countries(){
            var tmp = this.eventAreas.map(item => ({country: item.country, country_code: item.country_code}));
            this.selectedCountry = tmp[0].country_code;
            return _.sortedUniq(tmp);
        },
        CIAWorldFactbookUrl(){
            var cc = this.selectedCountry ? this.selectedCountry.toLowerCase() : this.eventAreas[0].country_code.toLowerCase();
            var url = `https://www.cia.gov/library/publications/the-world-factbook/geos/${cc}.html`;
            console.log(url);
            return url
        }
    },
    watch: {
        eventAreas(val){
            if(!_.isEmpty(val)) this.fetchCountryDetails();
        },
        countryDetails(val){
            if(val){

            }
        }
    },
    mounted(){
        this.sortNavigation();
    },
    methods: {
        fetchCountryDetails(){
            this.$store.dispatch(FETCH_COUNTRY_DETAILS, {countries: this.countryCodes});
        },
        sortNavigation(){
            var vm = this;
            this.countryDetails.forEach(function(item){
                vm.documents[item.category].push(item);
            });
        },
        goTo(url){
            window.open(url, "_blank");
        },
        openDetailsModal(type, category){
            this.details.type = type;
            this.details.category = category;
            this.dialog = true;
        },
        pickFile(){
            this.$refs.mymyUpload.click();
        },
        onFilePicked(e){
            const files = e.target.files;
            const fr = new FileReader();
            fr.readAsDataURL(files[0]);
            fr.addEventListener('load', () => {
                var fileUrl = fr.result;
                this.previewFileUrl = fileUrl;
                this.readyToUpload = true;
            });
        },
        processFiles(){
            var vm = this;
            var files = this.$refs.mymyUpload.files;
            // name, size, type;
            var fileName = files[0].name;
            var fileType = files[0].type;
            var fileSize = files[0].size;
            var file = files[0];
            var params = {key: (`countryDetails/${this.selectedCountry}/${this.details.category}`), filename: fileName};
            this.$store.dispatch(FETCH_UPLOAD_URL, params)
                .then((payload) => {
                    if(payload){
                        var fileLink = payload.url;
                        vm.details.metadata.url = fileLink;
                        this.uploadFile(file);
                    }
                });
        },
        uploadFile(file){
            this.$store.dispatch(PUT_SIGNED_REQUEST,  file)
                .then((data) => {
                    console.log("PUT_SIGNED_REQUEST ----- success------- ", data);
                    this.save();
                });
        },
        removeFile(index){
            $('#fileUpload').val("");
            this.previewFileUrl = null;
        },
        submit(){
            if(this.details.type == "file"){
                this.processFiles(files);
            }else{
                this.save();
            }
        },
        save(){
            var cIndex = this.countryCodes.indexOf(this.selectedCountry);
            var countryName = this.countries[cIndex].country;

            var params = _.extend(this.details, {
                country: countryName,
                country_code: this.selectedCountry,
            });
            params.metadata = _.pickBy(params.metadata, _.identity);

            this.$store.dispatch(CREATE_COUNTRY_DETAILS, params).then((payload) =>{
                console.log(payload);
                setTimeout(() => this.close(), 1000);
            });
        },
        close () {
            this.dialog = false;
            setTimeout(() => {
                this.details = _.cloneDeep(this.defaultDetails);
                this.previewFileUrl = null
            }, 300);
        }
    }

}
</script>

<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
