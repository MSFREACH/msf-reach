import moment from 'moment';

export default (date) => {
    return moment(date).format('YYYY-MM-DD');
};
