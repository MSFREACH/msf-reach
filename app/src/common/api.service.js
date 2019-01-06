/*eslint no-debugger: off*/
/*eslint no-console: off*/

import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import JwtService from '@/common/jwt.service';
import { API_URL } from '@/common/config';
import { GEOFORMAT } from './common';
const ApiService = {
    init () {
        Vue.use(VueAxios, axios);
        Vue.axios.defaults.baseURL = API_URL;
        Vue.axios.defaults.withCredentials = true; 
        // axios.interceptors.response.use((response) => {
        //     console.log('interceptors----res-- ', response);
        //     return response;
        // }, (error) => {
        //     if (error.response && error.response.data && error.response.data.location) {
        //         window.location = error.response.data.location;
        //     } else {
        //         console.log('interceptors----err-- ', error);
        //         return Promise.reject(error);
        //     }
        // });
    },

    setHeader () {
        Vue.axios.defaults.headers.common['Authorization'] = `Bearer ${JwtService.getToken()}`;
    },
    query (resource, params) {
        console.log('query ------- ', params );
        return Vue.axios
            .get(resource, params)
            .catch((error) => {
                throw new Error(`[ApiService] ${error}`);
            });
    },

    get (resource, slug = '') {
        return Vue.axios
            .get(`${resource}/${slug}`)
            .catch((error) => {
                throw new Error(`[ApiService] ${error}`);
            });
    },

    post (resource, params) {
        return Vue.axios.post(`${resource}`, params);
    },

    update (resource, slug, params) {
        return Vue.axios.put(`${resource}/${slug}`, params);
    },

    put (resource, params) {
        return Vue.axios.put(`${resource}`, params);
    },

    delete (resource) {
        return Vue.axios
            .delete(resource)
            .catch((error) => {
                throw new Error(`[ApiService] ${error}`);
            });
    }
};

export default ApiService;


export const EventsService = {
    query (params) {
        params.geoformat = GEOFORMAT;
        return ApiService.query('events', params);
    },
    get (slug) {
        return ApiService.get('events', slug);
    },
    create (params) {
        return ApiService.post('events', params);
    },
    update (slug, params) {
        return ApiService.update('events', slug, params);
    },
    updateResponses (slug, params) {
        return ApiService.update(`events/${slug}/responses`, params);
    },
    updateExtCapacity (slug, params) {
        return ApiService.update(`events/${slug}/extCapacity`, params);
    },
    updateFigures (slug, params) {
        return ApiService.update(`events/${slug}/figures`, params);
    },
    updateResources (slug, params) {
        return ApiService.update(`events/${slug}/resources`, params);
    },
    archive(slug, params) {
        return ApiService.update('events', slug, params); //TODO: // check API endpoints
    },
    destroy (slug) {
        return ApiService.delete(`events/${slug}`);
    }
};

export const EventNotificationService = {
    query (params) {
        return ApiService.query('eventNotifications', {params});
    },
    create (params) {
        return ApiService.post('eventNotifications', params);
    },
    update (slug, params) {
        return ApiService.update('eventNotifications', slug, params);
    },
    destroy (slug) {
        return ApiService.delete(`eventNotifications/${slug}`);
    }
};

export const SITREPService = {
    query (params) {
        return ApiService.query('sitreps', {params});
    },
    create (params) {
        return ApiService.post('sitreps', params);
    },
    update (slug, params) {
        return ApiService.update('sitreps', slug, params);
    },
    destroy (slug) {
        return ApiService.delete(`sitreps/${slug}`);
    }
};

export const ReportsService = {
    query () {
        const params = {
            geoformat : GEOFORMAT
        };
        return ApiService.query('reports', params);
    },
    get (slug) {
        return ApiService.get('reports', slug);
    },
    create (params) {
        return ApiService.post('reports', params);
    },
    update (slug, params) {
        return ApiService.update('reports', slug, params);
    },
    archive(slug, params) {
        return ApiService.update('reports', slug, params); //TODO: // check API endpoints
    },
    destroy (slug) {
        return ApiService.delete(`reports/${slug}`);
    }
};

export const ContactsService = {
    query () {
        const params = {
            geoformat : GEOFORMAT
        };
        return ApiService.query('contacts', params);
    },
    get (slug) {
        return ApiService.get('contacts', slug);
    },
    create (params) {
        return ApiService.post('contacts', params);
    },
    update (slug, params) {
        return ApiService.update('contacts', slug, params);
    },
    archive(slug, params) {
        return ApiService.update('contacts', slug, params); //TODO: // check API endpoints
    },
    destroy (slug) {
        return ApiService.delete(`contacts/${slug}`);
    }
};

export const UtilService = {
    getUpload(payload){
        const params = {
            key: payload.key,
            filename: payload.filename
        };
        return ApiService.query('utils/uploadurl', {params: params});
    },
    signedUpdate(params){
        return axios.put(params.url, [params.file], {
            transformRequest: [(data, headers) => {
                delete headers.common.Authorization;
                return data;
            }]
        });
    }
};
