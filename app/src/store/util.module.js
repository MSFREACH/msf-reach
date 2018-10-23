import _ from 'lodash';
import { UtilService } from '@/common/api.service';
import { FETCH_UPLOAD_URL, PUT_SIGNED_REQUEST } from './actions.type';
import { FETCH_START, FETCH_UPLOAD_URL_END,  } from './mutations.type';

/*eslint no-unused-vars: off*/

const state = {
    requestData: null,
    isUploadingImage: false
};

const getters = {
    requestData(state){
        return state.requestData;
    }
};

const actions = {
    [FETCH_UPLOAD_URL]({commit}, params){
        commit(FETCH_START);
        return UtilService.getUpload(params)
            .then(({ data }) =>{
                commit(FETCH_UPLOAD_URL_END, data.result);
            });
    },

    [PUT_SIGNED_REQUEST]({commit}, params){
        commit(FETCH_START);
        return UtilService.signedUpdate(params);
    }
};

const mutations = {
    [FETCH_UPLOAD_URL_END] (state, result){
        state.requestData = result;
    }
};

export default {
    state, getters, actions, mutations
};
