const marked = require('marked');
const removeMd = require('remove-markdown');

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
    removeSnakeCase(value){
        return value.replace(/_/g, ' ').replace(/(?: |\b)(\w)/g, function(key) { return key.toUpperCase()});
    },
    toArray(value){
        return value.split(',');
    },
    renderMarkdown(value){
        return marked(value);
    },
    snippetNoMarkdown(value){
        var plainText = removeMd(value);
        return plainText.substring(0, 100);
    }
};
