const loginOpen = document.getElementById("login-open");
const loginDialog = document.getElementById("login-dialog");

if (loginOpen && loginDialog) {
  loginOpen.addEventListener("click", () => loginDialog.showModal());

  loginDialog.addEventListener("click", (event) => {
    if (event.target === loginDialog) {
      loginDialog.close();
    }
  });
}
