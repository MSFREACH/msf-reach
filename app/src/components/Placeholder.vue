<template>
    <v-container grid-list-md>
        <v-layout>
            <v-flex>
                <h1>  Under Construction </h1>
            </v-flex>
        </v-layout>
    </v-container>

</template>

<script>
export default {
    name: 'placeholder',
    props: {
        name: {
            type: String,
            required: true
        }
    }
};
</script>

<style lang="scss">
@import '@/assets/css/lists.scss';

    h1{
        text-transform: uppercase;
        text-align: centered;
        font-size: 120px;
        color: #fff;
        opacity: .4;
        background: #D0D3Da;
        border-radius: 10px;
        margin: 2em auto;
        position: relative;
        padding: .5em;
    }
</style>
