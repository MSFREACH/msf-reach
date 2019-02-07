<template>
    <v-container class="relatedContent">
        <v-navigation-drawer stateless>
            <v-list>
                <v-list-tile>
                    <v-select :items="countries" v-model="selectedCountry" label="Country"></v-select>
                </v-list-tile>
                <v-list-tile avatar>
                    General
                </v-list-tile>
                <v-list-group no-action sub-group value="true">
                    <v-list-tile slot="activator">
                        <v-list-tile-title>Country Strategic Papers </v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile v-for="(admin, i) in admins" :key="i" @click="">
                        <v-list-tile-title v-text="admin[0]"></v-list-tile-title>
                        <v-list-tile-action>
                          <v-icon v-text="admin[1]"></v-icon>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list-group>
            </v-list>
        </v-navigation-drawer>


    </v-container>
</template>

<script>
/*eslint no-debugger: off*/
/*eslint no-console: off*/

import { mapGetters } from 'vuex';
import { FETCH_COUNTRY_DETAILS } from '@/store/actions.type';

export default {
    name: 'country-details',
    data(){
        return{
            selectedCountry: null,
            admins: [
                ['Management', 'people_outline'],
                ['Settings', 'settings']
            ]
        }
    },
    computed: {
        ...mapGetters([
            'eventAreas'
        ]),
        countryCodes(){
            var tmp = this.eventAreas.map(item => item.country_code);
            return _.sortedUniq(tmp);
        },
        countries(){
            var tmp = this.eventAreas.map(item => item.country);
            return _.sortedUniq(tmp);
        }
    },
    mounted(){
        this.fetchCountryDetails();
    },
    methods: {
        fetchCountryDetails(){
            this.$store.dispatch(FETCH_COUNTRY_DETAILS, this.countryCodes);
        }
    }

}
</script>

<style lang="css">
</style>
