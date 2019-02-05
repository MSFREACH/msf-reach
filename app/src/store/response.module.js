/*eslint no-debugger: off*/
/*eslint no-unused-vars :off*/
/*eslint no-console :off*/

import _ from 'lodash';
import { ResponsesService } from '@/common/api.service';
import { FETCH_MSF_RESPONSES, CREATE_MSF_RESPONSE,  EDIT_MSF_RESPONSE, EDIT_MSF_RESPONSE_AREA, DELETE_MSF_RESPONSE, SET_RESPONSE_AREA_GEOMETRY } from './actions.type';
import { FETCH_RESPONSES_START, FETCH_RESPONSES_END, UPDATE_RESPONSE_IN_LIST, UPDATE_RESPONSE_AREA_GEOMETRY, SET_ERROR, RESET_STATE } from './mutations.type';

const initialState = {
    errors: null,
    responses: [],
    isLoadingResponse: true,
    responsesCount: 0,
    responsesGeoJson: [],
    response: {
        area: {}
    }
};

const state = Object.assign({}, initialState);

const getters = {
    responsesCount(state){
        return state.responsesCount;
    },
    responses(state){
        return state.responses;
    },
    response(state){
        return state.response;
    },
    responsesGeoJson(state){
        return state.responsesGeoJson;
    },
    isLoadingResponse(state){
        return state.isLoadingResponse;
    },
    fetchResponsesError(state){
        return state.error;
    }
};

const actions = {
    [FETCH_MSF_RESPONSES] ({ commit }, params){
        commit(FETCH_RESPONSES_START);
        return ResponsesService.query(params)
            .then(({ data }) => {
                commit(FETCH_RESPONSES_END, data.result);
            })
            .catch((error) => {
                commit(SET_ERROR, error);
            });
    },
    [CREATE_MSF_RESPONSE] (context, params){
        // TODO: geojson for location validation
        return ResponsesService.create(params);
    },
    [EDIT_MSF_RESPONSE] (context, params){
        console.log('[EDIT_MSF_RESPONSE] --- -', params);
        var slug = params.id;
        delete params.id;
        return ResponsesService.update(slug, params);
    },
    [EDIT_MSF_RESPONSE_AREA] (context, params){
        console.log('[EDIT_MSF_RESPONSE] --- -', params);
        var slug = params.id;
        delete params.id;
        return ResponsesService.updateArea(slug, params);
    },
    [DELETE_MSF_RESPONSE] (context, slug){
        return ResponsesService.destroy(slug);
    },
    [SET_RESPONSE_AREA_GEOMETRY]({ commit }, params){
        commit(UPDATE_RESPONSE_AREA_GEOMETRY, params);
    }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
    [FETCH_RESPONSES_START] (state) {
        state.isLoadingResponse = true;
    },
    [FETCH_RESPONSES_END] (state, payload){
        console.log(payload); //eslint-disable-line no-console
        state.responsesGeoJson = payload;
        state.responses = _.map(payload.objects.output.geometries, function(item){
            return item.properties;
        });
        state.responsesCount = payload.objects.output.geometries.length;
        state.isLoadingResponse = false;
    },
    [UPDATE_RESPONSE_IN_LIST] (state, data){
        state.responses = state.responses.map((response) => {
            if(response.slug !== data.slug) { return response; }
            // shallow copy the data in case
            response.metadata = data.metadata;
            return response;
        });
    },
    [UPDATE_RESPONSE_AREA_GEOMETRY](state, data){
        state.response.area = data.area;
    },
    [SET_ERROR] (state, error) {
        state.errors = error;
        state.isLoadingResponse = false;
    },
    [RESET_STATE] () {
        for (let f in state){
            Vue.set(state, f, initialState[f]);
        }
    }
};

export default {
    state, getters, actions, mutations
};
