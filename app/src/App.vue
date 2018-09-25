<template>
    <div id="app">
        <r-header> </r-header>
        <router-view></router-view>
        <r-footer></r-footer>
    </div>
</template>

<script>
import RHeader from '@/components/RHeader';
import RFooter from '@/components/RFooter';
import datePicker from 'vue-bootstrap-datetimepicker';


// Vue.component('date-picker', VueBootstrapDatetimePicker.default);

export default {
    name: 'App',
    components:{
        RHeader, RFooter, datePicker
    },
    message: 'Hello Vue!'
};

</script>

<style lang="scss">
    @import '@/assets/css/main.scss';

</style>
