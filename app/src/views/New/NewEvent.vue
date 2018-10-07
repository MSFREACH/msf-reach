<template>
    <v-layout row justify-center>
        <v-dialog v-model="dialog" persistent max-width="1200px">
            <v-btn slot="activator" color="primary">
                <v-icon> add </v-icon> new event
            </v-btn>
            <v-card>
                <v-card-title>
                    <span class="headline"> Create new event</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                                <v-text-field label="Name" required></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field label="Description" hint="example of helper text only on focus"></v-text-field>
                            </v-flex>
                            <v-layout v-for="(item, index) in allEventTypes" v-model="checkedTypes" :key="index" :value="item.value" :id="'ev-type'+index">
                                <v-flex xs3>
                                    <v-checkbox :label="item.text"></v-checkbox>
                                </v-flex>
                                <v-layout v-if="item.subTypes && checkedTypes.indexOf(item.value) != -1">
                                    <v-flex xs3 v-if="item.subTypes" :id="item.value + index" v-for="(sub, index) in item.subTypes" :key="index">
                                        <v-checkbox v-model="checkedSubTypes" :value="sub.value" :id="'ev-sub-'+(sub.text)+index" :label="sub.text" />
                                    </v-flex>
                                </v-layout>
                            </v-layout>

                            <v-flex xs12>
                                <v-text-field label="Email" required></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field label="Password" type="password" required></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm6>
                                <v-select :items="statuses" label="Status" required></v-select>
                            </v-flex>
                            <v-flex xs12 sm6>
                                <v-autocomplete :items="allEventTypes" label="Types" multiple chips></v-autocomplete>
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="dialog = false">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>


<script>
import { EVENT_TYPES, EVENT_STATUSES } from '@/common/common';

export default {
    name: 'new-event',
    data: () => ({
        dialog: false,
        allEventTypes: EVENT_TYPES,
        statuses: EVENT_STATUSES,
        checkedTypes:[],
        checkedSubTypes: [],
        otherFields: {
            type: {
                isSelected: false,
                description: ''
            },
            disease_outbreak: {
                isSelected: false,
                description: ''
            },
            natural_disaster: {
                isSelected: false,
                description: ''
            }
        },
    })
};
</script>
