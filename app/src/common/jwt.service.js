const ID_TOKEN_KEY = 'jwt';

export default {
    getToken () {
        return window.localStorage.getItem(ID_TOKEN_KEY);
    },

    saveToken (token) {
        window.localStorage.setItem(ID_TOKEN_KEY, token);
    },

    destroyToken () {
        window.localStorage.removeItem(ID_TOKEN_KEY);
    }
};
