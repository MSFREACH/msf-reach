<template>
    <v-stepper v-model="eb">
      <v-stepper-header>
        <v-flex v-for="(item, i) in statusRoute" :key="i">
          <v-stepper-step :step="i" :complete="eb > i">
              <router-link :to="{ name:item.component, params: {reviewFields: item.fields}}"> {{item.section}} {{item.fields.length}}</router-link>
               <!-- <span v-if="reviewedSection[item.section]">{{reviewedSection[item.section].length}} </span>  -->
          </v-stepper-step>
          <v-divider v-if="i < statusRoute.length - 1"></v-divider>
        </v-flex>
      </v-stepper-header>
    </v-stepper>

</template>


<script>

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
            reviewedSection: {}
        }
    },
    computed: {
        statusRoute(){
            return this.allRoutes[this.currentStatus]
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
    .v-stepper{
        .router-link-active{
            color: #231F20;
        }
        .v-stepper__label{
            color: #231F20;
        }
    }
</style>
