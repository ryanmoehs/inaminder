// DEBUG UTILITIES FOR TESTING
// Add this to browser console when testing on INAPROC pages

window.debugInaproc = {
  // Test data extraction
  testDataExtraction: function() {
    console.log('=== Testing Data Extraction ===');
    
    const statusEl = document.querySelector('span[data-color]');
    console.log('Status Element:', statusEl?.innerText);
    
    const deadlineEl = [...document.querySelectorAll('p')]
      .find(p => p.innerText.includes('WIB'));
    console.log('Deadline Element:', deadlineEl?.innerText);
    
    const labels = [...document.querySelectorAll('span')];
    const orderNumber = labels.find(el =>
      el.innerText.startsWith('EP-')
    )?.innerText;
    console.log('Order Number:', orderNumber);
    
    // Extract date
    const deadlineText = deadlineEl?.innerText ?? null;
    let dueDate = deadlineText;
    if (deadlineText && deadlineText.includes(',')) {
      dueDate = deadlineText.split(',')[0].trim();
    }
    
    console.log('Extracted Order Data:', {
      orderId: orderNumber,
      status: statusEl?.innerText,
      dueDate: dueDate,
      url: location.href
    });
  },

  // Simulate adding an order
  simulateAddOrder: function() {
    const orderData = {
      orderId: 'EP-TEST123',
      status: 'Menunggu Respon Penyedia',
      dueDate: '15 Jan 2026',
      url: location.href,
      lastChecked: Date.now()
    };
    
    chrome.runtime.sendMessage({
      type: 'ADD_ORDER',
      payload: orderData
    }, (response) => {
      console.log('Add Order Response:', response);
    });
  },

  // View stored orders
  viewStoredOrders: function() {
    chrome.storage.local.get(['orders'], (result) => {
      console.log('Stored Orders:', result.orders);
    });
  },

  // Clear all orders
  clearAllOrders: function() {
    if (confirm('Clear all stored orders?')) {
      chrome.storage.local.set({ orders: {} }, () => {
        console.log('All orders cleared');
      });
    }
  }
};

console.log('Debug utilities loaded. Available commands:');
console.log('- window.debugInaproc.testDataExtraction()');
console.log('- window.debugInaproc.simulateAddOrder()');
console.log('- window.debugInaproc.viewStoredOrders()');
console.log('- window.debugInaproc.clearAllOrders()');
