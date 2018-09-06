import ApiService from '@/common/api.service';
import JwtService from '@/common/jwt.service';
import { LOGIN, LOGOUT, REGISTER, CHECK_AUTH, UPDATE_USER } from './actions.type';
import { SET_AUTH, PURGE_AUTH, SET_ERROR } from './mutations.type';

// Constants
const POOL_DATA = {
    UserPoolId : 'ap-southeast-2_izc55nNFX', // Your user pool id here
    ClientId : 'uke84ie7fl3aj9djnpqufoam' // Your client id here
};

const state = {
    errors: null,
    user: {}, // <<
    username: '',
    isAuthenticated: !!JwtService.getToken()
};

const getters = {
    currentUsername(state){
        return state.username;
    },
    currentUser (state) {
        return state.user;
    },
    isAuthenticated (state) {
        return state.isAuthenticated;
    }
};

const actions = {
    [LOGIN] (context, credentials) {
        return new Promise((resolve) => {
            ApiService
                .post('users/login', {user: credentials})
                .then(({data}) => {
                    context.commit(SET_AUTH, data.user);
                    resolve(data);
                })
                .catch(({response}) => {
                    context.commit(SET_ERROR, response.data.errors);
                });
        });
    },
    [LOGOUT] (context) {
        context.commit(PURGE_AUTH);
    },
    [REGISTER] (context, credentials) {
        return new Promise((resolve, reject) => {
            ApiService
                .post('users', {user: credentials})
                .then(({data}) => {
                    context.commit(SET_AUTH, data.user);
                    resolve(data);
                })
                .catch(({response}) => {
                    context.commit(SET_ERROR, response.data.errors);
                    reject();
                });
        });
    },
    [CHECK_AUTH] (context) {
        if (JwtService.getToken()) {
            ApiService.setHeader();
            ApiService
                .get('/')
                .then(({data}) => {
                    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(POOL_DATA);
                    var cognitoUser = userPool.getCurrentUser();
                    var username = JSON.stringify(cognitoUser.username).replace(/"/g, '');
                    console.log('AUTH sucess --- ', data, cognitoUser); // eslint-disable-line no-console
                    context.commit(SET_AUTH, username);
                })
                .catch(({response}) => {
                    console.log('AUTH failed --- ',response); // eslint-disable-line no-console
                    context.commit(SET_ERROR, response.data.errors);
                });
        } else {
            context.commit(PURGE_AUTH);
        }
    },
    [UPDATE_USER] (context, payload) {
        const {email, username, password, image, bio} = payload;
        const user = { email, username, bio, image };
        if (password) {
            user.password = password;
        }
        return ApiService
            .put('user', user)
            .then(({data}) => {
                context.commit(SET_AUTH, data.user);
                return data;
            });
    }
};

const mutations = {
    [SET_ERROR] (state, error) {
        state.errors = error;
    },
    [SET_AUTH] (state, username) {
        state.isAuthenticated = true;
        state.username = username;
        state.errors = {};
        JwtService.saveToken(state.user.token);
    },
    [PURGE_AUTH] (state) {
        state.isAuthenticated = false;
        state.username = '';
        state.user = {}; // will have an USER OBJECT one day
        state.errors = {};
        JwtService.destroyToken();
    }
};

export default {
    state,
    actions,
    mutations,
    getters
};
