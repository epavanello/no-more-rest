export function doLogin(username, password) {
  return username == "admin" && password == "admin";
}

export function getLoggedUsers() {
  return ["Elon Musk", "admin"];
}
