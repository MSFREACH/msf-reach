<template>
    <v-layout>
        <v-tabs v-model="active" slider-color="black">
            <v-tab v-for="n in contents" :key="n" ripple>
                {{ n }}
            </v-tab>
            <v-tab-item v-for="n in contents" :key="n">
                <router-view></router-view>
            </v-tab-item>
        </v-tabs>
    </v-layout>
</template>

<script>

// import REvent from '@/components/Event.vue';
// import NewsFeed from '@/components/NewsFeed.vue';
// import RelatedContacts from '@/components/Contacts/RelatedContacts.vue';
// import CountryDetails from '@/components/CountryDetails.vue';
// import RelatedResponses from '@/components/RelatedResponses.vue';

export default {
    name: 'EventNav',
    data () {
        return {
            active: null,
            contents: ['Event Details', 'News Feed', 'Related Contacts', 'Country Details', 'Related Response']
        };
    },
    methods: {

    },
    components: {

    },
};
</script>
