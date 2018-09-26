<template>
    <v-app id="app">
        <r-header> </r-header>
        <router-view></router-view>
        <!-- <r-footer></r-footer> -->
    </v-app>
</template>

<script>
import RHeader from '@/components/RHeader';
import RFooter from '@/components/RFooter';

/*eslint no-debugger: off*/

export default {
    name: 'App',
    components:{
        RHeader, RFooter
    },
    message: 'Hello Vue!'
};

</script>

<style lang="scss">
    @import '@/assets/css/main.scss';

</style>
