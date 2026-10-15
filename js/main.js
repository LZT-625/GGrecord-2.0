/* 取得登入按鈕，若此頁沒有該元素則不執行登入互動。 */
const loginOpen = document.getElementById("login-open");
/* 取得登入彈窗，供按鈕開啟與背景點擊關閉使用。 */
const loginDialog = document.getElementById("login-dialog");

/* 只有按鈕與彈窗都存在時，才註冊登入事件。 */
if (loginOpen && loginDialog) {
/* 點擊登入按鈕時，以原生 dialog 模式開啟彈窗。 */
  loginOpen.addEventListener("click", () => loginDialog.showModal());

/* 監聽彈窗點擊；只有點到遮罩本身才關閉。 */
  loginDialog.addEventListener("click", (event) => {
    if (event.target === loginDialog) {
      loginDialog.close();
    }
  });
}

/* Archive display filters: filter buttons operate only on their own page group. */
/* 為每個分類篩選按鈕註冊事件，按鈕以 data-filter-group 區分所屬頁面。 */
document.querySelectorAll("[data-filter-group]").forEach((button) => {
/* 使用者選擇分類時，更新同組按鈕狀態與卡片顯示。 */
  button.addEventListener("click", () => {
/* 讀取目前按鈕所屬的資料群組。 */
    const group = button.dataset.filterGroup;
/* 讀取要套用的分類值。 */
    const filter = button.dataset.filter;
/* 只選取同一群組的篩選按鈕，避免跨頁型篩選互相干擾。 */
    const buttons = document.querySelectorAll('[data-filter-group="' + group + '"]');
/* 依群組選擇演出或歌曲卡片。 */
    const cards = document.querySelectorAll(group === "event" ? "#event-archive [data-type]" : "#song-archive [data-type]");
/* 計算篩選後可見的卡片數量。 */
    let visibleCount = 0;

/* 同步 aria-pressed，讓視覺狀態與輔助工具狀態一致。 */
    buttons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });

/* 依分類比對 data-type，切換卡片 hidden 狀態並計數。 */
    cards.forEach((card) => {
      const matches = filter === "all" || card.dataset.type === filter;
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

/* 取得該列表的空結果提示元素。 */
    const empty = document.getElementById(group === "event" ? "event-empty" : "song-empty");
/* 只有沒有符合項目時才顯示空結果提示。 */
    if (empty) empty.classList.toggle("visible", visibleCount === 0);
  });
});


/* Legacy Windows-style details dialog for event and song cards. */
/* 取得共用詳細資料彈窗。 */
const detailDialog = document.getElementById("detail-dialog");
/* 取得彈窗標題節點。 */
const detailTitle = document.getElementById("detail-dialog-title");
/* 取得彈窗內動態欄位清單容器。 */
const detailList = document.getElementById("detail-property-list");

/* 依資料內容建立安全的文字或外部連結，供彈窗欄位重複使用。 */
function appendDetailValue(container, value) {
/* 將欄位值轉成文字並去除前後空白。 */
  const text = String(value ?? "").trim();
/* 辨識 HTTP 或 HTTPS 網址，避免把一般文字當連結。 */
  const urlPattern = /^https?:\/\//i;
/* 網址以可點擊連結呈現；其他值直接顯示文字。 */
  if (urlPattern.test(text)) {
/* 建立外部連結元素。 */
    const link = document.createElement("a");
/* 設定連結目的地。 */
    link.href = text;
/* 在新分頁開啟來源網址。 */
    link.target = "_blank";
/* 避免新分頁透過 opener 存取原頁面。 */
    link.rel = "noopener noreferrer";
/* 以網址本身作為可見連結文字。 */
    link.textContent = text;
/* 將連結加入欄位容器。 */
    container.appendChild(link);
  } else {
/* 一般文字或空值提示直接放入欄位，不解析成 HTML。 */
    container.textContent = text || "未填寫";
  }
}

/* 讀取卡片的 data-details，組合彈窗標題與欄位後開啟視窗。 */
function openDetailCard(card) {
/* 必要節點不存在時提早結束，避免發生空值錯誤。 */
  if (!detailDialog || !detailTitle || !detailList) return;
/* 準備存放從卡片 data-details 解析出的欄位陣列。 */
  let details = [];
/* 嘗試解析卡片內的 JSON 字串資料。 */
  try {
/* 把 data-details 字串轉成欄位陣列。 */
    details = JSON.parse(card.dataset.details || "[]");
/* 資料格式無法解析時使用空陣列，避免中斷互動。 */
  } catch {
    details = [];
  }
/* 優先取卡片標題作為彈窗標題，缺少時使用通用名稱。 */
  const heading = card.querySelector("h3")?.textContent?.trim() || "詳細資料";
/* 更新彈窗標題。 */
  detailTitle.textContent = heading + " — DETAILS";
/* 清空上一次開啟時留下的欄位。 */
  detailList.replaceChildren();

/* 逐筆建立資料標籤與資料值，依序放入彈窗。 */
  details.forEach(([label, value]) => {
/* 建立欄位名稱節點。 */
    const labelNode = document.createElement("div");
/* 套用欄位標籤的 CSS 類別。 */
    labelNode.className = "detail-property-label";
/* 以純文字顯示欄位名稱。 */
    labelNode.textContent = label;

/* 建立欄位值節點。 */
    const valueNode = document.createElement("div");
/* 套用欄位內容的 CSS 類別。 */
    valueNode.className = "detail-property-value";
/* 依欄位內容決定顯示一般文字或可點擊網址。 */
    appendDetailValue(valueNode, value);

/* 依序加入欄位名稱與欄位值。 */
    detailList.append(labelNode, valueNode);
  });

/* 所有欄位建立完成後開啟彈窗。 */
  detailDialog.showModal();
}

/* 讓演出、歌曲與首頁演出卡片共用同一套詳細資料彈窗。 */
document.querySelectorAll(".archive-card[data-details], .song-card[data-details], .upcoming-event-card[data-details]").forEach((card) => {
/* 滑鼠點擊卡片時開啟詳情，但不攔截卡片內連結或按鈕。 */
  card.addEventListener("click", (event) => {
/* 點擊卡片內連結或按鈕時保留原本操作。 */
    if (event.target.closest("a, button")) return;
    openDetailCard(card);
  });
/* 支援鍵盤操作卡片，符合 Enter 或空白鍵即可開啟詳情。 */
  card.addEventListener("keydown", (event) => {
/* 只處理卡片本身的鍵盤事件，避免內部元素重複觸發。 */
    if (event.target !== card) return;
/* 只接受 Enter 與空白鍵作為開啟快捷鍵。 */
    if (event.key === "Enter" || event.key === " ") {
/* 避免空白鍵造成頁面捲動。 */
      event.preventDefault();
      openDetailCard(card);
    }
  });
});

/* 彈窗存在時才註冊關閉事件。 */
if (detailDialog) {
/* 點擊彈窗的 X 按鈕時關閉視窗。 */
  detailDialog.querySelector(".detail-close")?.addEventListener("click", () => detailDialog.close());
/* 點擊彈窗外側遮罩時關閉；點擊內容不會關閉。 */
  detailDialog.addEventListener("click", (event) => {
    if (event.target === detailDialog) detailDialog.close();
  });
}
