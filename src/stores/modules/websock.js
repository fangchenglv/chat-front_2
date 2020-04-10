import WebSocketClass from '@/api/webSocket';

const websock = {
    state:{
        sock : null,
        privateMessage:[],
        groupMessage:[],
    },

    mutations:{
        UPDATE_WEBSOCKET(state, sock){
            state.sock = sock;
        },
        UPDATE_PRIVATEMESSAGE(state, data){
            state.privateMessage.push(data);
        },
        UPDATE_GROUPMESSAGE(state, data){
            state.groupMessage.push(data);
        }
    },

    actions:{
        StartWebsocket({commit}, msg){
            let url = msg[0]
            let name = msg[1]
            let regisMsg = msg[2]
            commit('UPDATE_WEBSOCKET', new WebSocketClass(url, name, regisMsg) );
        },
        getPrivateMessage({commit}, data){
            commit("UPDATE_PRIVATEMESSAGE", data);
        },
        getGroupMessage({commit}, data){
            commit("UPDATE_GROUPMESSAGE", data);
        }
    }
};
export default websock