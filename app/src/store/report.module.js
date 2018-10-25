/*eslint no-debugger: off*/
/*eslint no-unused-vars :off*/
import _ from 'lodash';
import { ReportsService } from '@/common/api.service';
import { FETCH_REPORTS, CREATE_REPORT, EDIT_REPORT, DELETE_REPORT } from './actions.type';
import { FETCH_REPORTS_START, FETCH_REPORTS_END, UPDATE_REPORT_IN_LIST, SET_ERROR } from './mutations.type';

const state = {
    errors: null,
    reports: [],
    isLoadingReport: true,
    reportsCount: 0
};

const getters = {
    reportsCount(state){
        return state.reportsCount;
    },
    reports(state){
        return state.reports;
    },
    isLoadingReport(state){
        return state.isLoadingReport;
    },
    fetchReportsError(state){
        return state.error;
    }
};

const actions = {
    [FETCH_REPORTS] ({ commit }, params){
        commit(FETCH_REPORTS_START);
        return ReportsService.query()
            .then(({ data }) => {
                commit(FETCH_REPORTS_END, data.result);
            })
            .catch((error) => {
                commit(SET_ERROR, error);
            });
    },
    [CREATE_REPORT] (context, params){
        return ReportsService.create(params);
    },
    [EDIT_REPORT] (context, params){
        console.log('[EDIT_REPORT] ----- ', params); //eslint-disable-line no-console
        return ReportsService.update(params[0], params[1]);
    },
    [DELETE_REPORT] (context, slug){
        return ReportsService.destroy(slug);
    }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
    [FETCH_REPORTS_START] (state) {
        state.isLoadingReport = true;
    },
    [FETCH_REPORTS_END] (state, payload){
        // TODO: // // Add popups see: [mapAllReports] parse GeoJSON here
        console.log(payload); //eslint-disable-line no-console
        state.reports = _.map(payload.objects.output.geometries, function(item){
            return item.properties;
        });
        state.reportsCount = payload.objects.output.geometries.length;
        state.isLoadingReport = false;
    },
    [UPDATE_REPORT_IN_LIST] (state, data){
        state.reports = state.reports.map((report) => {
            if(report.slug !== data.slug) { return report; }
            // shallow copy the data in case
            report.metadata = data.metadata;
            return report;
        });
    },
    [SET_ERROR] (state, error) {
        state.isLoadingReport = false;
        state.errors = error;
    }
};

export default {
    state, getters, actions, mutations
};
