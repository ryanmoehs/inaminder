function getOrderData() {
    const statusEl = document.querySelectorAll('.flex.items-center.gap-x-1')[1];
    const deadlineEl = [...document.querySelectorAll('p')][1].textContent;

    const labels = [...document.querySelectorAll('span')];
    const orderNumber = labels.find(el =>
        el.innerText.startsWith('EP-')
    )?.innerText;

    if (!orderNumber || !statusEl) return null;

    const regDate = /^\d{2}\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;
    let dueDate = deadlineEl.split(',')[0].trim();

    // checking to regex
    if (regDate.test(dueDate) === true){
      dueDate
    } else {
      dueDate = "--";
    }
    const status = statusEl.querySelectorAll('span');
    if (status.length == 2){
      statusInfo = status[1].textContent;
      if (statusInfo == "Menunggu Keputusan Pesanan"){
        statusInfo = "Ditinjau PPK"
      }
    } else {
      statusInfo = status[0].textContent;
    }
    return {
        orderId: orderNumber,
        status: statusInfo,
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