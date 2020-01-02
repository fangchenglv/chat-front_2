import request from "@/utils/request"
// import Qs from "qs"

//添加自己的好友列表
export function getMyFriendList(userId) {
  return request({
    url: "/friendType/getFriendType",
    method: "post",
    data: {
      userId,
    }
  })
}
//加载自己与好友的历史聊天记录
export function getHistoryChatWithFriendId(params){
  return request({
    url:"/chat/self",
    method:"get",
    params:params,
  })
}
//添加新好友的请求头
export function requestFriend(typeId, friendId, userId, remark = '请求添加你为好友') {
  return request({
    url: "/friendApply/sentAddFriendInfo",
    method: "post",
    data: {
      typeId,
      friendId,
      userId,
      remark
    }
  })
}
//删除某位好友
export function deleteMyFriend(userId, friendId) {
  return request({
    url: "/friend/delFriend",
    method: "post",
    data: {
      userId,
      friendId
    }
  })
}
//寻找好友
export function searchFriend(searchStr) {
  return request({
    url: "/friend/searchFriends",
    method: "post",
    data: {
      searchStr,
    }
  })
}
//查看自己接受到得好友请求，包括自己处理过和没处理过的，0未处理，1同意，2以拒绝
export function searchFriendRequest(toUserId, status, pageNum, pageSize) {
  return request({
    url: "/friendApply/getByToUserId",
    method: "post",
    data: {
      toUserId,
      status,
      pageNum,
      pageSize
    }
  })
}
//处理自己接受的好友请求
export function solveRequest(id, status, fromTypeId, toTypeId) {
  return request({
    url: "/friendApply/updateStatus",
    method: "post",
    data: {
      id,
      status,
      fromTypeId,
      toTypeId,
    }
  })
}
//新建好友分组
export function setFriendGroup(typeName, userId){
  return request({
    url:"/friendType/add",
    method:"post",
    data:{
      typeName,
      userId
    }
  })
}

//聊天：发送信息给好友
export function sendMessage(param, toId){
  return request({
    url:"/chat/push/"+toId,
    method:"post",
    data:param,

    // transformRequest:[function(data){
    //   return Qs.stringify(data);
    // }],
    // headers:{
    //   "Content-type":'application/x-www-form-urlencoded',
    // }
  })
}
//聊天：获得离线好友信息列表
export function getUnreadMsgList(userId){
  return request({
    url:"/chat/unreadMsgList",
    method:"post",
    data:{userId},
  })
}
//聊天：获取历史消息
export function getHistoryReadList(fromId, toId){
  return request({
    url:"/chat/self/" + fromId + "/" + toId,
    method:"get",
    // data:{},
  })
}
//聊天，获取离线好友具体消息
export function getUnreadMessageList(toUserId, fromUserId){
  return request({
    url:"/chat/offline/message",
    method:"post",
    data:{
      fromUserId,
      toUserId
    }
  })
}
// //登出
// export function logout_(userId){
//   return request({
//     url:"/user/logout",
//     method:"post",
//     data:{
//       userId,
//     }
//   })
// }