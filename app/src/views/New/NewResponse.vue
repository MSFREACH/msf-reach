<template>
  <v-layout row wrap>
      <v-dialog v-model="dialog" persistent max-width="880px" hide-overlay>
          <v-btn slot="activator" fab small flat :size="40">
              <v-icon> add </v-icon>
          </v-btn>
          <template>
              <v-stepper v-model="r1">
                  <v-stepper-header flat>
                      <v-stepper-step :complete="r1 > 1" step="1">Response area <small>map</small></v-stepper-step>
                      <v-divider></v-divider>
                      <v-stepper-step :complete="r1 > 2" step="2">Information <small>metadata</small></v-stepper-step>
                      <v-spacer></v-spacer>
                      <v-icon class="action-link" @click="close">close</v-icon>
                  </v-stepper-header>
                  <v-stepper-items>
                    <v-stepper-content step="1">
                      <map-input ref="responseMapEntry" :coordinates="eventCoordinates"></map-input>
                      <v-btn class="right" round flat @click="r1 = 2"> Continue</v-btn>
                    </v-stepper-content>
                    <v-stepper-content step="2">
                        <v-container grid-list-md class="create-wrapper">
                            <v-layout row wrap>
                                <div class="row-spacing">
                                    <label class="mb-2">Project Code</label>
                                    <div class="round-borders pc">
                                        <v-select :items="allOperationalCenters" v-model="newResponse.operational_center" placeholder="OC"></v-select>
                                        <input type="text"  v-model="newResponse.project_code" placeholder="######" />
                                    </div>
                                </div>
                                <hr class="row-divider"/>
                                <div class="one-half">
                                    <label>Response</label>
                                    <v-flex d-flex>
                                        <v-select :items="allResponseTypes" label="type" v-model="newResponse.metadata.type"></v-select>
                                    </v-flex>
                                    <v-textarea solo label="description" v-model="newResponse.metadata.description" auto-grow background-color="white" color="secondary"></v-textarea>
                                </div>

                                <div class="one-half">
                                    <div class="dateRange">
                                        <div class="one-half">
                                            <label>Start date</label>
                                            <v-menu ref="startDateSelected" :close-on-content-click="false" v-model="selectedDate.start" lazy transition="scale-transition" offset-y full-width>
                                                <v-text-field slot="activator" v-model="selectedDate.startValue" persistent-hint type="date"></v-text-field>
                                                <v-date-picker v-model="selectedDate.startValue" no-title @input="selectedDate.start = false"></v-date-picker>
                                            </v-menu>
                                        </div>
                                        <div class="one-half">
                                            <label>End date</label>
                                            <v-menu ref="endDateSelected" :close-on-content-click="false" v-model="selectedDate.end" lazy transition="scale-transition" offset-y full-width>
                                                <v-text-field slot="activator" v-model="selectedDate.endValue" persistent-hint type="date"></v-text-field>
                                                <v-date-picker v-model="selectedDate.endValue" no-title @input="selectedDate.end = false"></v-date-picker>
                                            </v-menu>
                                        </div>
                                    </div>
                                </div>

                                <v-text-field class="linkAttachment round-borders" xs12 v-model="newResponse.metadata.sharepoint_link" single-line prepend-icon="link" label="Sharepoint link"></v-text-field>
                            </v-layout>
                        </v-container>
                        <v-btn round flat @click="r1 = 1">back</v-btn>
                        <v-progress-circular v-if="inProgress" :indeterminate="true"></v-progress-circular>
                        <v-btn class="right" round flat @click.native="save">Create</v-btn>
                    </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
          </template>
      </v-dialog>
  </v-layout>
</template>

<script>
/*eslint no-debugger: off*/
/*eslint no-console: off*/
import { mapGetters } from 'vuex';
import { CREATE_MSF_RESPONSE} from '@/store/actions.type';
import { RESPONSE_TYPES, REPONSE_PROGRAMME_TYPES, DEFAULT_RESPONSE_PROGRAMME,  RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES, RESPONSE_NCDS_PROGRAMMES,  OPERATIONAL_CENTERS } from '@/common/response-fields';
import MapInput from '@/views/Map/MapInput.vue';

import { DEFAULT_MSF_RESPONSE } from '@/common/form-fields';

export default {
    name: 'new-response',
    data: () => ({
        r1: 0,
        dialog: false,
        allProgrammes: REPONSE_PROGRAMME_TYPES,
        defaultProgram: DEFAULT_RESPONSE_PROGRAMME,
        allResponseTypes: RESPONSE_TYPES,
        subProgrammes: {
            infectious_diseases: RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES,
            ncds: RESPONSE_NCDS_PROGRAMMES
        },
        allOperationalCenters: OPERATIONAL_CENTERS,
        defaultResponse: DEFAULT_MSF_RESPONSE,
        programOpenDate: false,
        newResponse: DEFAULT_MSF_RESPONSE,
        selectedDate:{
            start: false,
            startValue: null,
            end: false,
            endValue: null
        },
        inProgress: false
    }),
    components:{
        MapInput
    },
    watch:{
        dialog(val){
            if(val){
                var vm = this;
                setTimeout(function(){
                    vm.$refs.responseMapEntry.resizeMap(); }, 100);
                this.e1 = 1;
                this.newResponse = this.defaultResponse;
            }
        },
        r1(val){
        }
    },
    methods:{

        save(){
            this.lintDates();
            this.newResponse.event_id = this.$route.params.slug;
            this.newResponse.event_status = this.eventStatus;
            this.newResponse.area = this.response.area;
            this.inProgress = true;
            var vm = this;
            this.$store.dispatch(CREATE_MSF_RESPONSE, this.newResponse).then((payload) => {
                var responseID = payload.data.result.objects.output.geometries[0].properties.id;
                this.inProgress = false;
                this.$router.push({
                    name: 'event-responses',
                    params: { slug:  vm.$router.params.slug}
                });
                setTimeout(() => vm.close(), 1000);
            });

        },
        close(){
            // for (var fields in this.newResponse) delete this.newResponse[fields];
            this.newResponse = _.cloneDeep(this.defaultResponse);
            this.dialog = false;
        },
        lintDates(){
            if(this.selectedDate.startValue){
                var startDate = new Date(this.selectedDate.startValue);
                this.newResponse.metadata.start_date = startDate.toISOString();
            }
            if(this.selectedDate.endValue){
                var endDate = new Date(this.selectedDate.endValue);
                this.newResponse.metadata.end_date = endDate.toISOString();
            }
        }
    },
    computed: {
        ...mapGetters([
            'response',
            'eventStatus',
            'eventCoordinates'
        ])
    }

}
</script>

<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
