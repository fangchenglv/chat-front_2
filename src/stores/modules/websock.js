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
        StartWebsocket({commit}, msg){
            
            // console.log(msg)
            // console.log(...msg)
            let url = msg[0]
            let name = msg[1]
            let regisMsg = msg[2]
            // console.log(url,  name, regisMsg);
            commit('UPDATE_WEBSOCKET', new WebSocketClass(url, name, regisMsg));    
            // commit('UPDATE_WEBSOCKET', new WebSocketClass(...msg)); 
        }
    }
};
export default websock