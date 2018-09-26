import Vue from 'vue';
import App from './App';
import router from '@/router';
import store from '@/store';
import Vuetify from 'vuetify';

import { CHECK_AUTH } from '@/store/actions.type';

import ApiService from '@/common/api.service';
import DateFilter from '@/common/date.filter';
import TextFilter from '@/common/text.filter';

Vue.config.productionTip = false;
Vue.filter('date', DateFilter.dateOnly);
Vue.filter('dateTime', DateFilter.dateTime);
Vue.filter('fullDate', DateFilter.fullDate);
Vue.filter('relativeTime', DateFilter.relativeTime);

Vue.filter('capitalize', TextFilter.capitalize);
Vue.filter('noUnderscore', TextFilter.noUnderscore);

Vue.use(Vuetify);

ApiService.init();

// Ensure we checked auth before each page load.
router.beforeEach(
    (to, from, next) => {
        return Promise
            .all([store.dispatch(CHECK_AUTH)])
            .then(next);
    }
);

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
});
