import moment from 'moment';

export default {
    dateOnly(value){
        if(value){
            return moment(value).format('YYYY-MM-DD');
        }
    },
    fullDate (value){
        if (value) {
            return moment(value).format('LLL');
        } else {
            return 'N/A';
        }
    },
    relativeTime(value){
        return moment(value).fromNow();
    }
};
