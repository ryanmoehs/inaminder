// Parse date string "DD Mon YYYY" to Date object
function parseDate(dateStr) {
  return new Date(dateStr);
}

// Format date for display
function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Calculate urgency level based on days until deadline
function getUrgencyLevel(dueDate) {
  const now = new Date();
  const due = parseDate(dueDate);
  const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 1) return 'urgent'; // Within 3 days = urgent (yellow)
  if (daysUntil <= 2) return 'warning'; // Within 7 days = warning (orange)
  return 'normal'; // Normal
}

// Load orders from Chrome storage
async function loadOrders() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['orders'], (result) => {
      resolve(result.orders || {});
    });
  });
}

// Render orders list
async function renderOrders(filterOrderId = '', filterDate = '') {
  const orders = await loadOrders();
  const orderList = document.getElementById('orderList');
  orderList.innerHTML = '';

  // Convert to array and sort by due date (most urgent first)
  let orderArray = Object.values(orders).map(order => ({
    ...order,
    urgencyLevel: getUrgencyLevel(order.dueDate),
    dueDateObj: parseDate(order.dueDate)
  }));

  // Sort by due date (closest first)
  orderArray.sort((a, b) => a.dueDateObj - b.dueDateObj);

  // Apply filters
  if (filterOrderId || filterDate) {
    orderArray = orderArray.filter(order => {
      const matchesOrderId = !filterOrderId || order.orderId.includes(filterOrderId);
      const matchesDate = !filterDate || order.dueDate === filterDate;
      return matchesOrderId && matchesDate;
    });
  }

  // Render filtered and sorted orders
  orderArray.forEach((order) => {
    const li = document.createElement('li');
    li.className = `card ${order.urgencyLevel}`;
    li.dataset.orderId = order.orderId;

    li.innerHTML = `
      <div class="card_desc">
        <div class="no_pesanan">${order.orderId}</div>
        <div class="due_date">${order.dueDate}</div>
        <div class="status ${order.urgencyLevel}">${order.status}</div>
      </div>

      <div class="card_btn">
        <div class="card_btn_visit">
          <a href="${order.url}" target="_blank">
            <img src="../assets/link_ext_black.png" alt="">
          </a>
        </div>
        <div class="card_btn_delete">
          <button class="delete-btn" data-order-id="${order.orderId}" style="background: none; border: none; cursor: pointer; padding: 4px;">
            <img src="../assets/delete.png" alt="">
          </button>
        </div>
      </div>
    `;

    orderList.appendChild(li);
    
    async function renderOrdersByContext(context) {
      const orders = await loadOrders();
      const filtered = Object.values(orders)
        .filter(o => o.context === context);

      renderOrdersFromArray(filtered);
    }


  });

  // Attach delete listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteOrder(btn.dataset.orderId);
    });
  });

  function applyActiveTab(activeTab) {
    document.querySelectorAll('.btn_page').forEach(btn => {
      btn.classList.toggle(
        'active',
        btn.dataset.tab === activeTab
      );
    });
  }

}

// Delete order from storage
async function deleteOrder(orderId) {
  const orders = await loadOrders();
  delete orders[orderId];

  chrome.storage.local.set({ orders }, () => {
    renderOrders();
  });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  const searchInputOrderId = document.querySelector('.search input[type="text"]');
  const searchInputDate = document.querySelector('.search input[type="date"]');
  const addBtn = document.querySelector('.btn_add');

  // Load and render orders on popup open
  renderOrders();

  // Search by order ID
  searchInputOrderId?.addEventListener('input', (e) => {
    const filterOrderId = e.target.value;
    const filterDate = searchInputDate?.value ? formatDateForInput(searchInputDate.value) : '';
    renderOrders(filterOrderId, filterDate);
  });

  // Search by date
  searchInputDate?.addEventListener('change', (e) => {
    const filterDate = e.target.value ? formatDateForInput(e.target.value) : '';
    const filterOrderId = searchInputOrderId?.value || '';
    renderOrders(filterOrderId, filterDate);
  });

  // Add button functionality - scrape from current page
  addBtn?.addEventListener('click', () => {
    console.log('[POPUP] Add button clicked');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

      // ❌ 1. Tidak ada tab aktif
      if (!tabs || !tabs.length) {
        console.error('[ERROR][TAB] No active tab found');
        alert('Error: Tidak ada tab aktif');
        return;
      }

      const tab = tabs[0];

      // ❌ 2. URL bukan INAPROC
      if (!tab.url || !tab.url.includes('penyedia.inaproc.id/negotiation')) {
        console.error('[ERROR][URL] Invalid page:', tab.url);
        alert('Error: Halaman bukan detail pesanan INAPROC');
        return;
      }

      console.log('[POPUP] Active tab:', tab.id, tab.url);

      chrome.tabs.sendMessage(
        tab.id,
        { type: 'GET_PAGE_DATA' },
        (response) => {

          // ❌ 3. Gagal kirim message
          if (chrome.runtime.lastError) {
            console.error(
              '[ERROR][SEND_MESSAGE]',
              chrome.runtime.lastError.message
            );
            alert('Error: Content script tidak aktif di halaman ini');
            return;
          }

          // ❌ 4. Content tidak membalas
          if (!response) {
            console.error('[ERROR][RESPONSE] No response from content');
            alert('Error: Tidak ada respon dari halaman');
            return;
          }

          // ❌ 5. orderData null
          if (!response.orderData) {
            console.error('[ERROR][DATA] orderData is null', response);
            alert('Error: Data pesanan tidak ditemukan di halaman');
            return;
          }

          console.log('[SUCCESS] Order data received:', response.orderData);

          chrome.runtime.sendMessage({
            type: 'ADD_ORDER',
            payload: response.orderData
          });

          setTimeout(() => renderOrders(), 500);
        }
      );
    });
  });


  // Listen for storage changes to update list in real-time
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.orders) {
      renderOrders();
    }
  });
});

// Convert input date format (YYYY-MM-DD) to display format (DD Mon YYYY)
function formatDateForInput(inputDate) {
  const date = new Date(inputDate + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
