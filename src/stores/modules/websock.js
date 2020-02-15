import WebSocketClass from '@/api/webSocket';

const websock = {
    state:{
        sock : null,
    },

    mutations:{
        UPDATE_WEBSOCKET(state, sock){
            state.sock = sock 
        }
    },

    actions:{
        START_WEBSOCKET({commit}, 
            // id, 
            url, func, name
            ){

            commit('UPDATE_WEBSOCKET', new WebSocketClass(url, func, name));         
        }
    }
};
export default websock