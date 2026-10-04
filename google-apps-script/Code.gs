/**
 * TOY WORLD — Google Apps Script
 * Two-way sync between Google Sheets and Cloudflare D1 via Cloudflare Worker API
 * 
 * Setup Instructions:
 * 1. Create a new Google Sheet named "TOY WORLD Orders"
 * 2. Open Extensions > Apps Script
 * 3. Paste this entire script
 * 4. Set the following Script Properties (Project Settings > Script Properties):
 *    - WORKER_URL: Your Cloudflare Worker URL (e.g., https://toy-world-worker.your-account.workers.dev)
 *    - WEBHOOK_SECRET: Same secret as GOOGLE_SHEETS_WEBHOOK_SECRET in your Worker
 * 5. Deploy > New Deployment > Web App (Execute as: Me, Who can access: Anyone)
 * 6. Copy the Web App URL and set it in Admin Settings > Google Sheets URL
 * 7. Run setupTriggers() once to install the onChange trigger
 */

// ============================================================
// CONFIGURATION
// ============================================================

const SCRIPT_PROPS = PropertiesService.getScriptProperties();

function getConfig() {
  return {
    WORKER_URL: SCRIPT_PROPS.getProperty('WORKER_URL') || '',
    WEBHOOK_SECRET: SCRIPT_PROPS.getProperty('WEBHOOK_SECRET') || '',
    SHEET_NAME: 'Orders',
  };
}

// Column mapping (1-indexed)
const COLUMNS = {
  ORDER_ID: 1,
  DATE: 2,
  TIME: 3,
  CUSTOMER_NAME: 4,
  PHONE: 5,
  EMAIL: 6,
  ADDRESS: 7,
  CITY: 8,
  STATE: 9,
  PINCODE: 10,
  ITEMS: 11,
  ITEM_COUNT: 12,
  SUBTOTAL: 13,
  DISCOUNT: 14,
  SHIPPING: 15,
  GRAND_TOTAL: 16,
  PAYMENT_STATUS: 17,
  ORDER_STATUS: 18,
  SHIPPING_STATUS: 19,
  TRACKING_NUMBER: 20,
  CUSTOMER_NOTE: 21,
  INTERNAL_NOTE: 22,
  WHATSAPP_LINK: 23,
  UPDATED_AT: 24,
  SYNC_STATUS: 25,
};

const PAYMENT_STATUSES = [
  'Pending',
  'Awaiting Confirmation',
  'Received',
  'Failed / Not Received',
  'Refunded',
];

const ORDER_STATUSES = [
  'New',
  'WhatsApp Contacted',
  'Payment Pending',
  'Payment Received',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const SHIPPING_STATUSES = [
  'Not Shipped',
  'Ready to Ship',
  'Shipped',
  'Delivered',
  'Returned',
];

// ============================================================
// SHEET SETUP
// ============================================================

/**
 * Initialize the Orders sheet with headers, formatting, and dropdowns
 */
function setupOrdersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Orders');
  
  if (!sheet) {
    sheet = ss.insertSheet('Orders');
  }
  
  // Set headers
  const headers = [
    'Order ID', 'Date', 'Time', 'Customer Name', 'Phone', 'Email',
    'Address', 'City', 'State', 'Pincode', 'Items', 'Item Count',
    'Subtotal (₹)', 'Discount (₹)', 'Shipping (₹)', 'Grand Total (₹)',
    'Payment Status', 'Order Status', 'Shipping Status', 'Tracking Number',
    'Customer Note', 'Internal Note', 'WhatsApp Link', 'Updated At', 'Sync Status'
  ];
  
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  headerRow.setBackground('#1A1A2E');
  headerRow.setFontColor('#FFFFFF');
  headerRow.setFontWeight('bold');
  headerRow.setFontSize(11);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Column widths
  const widths = [180, 100, 80, 180, 120, 180, 250, 120, 120, 80, 300, 80, 100, 100, 100, 120, 160, 160, 150, 150, 200, 200, 200, 160, 100];
  widths.forEach((width, i) => {
    sheet.setColumnWidth(i + 1, width);
  });
  
  // Set up dropdown validations for data rows (rows 2-1000)
  setupDropdownValidations(sheet);
  
  Logger.log('Orders sheet setup complete.');
}

/**
 * Set up dropdown validations for status columns
 */
function setupDropdownValidations(sheet) {
  const maxRows = 1000;
  const dataRange = (col) => sheet.getRange(2, col, maxRows, 1);
  
  // Payment Status dropdown
  const paymentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(PAYMENT_STATUSES, true)
    .setAllowInvalid(false)
    .build();
  dataRange(COLUMNS.PAYMENT_STATUS).setDataValidation(paymentRule);
  
  // Order Status dropdown
  const orderRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(ORDER_STATUSES, true)
    .setAllowInvalid(false)
    .build();
  dataRange(COLUMNS.ORDER_STATUS).setDataValidation(orderRule);
  
  // Shipping Status dropdown
  const shippingRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(SHIPPING_STATUSES, true)
    .setAllowInvalid(false)
    .build();
  dataRange(COLUMNS.SHIPPING_STATUS).setDataValidation(shippingRule);
}

// ============================================================
// RECEIVE NEW ORDER FROM CLOUDFLARE WORKER (POST request)
// ============================================================

/**
 * doPost - Web App endpoint to receive new orders from Cloudflare Worker
 * The Worker calls this when a new order is placed
 */
function doPost(e) {
  try {
    const config = getConfig();
    
    // Validate webhook secret
    const requestBody = JSON.parse(e.postData.contents);
    const incomingSecret = requestBody.secret || '';
    
    if (incomingSecret !== config.WEBHOOK_SECRET) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const { action, order } = requestBody;
    
    if (action === 'new_order') {
      appendOrderToSheet(order);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Order added to sheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'update_order') {
      updateOrderInSheet(order);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Order updated in sheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Append a new order row to the Orders sheet
 */
function appendOrderToSheet(order) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) {
    setupOrdersSheet();
    return appendOrderToSheet(order);
  }
  
  const createdAt = new Date(order.created_at || Date.now());
  const itemsText = (order.items || []).map(item => 
    `${item.product_name} (${item.variant_name || 'Standard'}) x${item.quantity} @ ₹${item.selling_price}`
  ).join('\n');
  
  const whatsappUrl = `https://wa.me/919416217374?text=${encodeURIComponent(
    `Following up on Order ${order.order_number}`
  )}`;
  
  const rowData = Array(Object.keys(COLUMNS).length).fill('');
  rowData[COLUMNS.ORDER_ID - 1] = order.order_number || '';
  rowData[COLUMNS.DATE - 1] = Utilities.formatDate(createdAt, 'Asia/Kolkata', 'dd-MM-yyyy');
  rowData[COLUMNS.TIME - 1] = Utilities.formatDate(createdAt, 'Asia/Kolkata', 'HH:mm');
  rowData[COLUMNS.CUSTOMER_NAME - 1] = order.customer_name || '';
  rowData[COLUMNS.PHONE - 1] = order.customer_phone || '';
  rowData[COLUMNS.EMAIL - 1] = order.customer_email || '';
  rowData[COLUMNS.ADDRESS - 1] = [
    order.address?.flat_house,
    order.address?.building_society,
    order.address?.street_locality,
    order.address?.landmark,
  ].filter(Boolean).join(', ');
  rowData[COLUMNS.CITY - 1] = order.address?.city || '';
  rowData[COLUMNS.STATE - 1] = order.address?.state || '';
  rowData[COLUMNS.PINCODE - 1] = order.address?.pincode || '';
  rowData[COLUMNS.ITEMS - 1] = itemsText;
  rowData[COLUMNS.ITEM_COUNT - 1] = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);
  rowData[COLUMNS.SUBTOTAL - 1] = order.subtotal || 0;
  rowData[COLUMNS.DISCOUNT - 1] = order.discount_amount || 0;
  rowData[COLUMNS.SHIPPING - 1] = order.shipping_amount || 0;
  rowData[COLUMNS.GRAND_TOTAL - 1] = order.grand_total || 0;
  rowData[COLUMNS.PAYMENT_STATUS - 1] = formatStatus(order.payment_status) || 'Pending';
  rowData[COLUMNS.ORDER_STATUS - 1] = formatStatus(order.order_status) || 'New';
  rowData[COLUMNS.SHIPPING_STATUS - 1] = formatStatus(order.shipping_status) || 'Not Shipped';
  rowData[COLUMNS.TRACKING_NUMBER - 1] = order.tracking_number || '';
  rowData[COLUMNS.CUSTOMER_NOTE - 1] = order.customer_note || '';
  rowData[COLUMNS.INTERNAL_NOTE - 1] = order.internal_note || '';
  rowData[COLUMNS.WHATSAPP_LINK - 1] = order.whatsapp_link || whatsappUrl;
  rowData[COLUMNS.UPDATED_AT - 1] = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm');
  rowData[COLUMNS.SYNC_STATUS - 1] = 'Synced';
  
  sheet.appendRow(rowData);
  
  // Format the new row
  const lastRow = sheet.getLastRow();
  formatOrderRow(sheet, lastRow, order.order_status);
  
  Logger.log(`Order ${order.order_number} appended to sheet at row ${lastRow}`);
}

/**
 * Update an existing order row in the sheet
 */
function updateOrderInSheet(order) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) return;
  
  const rowNum = findOrderRow(sheet, order.order_number);
  if (!rowNum) {
    Logger.log(`Order ${order.order_number} not found in sheet, appending instead`);
    appendOrderToSheet(order);
    return;
  }
  
  // Only update operational status fields (not the whole row)
  sheet.getRange(rowNum, COLUMNS.PAYMENT_STATUS).setValue(formatStatus(order.payment_status));
  sheet.getRange(rowNum, COLUMNS.ORDER_STATUS).setValue(formatStatus(order.order_status));
  sheet.getRange(rowNum, COLUMNS.SHIPPING_STATUS).setValue(formatStatus(order.shipping_status));
  
  if (order.tracking_number) {
    sheet.getRange(rowNum, COLUMNS.TRACKING_NUMBER).setValue(order.tracking_number);
  }
  if (order.internal_note) {
    sheet.getRange(rowNum, COLUMNS.INTERNAL_NOTE).setValue(order.internal_note);
  }
  
  sheet.getRange(rowNum, COLUMNS.UPDATED_AT).setValue(
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm')
  );
  sheet.getRange(rowNum, COLUMNS.SYNC_STATUS).setValue('Updated');
  
  formatOrderRow(sheet, rowNum, order.order_status);
  Logger.log(`Order ${order.order_number} updated at row ${rowNum}`);
}

// ============================================================
// PUSH STATUS CHANGES FROM SHEET TO CLOUDFLARE WORKER
// ============================================================

/**
 * onEdit trigger — detects when staff changes status dropdowns
 * Pushes the change to Cloudflare Worker → D1
 */
function onSheetEdit(e) {
  const config = getConfig();
  if (!config.WORKER_URL) {
    Logger.log('WORKER_URL not configured. Skipping sync.');
    return;
  }
  
  const sheet = e.source.getActiveSheet();
  if (sheet.getName() !== 'Orders') return;
  
  const row = e.range.getRow();
  const col = e.range.getColumn();
  
  // Only react to changes in status columns or tracking number
  const watchedColumns = [
    COLUMNS.PAYMENT_STATUS,
    COLUMNS.ORDER_STATUS,
    COLUMNS.SHIPPING_STATUS,
    COLUMNS.TRACKING_NUMBER,
    COLUMNS.INTERNAL_NOTE,
  ];
  
  if (row < 2 || !watchedColumns.includes(col)) return;
  
  const orderId = sheet.getRange(row, COLUMNS.ORDER_ID).getValue();
  if (!orderId) return;
  
  // Read current status values
  const paymentStatus = sheet.getRange(row, COLUMNS.PAYMENT_STATUS).getValue();
  const orderStatus = sheet.getRange(row, COLUMNS.ORDER_STATUS).getValue();
  const shippingStatus = sheet.getRange(row, COLUMNS.SHIPPING_STATUS).getValue();
  const trackingNumber = sheet.getRange(row, COLUMNS.TRACKING_NUMBER).getValue();
  const internalNote = sheet.getRange(row, COLUMNS.INTERNAL_NOTE).getValue();
  
  // Mark as syncing
  sheet.getRange(row, COLUMNS.SYNC_STATUS).setValue('Syncing...');
  
  try {
    const payload = {
      order_number: orderId,
      payment_status: reverseFormatStatus(paymentStatus),
      order_status: reverseFormatStatus(orderStatus),
      shipping_status: reverseFormatStatus(shippingStatus),
      tracking_number: trackingNumber,
      internal_note: internalNote,
      source: 'google_sheets',
    };
    
    const response = UrlFetchApp.fetch(
      config.WORKER_URL + '/api/integrations/sheets/sync',
      {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'X-Webhook-Secret': config.WEBHOOK_SECRET,
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      }
    );
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      sheet.getRange(row, COLUMNS.SYNC_STATUS).setValue('Synced ✓');
      sheet.getRange(row, COLUMNS.UPDATED_AT).setValue(
        Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm')
      );
      formatOrderRow(sheet, row, orderStatus);
    } else {
      Logger.log(`Sync failed for ${orderId}: ${responseCode} - ${responseText}`);
      sheet.getRange(row, COLUMNS.SYNC_STATUS).setValue('Sync Failed ✗');
    }
  } catch (err) {
    Logger.log('Sync error: ' + err.toString());
    sheet.getRange(row, COLUMNS.SYNC_STATUS).setValue('Error');
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Find the row number for an order by Order ID
 */
function findOrderRow(sheet, orderId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][COLUMNS.ORDER_ID - 1] === orderId) {
      return i + 1; // 1-indexed row number
    }
  }
  return null;
}

/**
 * Format order status display values
 */
function formatStatus(status) {
  const map = {
    'pending': 'Pending',
    'awaiting_confirmation': 'Awaiting Confirmation',
    'received': 'Received',
    'failed': 'Failed / Not Received',
    'refunded': 'Refunded',
    'new': 'New',
    'whatsapp_contacted': 'WhatsApp Contacted',
    'payment_pending': 'Payment Pending',
    'payment_received': 'Payment Received',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'not_shipped': 'Not Shipped',
    'ready_to_ship': 'Ready to Ship',
    'returned': 'Returned',
  };
  return map[status] || status || '';
}

/**
 * Convert display status back to API enum value
 */
function reverseFormatStatus(displayStatus) {
  const map = {
    'Pending': 'pending',
    'Awaiting Confirmation': 'awaiting_confirmation',
    'Received': 'received',
    'Failed / Not Received': 'failed',
    'Refunded': 'refunded',
    'New': 'new',
    'WhatsApp Contacted': 'whatsapp_contacted',
    'Payment Pending': 'payment_pending',
    'Payment Received': 'payment_received',
    'Processing': 'processing',
    'Shipped': 'shipped',
    'Delivered': 'delivered',
    'Cancelled': 'cancelled',
    'Not Shipped': 'not_shipped',
    'Ready to Ship': 'ready_to_ship',
    'Returned': 'returned',
  };
  return map[displayStatus] || displayStatus?.toLowerCase().replace(/ /g, '_') || '';
}

/**
 * Format row background color based on order status
 */
function formatOrderRow(sheet, rowNum, orderStatus) {
  const statusColors = {
    'New': '#FFF8F0',
    'WhatsApp Contacted': '#FEF3C7',
    'Payment Pending': '#FEF3C7',
    'Payment Received': '#D1FAE5',
    'Processing': '#DBEAFE',
    'Shipped': '#EDE9FE',
    'Delivered': '#D1FAE5',
    'Cancelled': '#FEE2E2',
  };
  
  const color = statusColors[orderStatus] || '#FFFFFF';
  const rowRange = sheet.getRange(rowNum, 1, 1, Object.keys(COLUMNS).length);
  rowRange.setBackground(color);
}

// ============================================================
// TRIGGER SETUP
// ============================================================

/**
 * Install the edit trigger — run this once manually
 */
function setupTriggers() {
  // Remove existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onSheetEdit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new edit trigger
  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  
  Logger.log('onSheetEdit trigger installed successfully.');
}

/**
 * Remove all triggers (cleanup)
 */
function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('All triggers removed.');
}

// ============================================================
// MANUAL UTILITIES
// ============================================================

/**
 * Initialize the sheet from scratch
 */
function initialize() {
  setupOrdersSheet();
  setupTriggers();
  SpreadsheetApp.getUi().alert('TOY WORLD Orders Sheet initialized successfully!\n\nMake sure to set WORKER_URL and WEBHOOK_SECRET in Script Properties.');
}

/**
 * Test the connection to Cloudflare Worker
 */
function testConnection() {
  const config = getConfig();
  if (!config.WORKER_URL) {
    SpreadsheetApp.getUi().alert('WORKER_URL not set in Script Properties!');
    return;
  }
  
  try {
    const response = UrlFetchApp.fetch(config.WORKER_URL + '/api/settings/store', {
      muteHttpExceptions: true,
    });
    const code = response.getResponseCode();
    SpreadsheetApp.getUi().alert(`Connection test: HTTP ${code}\n${code === 200 ? '✓ Connected successfully!' : '✗ Connection failed'}`);
  } catch (err) {
    SpreadsheetApp.getUi().alert('Connection error: ' + err.toString());
  }
}

/**
 * Add a custom menu to the spreadsheet
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🧸 TOY WORLD')
    .addItem('Initialize Sheet', 'initialize')
    .addItem('Test Worker Connection', 'testConnection')
    .addSeparator()
    .addItem('Setup Triggers', 'setupTriggers')
    .addItem('Remove Triggers', 'removeTriggers')
    .addToUi();
}
