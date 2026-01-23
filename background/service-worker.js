chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'ORDER_SCRAPED') {
    saveOrUpdateOrder(msg.payload);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ADD_ORDER') {
    chrome.storage.local.get(['orders'], res => {
      const orders = res.orders || {};
      orders[msg.payload.orderId] = msg.payload;

      chrome.storage.local.set({ orders }, () => {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'assets/icon48.png',
          title: 'INAPROC Helper',
          message: 'Pesanan berhasil ditambahkan: ' + msg.payload.orderId
        });
        sendResponse({ success: true });
      });
    });
    return true;
  }
});


function saveOrUpdateOrder(order) {
  if (!order || !order.orderId) return;

  chrome.storage.local.get(['orders'], (res) => {
    const orders = res.orders || {};

    if (
      orders[order.orderId] &&
      orders[order.orderId].status !== order.status
    ) {
      notifyStatusChange(order);
    }

    orders[order.orderId] = order;

    chrome.storage.local.set({ orders });
  });
}

function notifyStatusChange(order) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'assets/icon48.png',
    title: 'Status Pesanan Berubah',
    message: `${order.orderId}\nStatus: ${order.status}`
  });
}