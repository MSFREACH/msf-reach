import _ from 'lodash';
import { UtilService } from '@/common/api.service';
import { FETCH_UPLOAD_URL, PUT_SIGNED_REQUEST } from './actions.type';
import { FETCH_URL_START, FETCH_UPLOAD_URL_END, UPLOAD_START, UPLOAD_END  } from './mutations.type';

/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/

const state = {
    requestData: null,
    isRequestingSignedUrl: false,
    isUploadingImage: false
};

const getters = {
    requestData(state){
        return state.requestData;
    }
};

const actions = {
    [FETCH_UPLOAD_URL]({commit}, params){
        commit(FETCH_URL_START);
        return UtilService.getUpload(params)
            .then(({ data }) =>{
                commit(FETCH_UPLOAD_URL_END, data);
                return data;
            });
    },

    [PUT_SIGNED_REQUEST]({commit}, file){
        commit(UPLOAD_START);
        const params = {
            url: state.requestData.signedRequest,
            file: file
        };
        return UtilService.signedUpdate(params)
            .then(({ data }) =>{
                commit(UPLOAD_END, data);
                return data;
            });
    }
};

const mutations = {
    [UPLOAD_START](state){
        state.isUploadingImage = true;
    },
    [UPLOAD_END](state){
        state.isUploadingImage = false;
    },
    [FETCH_URL_START](state){
        state.isRequestingSignedUrl = true;
    },
    [FETCH_UPLOAD_URL_END] (state, result){
        state.isRequestingSignedUrl = false;
        state.requestData = result;
    }
};

export default {
    state, getters, actions, mutations
};
