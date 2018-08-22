<template>
    <div id = "app">
        <r-header> </r-header>
        <router-view></router-view>
        <r-footer></r-footer>
    </div>
</template>

<script>
    import RHeader from '@/components/RHeader';
    import RFooter from '@/components/RFooter';

    export default {
        name: 'App',
        components:{
            RHeader, RFooter
        }
    };
</script>

<style>

</style>
