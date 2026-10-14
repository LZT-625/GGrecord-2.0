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


/* Legacy Windows-style details dialog for event and song cards. */
const detailDialog = document.getElementById("detail-dialog");
const detailTitle = document.getElementById("detail-dialog-title");
const detailList = document.getElementById("detail-property-list");

function appendDetailValue(container, value) {
  const text = String(value ?? "").trim();
  const urlPattern = /^https?:\/\//i;
  if (urlPattern.test(text)) {
    const link = document.createElement("a");
    link.href = text;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = text;
    container.appendChild(link);
  } else {
    container.textContent = text || "未填寫";
  }
}

function openDetailCard(card) {
  if (!detailDialog || !detailTitle || !detailList) return;
  let details = [];
  try {
    details = JSON.parse(card.dataset.details || "[]");
  } catch {
    details = [];
  }
  const heading = card.querySelector("h3")?.textContent?.trim() || "詳細資料";
  detailTitle.textContent = heading + " — DETAILS";
  detailList.replaceChildren();

  details.forEach(([label, value]) => {
    const labelNode = document.createElement("div");
    labelNode.className = "detail-property-label";
    labelNode.textContent = label;

    const valueNode = document.createElement("div");
    valueNode.className = "detail-property-value";
    appendDetailValue(valueNode, value);

    detailList.append(labelNode, valueNode);
  });

  detailDialog.showModal();
}

document.querySelectorAll(".archive-card[ data-details ], .song-card[ data-details ], .archive-card[data-details], .song-card[data-details]").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    openDetailCard(card);
  });
  card.addEventListener("keydown", (event) => {
    if (event.target !== card) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetailCard(card);
    }
  });
});

if (detailDialog) {
  detailDialog.querySelector(".detail-close")?.addEventListener("click", () => detailDialog.close());
  detailDialog.addEventListener("click", (event) => {
    if (event.target === detailDialog) detailDialog.close();
  });
}
