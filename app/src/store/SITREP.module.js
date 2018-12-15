/*eslint no-debugger: off*/
/*eslint no-console: off*/

//**** MSF jargon  SITREP >> SITuation REPorts ***

import Vue from 'vue';
import { SITREPService } from '@/common/api.service';

import { FETCH_SITREPS, CREATE_SITREP, EDIT_SITREP, DELETE_SITREP } from './actions.type';
import { FETCH_START, FETCH_SITREPS_END, SET_ERROR, RESET_STATE } from './mutations.type';

const initialState = {
    error: null,
    sitreps: [],
    isLoadingSitReps: true,
    sitrepCount: 0,
    sitrep : {
        id: '',
        eventId: '',
        createdAt: null,
        updatedAt: null,
        description: '',
        username: '',
        files: []
    }
};


const state = Object.assign({}, initialState);
const getters = {
    sitrepCount(state){
        return state.sitrepCount;
    },
    sitreps(state){
        return state.sitreps;
    },
    fetchSitrepError(state){
        return state.error;
    }
};

const actions = {
    [FETCH_SITREPS]({commit}, params){
        commit(FETCH_START);
        return SITREPService.query(params)
            .then(({data}) =>{
                commit(FETCH_SITREPS_END, data.result);
            })
            .catch((error) =>{
                commit(SET_ERROR, error);
            });
    },
    [CREATE_SITREP] (context, params){
        return SITREPService.create(params);
    },
    [DELETE_SITREP] (context, slug){
        return SITREPService.destroy(slug);
    },
    [EDIT_SITREP](context, params){
        console.log('[EDIT_SITREP] ---- ', params);
        return SITREPService.update(params.id, params);
    }
};

/* eslint no-param-reassign: ["error", { "props": false }] */

const mutations = {
    [FETCH_START](state){
        state.isLoadingSitReps = true;
    },
    [FETCH_SITREPS_END](state, payload){
        console.log(payload);
        state.sitreps = payload;
        state.sitrepCount = payload.length;
        state.isLoadingSitReps = false;
    },
    [SET_ERROR] (state, error){
        state.error = error;
        state.isLoadingSitReps = false;
    },
    [RESET_STATE](){
        for(let f in state){
            Vue.set(state, f, initialState[f]);
        }
    }
};

export default {
    state, getters, actions, mutations
};
