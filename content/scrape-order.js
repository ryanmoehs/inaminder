function getOrderData() {
    const statusEl = document.querySelector('span[data-color]');
    // const deadlineEl = [...document.querySelectorAll('p')];
    const deadlineEl = [...document.querySelectorAll('p')][1];
        // .find(p => p.innerText.includes('WIB'));

    const labels = [...document.querySelectorAll('span')];
    const orderNumber = labels.find(el =>
        el.innerText.startsWith('EP-')
    )?.innerText;

    if (!orderNumber || !statusEl) return null;

    // Extract date from deadline text (format: "21 Jan 2026, 23:59 WIB")
    const deadlineText = deadlineEl?.innerText ?? null;

    const regDate = /^\d{2}\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;

    let dueDate = deadlineText;
    if (regDate.test(dueDate) === true){
      if (deadlineText && deadlineText.includes(',')) {
        dueDate = deadlineText.split(',')[0].trim();
        return dueDate;
      }
    } else {
      dueDate = "Ditinjau PPK";
      return dueDate;
    }
    // console.log("Due Date :", dueDate)

    return {
        orderId: orderNumber,
        status: statusEl.innerText,
        dueDate: dueDate,
        url: location.href,
        context: detectOrderContext(statusEl.innerText),
        lastChecked: Date.now()
    };
}

function detectOrderContext(statusText) {
  const status = statusText.toLowerCase();

  if (
    status.includes('menunggu') ||
    status.includes('negosiasi')
  ) {
    return 'NEGOSIASI';
  }

  return 'ORDER';
}


chrome.runtime.sendMessage({
    type: 'ORDER_SCRAPED',
    payload: getOrderData()
})