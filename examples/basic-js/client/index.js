import { doLogin, getLoggedUsers } from "./generatedProxy";

doLogin("admin", "admin")
  .then((result) => {
    if (result) {
      alert("Login success");

      getLoggedUsers().then((users) => {
        alert("The logged users are: " + users.join(", "));
      });
    } else {
      alert("Login failed");
    }
  })
  .catch(() => {
    alert("Network error");
  });
