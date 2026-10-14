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

/* Archive display filters: filter buttons operate only on their own page group. */
document.querySelectorAll("[data-filter-group]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.dataset.filterGroup;
    const filter = button.dataset.filter;
    const buttons = document.querySelectorAll('[data-filter-group="' + group + '"]');
    const cards = document.querySelectorAll(group === "event" ? "#event-archive [data-type]" : "#song-archive [data-type]");
    let visibleCount = 0;

    buttons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });

    cards.forEach((card) => {
      const matches = filter === "all" || card.dataset.type === filter;
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    const empty = document.getElementById(group === "event" ? "event-empty" : "song-empty");
    if (empty) empty.classList.toggle("visible", visibleCount === 0);
  });
});
