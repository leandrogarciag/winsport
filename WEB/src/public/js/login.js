document.addEventListener("DOMContentLoaded", () => {


  const inputs = document.querySelectorAll(".input");
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      let parent = input.parentNode.parentNode;
      parent.classList.add("focus");
    });
    input.addEventListener("blur", () => {
      let parent = input.parentNode.parentNode;
      if (input.value === "") {
        parent.classList.remove("focus");
      }
    });
  });

  const username = document.getElementById("username");
  inputsMayus([username]);

  const hideShowPassWord = document.getElementById("hideShowPassWord"),
    password = document.getElementById("password");
  hideShowPassWord.addEventListener("click", () => {
    if (password.type === "password") {
      password.type = "text";
      hideShowPassWord.innerHTML = `visibility`;
    } else {
      password.type = "password";
      hideShowPassWord.innerHTML = `visibility_off`;
    }
  });
});