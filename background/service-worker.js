chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'ORDER_SCRAPED') {
    saveOrUpdateOrder(msg.payload);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ADD_ORDER') {
    chrome.storage.local.get(['orders'], res => {
      const orders = res.orders || {};
      saveOrUpdateOrder(msg.payload)

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
    const prev = orders[order.orderId];

    // notif perubahan status
    if (prev && prev.status !== order.status) {
      notifyStatusChange(order);
    }

    // merge state lama (penting untuk _notified)
    orders[order.orderId] = {
      ...prev,
      ...order
    };

    // urgent logic
    if (isUrgent(orders[order.orderId]) && !orders[order.orderId]._notified) {
      showUrgentNotification(order);
      orders[order.orderId]._notified = true;
    }

    // hitung badge
    const urgentCount = countUrgentOrders(orders);

    chrome.storage.local.set({ orders }, () => {
      updateBadge(urgentCount);
    });
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

function isUrgent(order) {
  if (!order.dueDate) return false;

  const now = new Date();
  const deadline = new Date(order.dueDate);

  if (isNaN(deadline)) return false;

  const diffHours = (deadline - now) / (1000 * 60 * 60);
  return diffHours <= 24 && diffHours > 0;
}


function countUrgentOrders(orders) {
  return Object.values(orders).filter(isUrgent).length;
}


function updateBadge(urgentCount) {
  if (urgentCount > 0) {
    chrome.action.setBadgeText({
      text: urgentCount.toString()
    });

    chrome.action.setBadgeBackgroundColor({
      color: '#d93025' // merah
    });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function showUrgentNotification(order) {
  chrome.notifications.create(`urgent-${order.orderId}`, {
    type: 'basic',
    iconUrl: 'assets/icon48.png',
    title: '⚠️ Pesanan URGENT',
    message: `Pesanan ${order.orderId} perlu segera direspons`,
    priority: 2
  });
}
