/**
 * HTML Email templates for PV Motors notifications.
 * Generates beautiful, responsive, brand-compliant HTML content.
 */

import { SITE_NAME, CONTACT_INFO } from "./constants";

/**
 * Returns the HTML content for a Customer Order/Booking Confirmation Email.
 */
export function getOrderConfirmationEmailHtml(order: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  id: string;
  createdAt: Date | string;
  notes?: string | null;
  variant: {
    name: string;
    price: number;
    vehicle: {
      name: string;
    };
  };
}, siteUrl: string = "https://pvmotors.in") {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(order.variant.price);

  const logoUrl = `${siteUrl}/logo.jpg`;
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - PV Motors</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f7f7;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .header {
      text-align: center;
      padding: 30px 20px;
      border-bottom: 1px solid #f0f0f0;
      background-color: #ffffff;
    }
    .logo {
      height: 48px;
      width: auto;
      display: inline-block;
    }
    .content {
      padding: 40px 30px;
    }
    h1 {
      font-size: 22px;
      font-weight: 600;
      color: #111111;
      margin-top: 0;
      margin-bottom: 12px;
      text-align: center;
    }
    .subtitle {
      font-size: 14px;
      color: #666666;
      text-align: center;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    .card {
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      padding: 24px;
      background-color: #fafafa;
      margin-bottom: 25px;
    }
    .card-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #999999;
      margin-bottom: 16px;
      margin-top: 0;
    }
    .grid-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px solid #eeeeee;
    }
    .grid-row:last-child {
      border-bottom: none;
    }
    .grid-label {
      color: #666666;
    }
    .grid-value {
      font-weight: 600;
      color: #111111;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      padding-top: 16px;
      margin-top: 8px;
      border-top: 2px solid #e5e5e5;
      font-size: 16px;
      font-weight: bold;
    }
    .price-value {
      color: #e65c00; /* Subtle orange matching brand colors */
    }
    .footer {
      background-color: #fafafa;
      padding: 30px 20px;
      text-align: center;
      font-size: 11px;
      color: #999999;
      border-top: 1px solid #e5e5e5;
      line-height: 1.6;
    }
    .footer a {
      color: #666666;
      text-decoration: none;
    }
    .btn {
      display: block;
      width: fit-content;
      margin: 30px auto 10px;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 2px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img class="logo" src="${logoUrl}" alt="PV Motors Logo" />
      </div>
      <div class="content">
        <h1>Booking Confirmed!</h1>
        <p class="subtitle">Hi ${order.customerName}, thank you for booking your test ride with PV Motors. We have received your order details and our vehicle specialist will contact you shortly.</p>
        
        <div class="card">
          <h4 class="card-title">Booking Details</h4>
          <div class="grid-row">
            <span class="grid-label">Booking ID</span>
            <span class="grid-value">${order.id}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Date</span>
            <span class="grid-value">${dateStr}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Vehicle</span>
            <span class="grid-value">${order.variant.vehicle.name}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Variant</span>
            <span class="grid-value">${order.variant.name}</span>
          </div>
          <div class="price-row">
            <span>Price (Ex-Showroom)</span>
            <span class="price-value">${formattedPrice}</span>
          </div>
        </div>

        ${order.notes ? `
        <div class="card" style="margin-top: -10px;">
          <h4 class="card-title">Special Notes</h4>
          <p style="font-size: 13px; color: #555555; margin: 0; line-height: 1.5;">${order.notes}</p>
        </div>
        ` : ''}

        <a href="${siteUrl}" class="btn">Visit Showroom</a>
      </div>
      <div class="footer">
        <p><strong>${SITE_NAME}</strong> — Authorised Dealer of KOMAKI Electric Vehicles</p>
        <p>${CONTACT_INFO.address}</p>
        <p>Phone: ${CONTACT_INFO.phone} | Email: ${CONTACT_INFO.email}</p>
        <p style="margin-top: 15px; font-size: 10px;">&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Returns the HTML content for an Admin Enquiry Notification Email.
 */
export function getEnquiryNotificationEmailHtml(enquiry: {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  vehicleName: string;
  variantName: string;
  createdAt: Date | string;
}, siteUrl: string = "https://pvmotors.in") {
  const logoUrl = `${siteUrl}/logo.jpg`;
  const dateStr = new Date(enquiry.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead Enquiry - PV Motors</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f7f7;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .header {
      text-align: center;
      padding: 30px 20px;
      border-bottom: 1px solid #f0f0f0;
      background-color: #ffffff;
    }
    .logo {
      height: 48px;
      width: auto;
      display: inline-block;
    }
    .content {
      padding: 40px 30px;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #111111;
      margin-top: 0;
      margin-bottom: 25px;
      text-align: center;
    }
    .card {
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      padding: 24px;
      background-color: #fafafa;
      margin-bottom: 25px;
    }
    .card-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #999999;
      margin-bottom: 16px;
      margin-top: 0;
    }
    .grid-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px solid #eeeeee;
    }
    .grid-row:last-child {
      border-bottom: none;
    }
    .grid-label {
      color: #666666;
      width: 120px;
      flex-shrink: 0;
    }
    .grid-value {
      font-weight: 600;
      color: #111111;
      text-align: right;
    }
    .footer {
      background-color: #fafafa;
      padding: 20px;
      text-align: center;
      font-size: 11px;
      color: #999999;
      border-top: 1px solid #e5e5e5;
    }
    .btn {
      display: block;
      width: fit-content;
      margin: 30px auto 10px;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 2px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img class="logo" src="${logoUrl}" alt="PV Motors Logo" />
      </div>
      <div class="content">
        <h1>New Lead Enquiry Received</h1>
        
        <div class="card">
          <h4 class="card-title">Customer Details</h4>
          <div class="grid-row">
            <span class="grid-label">Name</span>
            <span class="grid-value">${enquiry.name}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Phone</span>
            <span class="grid-value">+91 ${enquiry.phone}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Address</span>
            <span class="grid-value">${enquiry.address}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">City/State</span>
            <span class="grid-value">${enquiry.city}, ${enquiry.state}</span>
          </div>
        </div>

        <div class="card">
          <h4 class="card-title">Vehicle Interest</h4>
          <div class="grid-row">
            <span class="grid-label">Vehicle</span>
            <span class="grid-value">${enquiry.vehicleName}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Variant</span>
            <span class="grid-value">${enquiry.variantName}</span>
          </div>
          <div class="grid-row">
            <span class="grid-label">Received At</span>
            <span class="grid-value">${dateStr}</span>
          </div>
        </div>

        <a href="${siteUrl}/admin/enquiries" class="btn">View in Admin Panel</a>
      </div>
      <div class="footer">
        <p>This is an automated notification from ${SITE_NAME} Admin System.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
