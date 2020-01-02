// 验证用户名的合法性
export function isvalidUserName(str) {
  const re = /^[a-zA-Z_0-9\u4e00-\u9fa5]{1,20}$/
  return re.test(str)
}

// 检查电话号码的正确性
export function isvalidPhoneNumber(str) {
  const re = /^1\d{10}$/;
  return re.test(str)
}

//检测邮箱地址的正确性
export function isvalidEmail(str) {
  const re = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
  return re.test(str)
}
