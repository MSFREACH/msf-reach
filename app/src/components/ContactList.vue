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
                <v-flex slot="item" slot-scope="props" xs12 mb3>
                    <v-list-tile @click="expanded[props.item.properties.id] = !expanded[props.item.properties.id]">
                        <v-list-tile-title> {{ props.item.properties.properties.name }} </v-list-tile-title>
                        <v-list-tile-sub-title v-show="props.item.properties.properties.type" small outline color="primary"> {{ props.item.properties.properties.type }} </v-list-tile-sub-title>
                        <v-chip v-if="props.item.properties.properties.speciality"
                        v-for="(item, index) in props.item.properties.properties.speciality.split(',')"
                        :key="index" small label> {{ item }} </v-chip>
                    </v-list-tile>
                    <v-list three-line>
                        <v-expansion-panel :key="props.item.properties.id" v-show="expanded[props.item.properties.id]">
                            <v-expansion-panel-content v-model="expanded[props.item.properties.id]">
                                <v-card>

                                    <v-card-title>{{ props.item.coordinates }} </v-card-title>
                                    <v-card-text> {{ props.item.properties }} </v-card-text>
                                    <v-card-actions>
                                        <v-icon>phone</v-icon>
                                        <span>Mobile: {{ props.item.properties.properties.cell }} </span>
                                        <span>Work: {{ props.item.properties.properties.work }} </span>
                                        <span>Home: {{ props.item.properties.properties.home }} </span>
                                        <v-btn v-if="props.item.properties.properties.WhatsApp">
                                            <span class="mdi mdi-whatsapp" v-if="checkEqual( props.item.properties.properties.cell, props.item.properties.properties.WhatsApp)"></span>
                                            <span class="mdi mdi-whatsapp" v-else> {{props.item.properties.properties.WhatsApp }} </span>
                                        </v-btn>
                                        <v-btn v-if="props.item.properties.properties.Telegram">
                                            <span class="mdi mdi-telegram" v-if="checkEqual( props.item.properties.properties.cell, props.item.properties.properties.Telegram)"> </span>
                                            <span class="mdi mdi-telegram" v-else> else {{ props.item.properties.properties.Telegram }}  </span>
                                        </v-btn>
                                    </v-card-actions>
                                    <v-card-text v-if="props.item.properties.properties.type == 'Current MSF Staff'">
                                        {{props.item.properties.properties.OC}}
                                        {{props.item.properties.properties.employment}}
                                        {{props.item.properties.properties.additional}}
                                        {{props.item.properties.properties.job_title}}
                                    </v-card-text>
                                    <v-card-text else>
                                        <v-chip label v-show="props.item.properties.properties.msf_associate">MSF Associate </v-chip>
                                        <v-chip label v-show="props.item.properties.properties.msf_peer"> MSF Peer </v-chip>
                                        {{props.item.properties.properties.employer}}
                                        {{props.item.properties.properties.job_title}}
                                        {{props.item.properties.properties.division}}
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-icon>mail</v-icon>
                                        <span> {{ props.item.properties.properties.email }} </span>
                                        <span v-show="props.item.properties.properties.email2"> {{ props.item.properties.properties.email2 }} </span>
                                    </v-card-actions>
                                    <v-card-actions v-show="props.item.properties.properties.skype">
                                        <span class="mdi mdi-skype"></span>
                                        <span> {{ props.item.properties.properties.skype }} </span>
                                    </v-card-actions>
                                    <v-card-actions v-show="props.item.properties.properties.Instagram">
                                        <span class="mdi mdi-instagram"></span>
                                        <span> {{ props.item.properties.properties.Instagram }} </span>
                                    </v-card-actions>
                                    <v-card-actions v-show="props.item.properties.properties.address">
                                        <v-icon>location_on</v-icon>
                                        <span> {{ props.item.properties.properties.address }} </span>
                                    </v-card-actions>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-list>
                    <v-divider></v-divider>
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
            search: '',
            expanded: {}
        };
    },
    computed: {
        ...mapGetters([
            'contactsCount',
            'isLoadingContact',
            'contacts'
        ])
    },
    watch:{
        contacts(newValue){
            newValue.forEach( i => {
                this.$set(this.expanded, i.properties.id, false);
            });
        }
    },
    mounted() {
        this.fetchContacts();
    },
    methods: {
        fetchContacts(){
            this.$store.dispatch(FETCH_CONTACTS);
        },
        checkEqual(one, two){
            return one.replace(/[^0-9]/ig, '') == two.replace(/[^0-9]/ig, '');
        }
    }

};
</script>

<style lang="scss">

</style>
