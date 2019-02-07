/*eslint no-debugger: off*/
/*eslint no-console: off*/

import Vue from 'vue';
import { CountryDetailService } from '@/common/api.service';
import { FETCH_COUNTRY_DETAILS, CREATE_COUNTRY_DETAILS, EDIT_COUNTRY_DETAILS, DELETE_COUNTRY_DETAILS } from './actions.type';
import { FETCH_COUNTRY_DETAILS_START, FETCH_COUNTRY_DETAILS_END, SET_ERROR, RESET_STATE } from './mutations.type';

const initialState = {
    countryDetails: []
};

const state = Object.assign({}, initialState);

const actions = {
    [FETCH_COUNTRY_DETAILS](context, countries, prevCountryDetails){

    }
}
