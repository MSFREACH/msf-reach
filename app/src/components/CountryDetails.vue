<template>

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

        }
    },
    computed: {
        ...mapGetters([
            // eventCountries
        ])
    },
    mounted(){
        this.fetchCountyDetails();
    },
    methods: {
        fetchCountryDetails(){
            this.$store.dispatch(FETCH_COUNTRY_DETAILS);
        }
    }

}
</script>

<style lang="css">
</style>
