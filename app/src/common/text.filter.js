
/*eslint no-debugger: off*/

export default {
    capitalize(value){
        if (!value) return '';
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
    },
    noUnderscore(value){
        return value.replace(/_/g, ' ');
    },
    toArray(value){
        return value.split(',');
    }
};
