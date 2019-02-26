import _ from 'lodash';
import { UtilService } from '@/common/api.service';
import { FETCH_UPLOAD_URL, PUT_SIGNED_REQUEST, FETCH_DOWNLOAD_URL, FETCH_GEOJSON_POLYGON, FETCH_REVERSE_GEOCODER, FETCH_BUCKET_URLS } from './actions.type';
import { FETCH_URL_START, FETCH_UPLOAD_URL_END, FETCH_DOWNLOAD_URL_END,  UPLOAD_START, UPLOAD_END, FETCH_BUCKET_URLS_START, FETCH_BUCKET_URLS_END, FETCH_GEOJSON_POLYGON_END, FETCH_REVERSE_GEOCODER_END} from './mutations.type';

/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
/*eslint no-console: off*/

const state = {
    requestData: null,
    isRequestingSignedUrl: false,
    isUploadingFile: false,
    isRequestingBucketUrls: false,
    geoPolygon: {},
    reverseGeojson: {},
    downloadUrl: null,
    bucketUrls: []
};

const getters = {
    requestData(state){
        return state.requestData;
    },
    eventBoundary(state){
        return state.geoPolygon;
    },
    reverseGeojson(state){
        return state.reverseGeojson;
    },
    bucketUrls(state){
        return state.bucketUrls;
    },
    uploadingFile(state){
        return state.isUploadingFile; 
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
    },
    [FETCH_DOWNLOAD_URL]({commit}, params){
        commit(FETCH_URL_START);
        return UtilService.getDownload(params)
            .then(({ data }) =>{
                commit(FETCH_DOWNLOAD_URL_END, data);
                return data;
            });
    },
    [FETCH_BUCKET_URLS]({commit}, params){
        commit(FETCH_BUCKET_URLS_START);
        return UtilService.getBucketFiles(params)
            .then(({ data }) =>{
                commit(FETCH_BUCKET_URLS_END, data);
                return data;
            });
    },
    [FETCH_GEOJSON_POLYGON]({commit}, query){
        const params = {
            q: query,
            polygon_geojson: 1,
            format: 'json'
        };
        return UtilService.getGeojsonPolygon(params)
            .then(({ data }) =>{
                commit(FETCH_GEOJSON_POLYGON_END, data);
                return data;
            });
    },

    [FETCH_REVERSE_GEOCODER]({commit}, coordinate){
        return UtilService.getReverseGeocoder(coordinate)
            .then(({ data }) =>{
                commit(FETCH_REVERSE_GEOCODER_END, data);
                return data;
            });
    }
};

const mutations = {
    [UPLOAD_START](state){
        state.isUploadingFile = true;
    },
    [UPLOAD_END](state){
        state.isUploadingFile = false;
    },
    [FETCH_URL_START](state){
        state.isRequestingSignedUrl = true;
    },
    [FETCH_UPLOAD_URL_END] (state, result){
        state.isRequestingSignedUrl = false;
        state.requestData = result;
    },
    [FETCH_BUCKET_URLS_START](state){
        state.isRequestingBucketUrls = true;
    },
    [FETCH_BUCKET_URLS_END] (state, result){
        state.isRequestingBucketUrls = false;
        state.bucketUrls = result;
    },
    [FETCH_DOWNLOAD_URL_END](state, result){
        state.downloadUrl = result;
    },
    [FETCH_GEOJSON_POLYGON_END] (state, result){
        var polygon = _.find(result, function(o) { return (o.geojson.type == 'Polygon' || ( o.geojson.type =='MultiPolygon') ); });
        state.geoPolygon = polygon;
    },
    [FETCH_REVERSE_GEOCODER_END] (state, result){
        state.reverseGeojson = result;
    }
};

export default {
    state, getters, actions, mutations
};
