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
  allFriend: state => state.user.allFriend,
  socket: state => state.user.socket,
  sock: state => state.websock.sock,
  unreadList: state => state.user.unreadList,
  myGroupChat: state => state.user.myGroupChat,
  myGroupFriends: state => state.user.myGroupFriends,
  leaveMessage: state => state.user.leaveMessage,
}
export default getters
