const getters = {
  userId: state => state.user.userId,
  userRole: state => state.user.userRole,
  userSign: state => state.user.userSign,
  userNickname: state => state.user.userNickname,
  userName: state => state.user.userName,
  userAvatar:state => state.user.userAvatar,
  beSearchFriend: state => state.user.beSearchFriend,
  // toSearchMe: state => state.user.toSearchMe,
  myFriendList: state => state.user.myFriendList,
  socket: state => state.user.socket,
  sock: state => state.websock.sock,
  unreadList: state => state.user.unreadList,
}
export default getters
