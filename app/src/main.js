import Vue from 'vue';
import App from './App';
import router from '@/router';
import store from '@/store';
import { CHECK_AUTH } from '@/store/actions.type';

import ApiService from '@/common/api.service';
import DateFilter from '@/common/date.filter';

Vue.config.productionTip = false;
Vue.filter('date', DateFilter.dateOnly);
Vue.filter('fullDate', DateFilter.fullDate);
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
