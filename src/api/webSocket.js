class WebSocketClass {
    /**
     * @description: 初始化实例属性，保存参数
     * @param {String} url ws的接口
     * @param {Function} msgCallback 服务器信息的回调传数据给函数
     * @param {String} name 可选值 用于区分ws，用于debugger
     */
    constructor(url, name, regisMsg) {
        this.url = url;
        // this.msgCallback = msgCallback;
        this.name = name;
        this.regisMsg = regisMsg;

        this.ws = null;  // websocket对象
        this.status = null; // websocket是否关闭
        this.e = null;
        this.pingT = undefined;
        this.pongT = undefined;
    }
    connect(data) {
        // console.log("注册信息", this.regisMsg)
        // 新建 WebSocket 实例
        this.ws = new WebSocket(this.url);
        // 监听服务器端返回的信息
        this.ws.onmessage = function(e){
            console.log(e.data);
        }
        //开启websocket服务
        this.ws.onopen = setTimeout( e => {
            this.status = 'open';
            // this.heartCheck();
            if (data !== undefined && this.ws.readyState === 1) {
                this.regisMsg = data;
                this.sendHandle(data);
            }
        }, 1000);
        // ws关闭回调
        this.ws.onclose = e => {
            this.closeHandle(e); // 判断是否关闭
        }
        // ws出错回调
        this.ws.onerror = e => {
            this.closeHandle(e); // 判断是否关闭
        }
    }
    heartCheck() {
    // 心跳机制的时间可以自己与后端约定
        this.pingPong = 'ping'; // ws的心跳机制状态值
        this.pingT = this.pingInterval = setInterval(() => {
            if (this.ws.readyState === 1) {
                // 检查ws为链接状态 才可发送
                this.ws.send(this.regisMsg); // 客户端发送ping
                console.log('发送ping')
            }
            }, 10000)
        this.pongT = this.pongInterval = setInterval(() => {
            this.pingPong = false;
            if (this.pingPong === 'ping') {
                this.closeHandle('pingPong没有改变为pong'); // 没有返回pong 重启webSocket
            }
            // 重置为ping 若下一次 ping 发送失败 或者pong返回失败(pingPong不会改成pong)，将重启
            console.log('返回pong')
            this.pingPong = 'ping'
            }, 20000)
    }
    // 发送信息给服务器
    sendHandle(data) {
        // console.log("即将发送数据", data);
        return this.ws.send(data)
    }
    closeHandle(e = 'err') {
        if (this.status !== 'close') {
            console.log(`${this.name}断开，重连websocket`, e)
            this.connect(this.regisMsg) // 重连
        } else {
            console.log(`${this.name}websocket手动关闭`)
            this.closeMyself()
        }
    }
    // 手动关闭WebSocket
    closeMyself() {
        console.log(`关闭${this.name}`)
        clearInterval(this.pingT)
        clearInterval(this.pongT)
        this.status = 'close'
        return this.ws.close()
    }
}

export default WebSocketClass


// function someFn(data) {
//     console.log('接收服务器消息的回调：', data);
// }
// // const wsValue = new WebSocketClass('ws://121.40.165.18:8800', someFn, 'wsName'); // 这个链接一天只能发送消息50次
// const wsValue = new WebSocketClass('wss://echo.websocket.org', someFn, 'wsName'); // 阮一峰老师教程链接
// wsValue.connect('立即与服务器通信'); // 连接服务器
// // setTimeout(() => {
// //     wsValue.sendHandle('传消息给服务器')
// // }, 1000);
// // setTimeout(() => {
// //     wsValue.closeMyself(); // 关闭ws
// // }, 10000)