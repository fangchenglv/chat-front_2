import ReconnectingWebSocket from '@/api/reconnecting-websocket.js'
import { createwebsocket } from '@/api/webSocket'
import ws from '@/api/webSocket'
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
            // wss = createwebsocket(id)
            // console.log(createwebsocket(id));

            commit('UPDATE_WEBSOCKET', new WebSocketClass(url, func, name));
            
            // const wssUrl = 'wss://10.28.211.163:8890/chat/' + id;

            // const wssUrl = 'wss://10.112.48.143:8890/chat/' + id;
            // commit('UPDATE_WEBSOCKET', new ReconnectingWebSocket(wssUrl));

            // console.log(wssUrl);
            // commit('UPDATE_WEBSOCKET', new WebSocket(wssUrl))    
            // this.state.sock.onopen = function(){
            //    setInterval(function(){ this.state.sock.send({'heart':true}  ) }, 30000);
                   
            // };
            // setInterval(function(){ this.$store.getters.sock.send(JSON.stringify( {'heart':true} ) ) }, 30000);            
        }
    }
};
export default websock