import moment from 'moment';

export default {
    dateOnly(value){
        if(value){
            return moment(value).format('YYYY-MM-DD');
        }
    },
    dateTime(value){
        if(value){
            return moment(value).format('YYYY-MM-DD HH:mm');
        }
    },
    fullDate (value){
        if (value) {
            return moment(value).format('LLL');
        } else {
            return 'N/A';
        }
    },
    localTimezone(value){
        if(value){
            return moment(value).format('YYYY-MM-DD HH:mm ZZ');
        }
    },
    dayMonth(value){
        if(value){
            return moment(value).format('DD MMM');
        }
    },
    relativeTime(value){
        return moment(value).fromNow();
    }
};
