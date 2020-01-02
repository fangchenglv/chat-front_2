import request from "@/utils/request"

//登录的请求头
export function login(userName, password) {
  return request({
    url: "/user/login",
    method: "post",
    data: {
      userName,
      password
    }
  })
}
//注册的请求头
export function register(userName, password, nickName, gender, email, phone, roleCode = "1") {
  return request({
    url: "/user/register",
    method: "post",
    data: {
      userName,
      password,
      nickName,
      gender,
      email,
      phone,
      roleCode
    }
  })
}
//登出
export function logout_(userId){
  return request({
    url:"/user/logout",
    method:"post",
    data:{
      userId,
    }
  })
}
