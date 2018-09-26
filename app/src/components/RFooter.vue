<template>
    <v-footer height="auto" color="primary lighten-1">
        <v-layout row wrap>
        <v-btn v-for="link in links" :key="link" color="white" flat round> {{ link }} </v-btn>
        <v-flex primary lighten-2 py-3 text-xs-center white--text xs12>
            &copy;2018 — <strong>MSF REACH</strong>
        </v-flex>
        </v-layout>
    </v-footer>
</template>

<script>
    export default {
        name: 'RFooter',
        data: () => ({
            links: [
                'Home',
                'About Us',
                'FAQ',
                'Services',
                'Contact Us'
            ]
        })
    };
</script>
