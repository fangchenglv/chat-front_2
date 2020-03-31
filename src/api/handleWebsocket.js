export default function messageHandle(data){
    console.log("监听返回的单信息",data);
    if(data.status === 200){
        if(data.msg === "一切正常"){
            // this.ws.onmessage;
        }
        // else if(){}
    }
     else if (data.status === -1 ){
        alert(data.msg);
        // this.ws.onmessage;
    }
}