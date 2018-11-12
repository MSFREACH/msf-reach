<template>
    <v-layout app row wrap>
        <nav>
            <v-btn small flat v-for="(item, index) in secondLevel" :key="index">
                <router-link :to="{ name: item.name, params: {'slug': $route.params.slug }}"> {{ item.label }}</router-link>
            </v-btn>
        </nav>
        <router-view></router-view>
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
            contents: ['Event Details', 'News Feed', 'Related Contacts', 'Country Details', 'Related Response'],
            secondLevel : [
                {
                    name: 'event',
                    label: 'Event Details'
                }, {
                    name: 'newsfeed',
                    label: 'News Feed'
                }, {
                    name: 'event', // placeholders
                    label: 'Related Contacts'
                }, {
                    name: 'event', // placeholders
                    label: 'Country Details'
                }, {
                    name: 'event', // placeholders
                    label: 'Related Response'
                }
            ]
        };
    },
    methods: {

    },
    components: {

    },
};
</script>
