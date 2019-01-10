<template>
    <v-container class="statusStepperWrapper">
        <i> You changed this event’s status to <b :class="currentStatus"> {{statusLabel}} </b>. Please revise the highlighted information. </i>
        <v-stepper v-model="eb">
          <v-stepper-header>
            <v-flex v-for="(item, i) in statusRoute" :key="i">
              <v-stepper-step :step="i" :complete="eb > i" >
                  <router-link :to="{ name:item.component, params: {reviewFields: item.fields}}" @click.native="eb = i"> {{item.section}} {{item.fields.length}}</router-link>
              </v-stepper-step>
              <v-divider v-if="i < statusRoute.length - 1"></v-divider>
            </v-flex>
            <v-spacer></v-spacer>
          </v-stepper-header>
        </v-stepper>
    </v-container>
</template>


<script>

import { EVENT_STATUSES } from '@/common/common';
import { STATUS_CHANGE_STEPPERS } from '@/common/navigational-fields.js';
/*eslint no-debugger: off*/
/*eslint no-console: off*/

export default {
    name: 'StatusStepper',
    props: {
        currentStatus:{
            type: String
        }
    },
    data(){
        return{
            eb: 0,
            allRoutes: STATUS_CHANGE_STEPPERS,
            allEventStatuses : EVENT_STATUSES,
            reviewedSection: {}
        }
    },
    computed: {
        statusRoute(){
            return this.allRoutes[this.currentStatus]
        },
        statusLabel(){
            return this.allEventStatuses.filter(item => item.value == this.currentStatus)[0].text;
        }
    },
    mounted(){
        this.mapSectionsToReview();
    },
    methods:{
        mapSectionsToReview(){
            var sectionKeys = this.allRoutes[this.currentStatus].map(item => item.section);
            var vm = this;
            sectionKeys.forEach(function(item){
                vm.reviewedSection[item] = []
            });
        }
    },
    watch: {
        currentStatus(val){
             this.mapSectionsToReview();
        }
    }
};
</script>


<style lang="scss">
    .statusStepperWrapper{
        position: fixed;
        bottom: 0;
        padding: 0;
        max-width: 100%;
        i{
            padding: 0 21px;
        }
        .v-stepper{
            background: #e8e8e8 !important;
            .v-stepper__step__step{
                background: #E5F0F9 !important;
                .v-icon{
                    color: #0374C7 !important;
                }
            }
            .router-link-active{
                color: #231F20;
            }
        }
    }

    .v-stepper__header{
        height: 56px;
        margin-left: 3%;
    }
    .v-stepper,
    .v-stepper__header{
        box-shadow: none;
    }
</style>
