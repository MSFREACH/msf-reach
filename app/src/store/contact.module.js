/*eslint no-debugger: off*/
/*eslint no-unused-vars :off*/
import _ from 'lodash';
import { ContactsService } from '@/common/api.service';
import { FETCH_CONTACTS } from './actions.type';
import { FETCH_CONTACTS_START, FETCH_CONTACTS_END, UPDATE_CONTACT_IN_LIST, SET_ERROR } from './mutations.type';

const state = {
    errors: null,
    contacts: [],
    isLoadingContact: true,
    contactsCount: 0
};

const getters = {
    contactsCount(state){
        return state.contactsCount;
    },
    contacts(state){
        return state.contacts;
    },
    isLoadingContact(state){
        return state.isLoadingContact;
    },
    fetchContactsError(state){
        return state.error;
    }
};

const actions = {
    [FETCH_CONTACTS] ({ commit }, params){
        commit(FETCH_CONTACTS_START);
        return ContactsService.query()
            .then(({ data }) => {
                commit(FETCH_CONTACTS_END, data.result);
            })
            .catch((error) => {
                commit(SET_ERROR, error);
            });
    }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
    [FETCH_CONTACTS_START] (state) {
        state.isLoadingContact = true;
    },
    [FETCH_CONTACTS_END] (state, payload){
        // TODO: // // Add popups see: [mapAllContacts] parse GeoJSON here
        console.log('Fetched contacts ------ ',  payload); //eslint-disable-line no-console
        state.contacts = _.map(payload.objects.output.geometries, function(item){
            return item;
        });
        state.contactsCount = payload.objects.output.geometries.length;
        state.isLoadingContact = false;
    },
    [UPDATE_CONTACT_IN_LIST] (state, data){
        state.contacts = state.contacts.map((contact) => {
            if(contact.slug !== data.slug) { return contact; }
            // shallow copy the data in case
            contact.metadata = data.metadata;
            return contact;
        });
    },
    [SET_ERROR] (state, error) {
        state.errors = error;
        state.isLoadingContact = false;
    }

};

export default {
    state, getters, actions, mutations
};
