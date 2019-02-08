/*eslint no-debugger: off*/
/*eslint no-console: off*/

import Vue from 'vue';

import { CountryDetailsService } from '@/common/api.service';
import { FETCH_COUNTRY_DETAILS, CREATE_COUNTRY_DETAILS, EDIT_COUNTRY_DETAILS, DELETE_COUNTRY_DETAILS } from './actions.type';
import { FETCH_COUNTRY_DETAILS_START, FETCH_COUNTRY_DETAILS_END, SET_ERROR, RESET_STATE } from './mutations.type';

const initialState = {
    isLoadingDetails: false,
    countryDetails: []
};

const state = Object.assign({}, initialState);

const actions = {
    [FETCH_COUNTRY_DETAILS]({ commit }, params){
        commit(FETCH_COUNTRY_DETAILS_START);
        console.log(' -----FETCH_COUNTRY_DETAILS ----  ', params );
        return CountryDetailsService.query(params)
            .then(({ data }) => {
                commit(FETCH_COUNTRY_DETAILS_END, data.result);
            })
            .catch((error) => {
                commit(SET_ERROR, error);
            });
    },
    [CREATE_COUNTRY_DETAILS](context, payload){
        return CountryDetailsService.create(payload);
    },
    [EDIT_COUNTRY_DETAILS](payload){
        var id = payload.id;
        delete payload.id;
        return CountryDetailsService.update(id, payload);
    },
    [DELETE_COUNTRY_DETAILS](context, slug){
        return CountryDetailsService.destroy(slug);
    }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
    [FETCH_COUNTRY_DETAILS_START] (state) {
        state.isLoadingDetails = true;
    },
    [FETCH_COUNTRY_DETAILS_END](state, payload){
        console.log(payload);
        state.countryDetails = payload;
    },
    [SET_ERROR] (state, error) {
        state.errors = error;
        state.isLoadingEvent = false;
    },
    [RESET_STATE] () {
        for (let f in state){
            Vue.set(state, f, initialState[f]);
        }
    }
};

const getters ={
    countryDetails(state){
        return state.countryDetails;
    }
};

export default {
    state, getters, actions, mutations
};
