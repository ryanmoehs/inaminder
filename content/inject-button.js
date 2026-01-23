function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      }
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      reject();
    }, timeout);
  });
}

function getOrderData() {
  const statusEl = document.querySelector('span[data-color]');
  const deadlineEl = [...document.querySelectorAll('p')]
    .find(p => p.innerText.includes('WIB'));

  const labels = [...document.querySelectorAll('span')];
  const orderNumber = labels.find(el =>
    el.innerText.startsWith('EP-')
  )?.innerText;

  if (!orderNumber || !statusEl) return null;

  // Extract date from deadline text (format: "21 Jan 2026, 23:59 WIB")
  const deadlineText = deadlineEl?.innerText ?? null;
  let dueDate = deadlineText;
  if (deadlineText && deadlineText.includes(',')) {
    dueDate = deadlineText.split(',')[0].trim();
  }

  return {
    orderId: orderNumber,
    status: statusEl.innerText,
    dueDate: dueDate,
    url: location.href,
    lastChecked: Date.now()
  };
}

function createAddButton(orderData) {
  const btn = document.createElement('button');
  btn.innerText = '+ Tambahkan ke INAPROC Helper';

  btn.style.cssText = `
    margin-top: 8px;
    padding: 6px 10px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  `;

  btn.addEventListener('click', () => {
    const currentOrderData = getOrderData();

    if (!currentOrderData) {
        alert('Gagal membaca data pesanan');
        return;
    }

    chrome.runtime.sendMessage({
        type: 'ADD_ORDER',
        payload: currentOrderData
    });

    btn.innerText = '✔ Ditambahkan';
    btn.disabled = true;
  });

  return btn;
}

(async function () {
  try {
    const container = await waitForElement('span[data-color]');
    const card = container.closest('div[class*="border"]');

    if (!card || card.querySelector('#inaproc-helper-btn')) return;

    const orderData = getOrderData();
    const btn = createAddButton(orderData);
    btn.id = 'inaproc-helper-btn';

    card.appendChild(btn);
  } catch (e) {
    console.warn('INAPROC Helper: gagal inject tombol');
  }
})();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_DATA') {
    const orderData = getOrderData();
    sendResponse({ orderData });
  }
});

// Auto-send order data on page load
chrome.runtime.sendMessage({
    type: 'ORDER_SCRAPED',
    payload: getOrderData()
});
  return btn;

