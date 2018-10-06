<template>
    <v-layout row app xs12 sm6 app>
        <v-card v-if="isLoadingContact" class="event-preview">
              Loading events...
        </v-card>
        <v-container v-else>
            <v-data-iterator :items="contacts"
            content-tag="v-layout"
            :rows-per-page-items="rowsPerPageItems"
            :pagination.sync="pagination"
            no-data-text="No events found"
            :search="search"
            row wrap>
                <v-toolbar slot="header" mb2 flat>
                    <v-toolbar-title> This is a header </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                </v-toolbar>
                <v-flex slot="item" slot-scope="props" xs12>
                    <v-list three-line>
                        <v-list-tile :key="props.item.id" avatar ripple ">
                            <v-list-tile-content>
                                <v-list-tile-title> {{ props.item.properties.name }} </v-list-tile-title>
                                <v-chip v-if="props.item.status" small outline color="primary"> {{ props.item.properties.type }} </v-chip>
                                <v-chip v-else small outline> type </v-chip>
                                <v-list-tile-sub-title> {{ props.item.properties }} </v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-divider></v-divider>
                    </v-list>
                </v-flex>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-iterator>
        </v-container>
    </v-layout>
</template>
<script>
/*eslint no-debugger: off*/
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
import { mapGetters } from 'vuex';
import { FETCH_CONTACTS } from '@/store/actions.type';

export default {
    name: 'ContactList',
    props: {
        private: { // This is My contacts
            type: Boolean,
            required: false
        },
        assigned: { // This is Assigned to me
            type: Boolean,
            required: false
        }
    },
    data(){
        return {
            rowsPerPageItems: [4, 8, 12],
            pagination: {
                rowsPerPage: 4
            },
            search: ''
        };
    },
    computed: {
        ...mapGetters([
            'contactCount',
            'isLoadingContact',
            'contacts'
        ])
    },
    watch:{

    },
    mounted() {
        this.fetchContacts();
    },
    methods: {
        fetchContacts(){
            this.$store.dispatch(FETCH_CONTACTS);
        }
    }

};
</script>

<style lang="scss">

</style>
