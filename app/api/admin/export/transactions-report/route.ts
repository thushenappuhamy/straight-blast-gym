export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import Booking from '@/models/Booking';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

// Middleware to verify admin token
const verifyAdminToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      throw new Error('Not authorized');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Helper to generate HTML report
function generateTransactionReport(data: any): string {
  const timestamp = new Date().toLocaleString('en-US');
  const totalRevenue = data.transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
  const statuses = data.transactions.reduce((acc: any, t: any) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const types = data.transactions.reduce((acc: any, t: any) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {});

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Transaction Report - SBG Admin</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 20px;
      color: #333;
    }
    .header {
      border-bottom: 4px solid #F4D03F;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo { font-size: 24px; font-weight: bold; color: #F4D03F; }
    .report-title { font-size: 28px; font-weight: bold; margin: 10px 0; }
    .timestamp { color: #666; font-size: 12px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #2B2621;
      color: #F4D03F;
      padding: 15px;
      border-radius: 4px;
      text-align: center;
    }
    .stat-value { font-size: 24px; font-weight: bold; }
    .stat-label { font-size: 12px; margin-top: 5px; color: #999; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #2B2621;
      color: #F4D03F;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      font-size: 12px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) { background: #f9f9f9; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #2B2621;
      border-left: 4px solid #F4D03F;
      padding-left: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🏋️ STRAIGHT BLAST GYM</div>
    <div class="report-title">Transaction Report</div>
    <div class="timestamp">Generated: ${timestamp}</div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">LKR ${totalRevenue.toLocaleString()}</div>
      <div class="stat-label">Total Revenue</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${data.transactions.length}</div>
      <div class="stat-label">Total Transactions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${Object.keys(types).length}</div>
      <div class="stat-label">Transaction Types</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">LKR ${Math.round(totalRevenue / data.transactions.length).toLocaleString()}</div>
      <div class="stat-label">Avg Transaction</div>
    </div>
  </div>

  <div class="section-title">Transaction Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>Type</th>
        <th>Count</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(types).map(([type, count]: [string, any]) => 
        `<tr>
          <td>${type}</td>
          <td>${count}</td>
          <td>${((count / data.transactions.length) * 100).toFixed(1)}%</td>
        </tr>`
      ).join('')}
    </tbody>
  </table>

  <div class="section-title">Status Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>Status</th>
        <th>Count</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(statuses).map(([status, count]: [string, any]) => 
        `<tr>
          <td><strong>${status}</strong></td>
          <td>${count}</td>
          <td>${((count / data.transactions.length) * 100).toFixed(1)}%</td>
        </tr>`
      ).join('')}
    </tbody>
  </table>

  <div class="section-title">Recent Transactions</div>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Member</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${data.transactions.slice(0, 50).map((t: any) => 
        `<tr>
          <td>${t.id}</td>
          <td>${t.member}</td>
          <td>${t.type}</td>
          <td>LKR ${t.amount.toLocaleString()}</td>
          <td>${t.date}</td>
          <td><strong>${t.status}</strong></td>
        </tr>`
      ).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>This report is confidential and for internal admin use only.</p>
    <p>SBG Admin Dashboard © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;
}

// GET - Generate transaction report (HTML for PDF conversion)
export async function GET(request: NextRequest) {
  try {

    await connectDB();

    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    try {
      verifyAdminToken(token);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Fetch all transactional data
    const [members, bookings] = await Promise.all([
      User.find({ role: 'user' }).select('firstName lastName email plan membershipStatus createdAt').lean(),
      Booking.find()
        .populate('memberId', 'firstName lastName email')
        .populate('trainerId', 'name')
        .lean(),
    ]);

    // Prepare transaction data
    const transactions: any[] = [];

    // Process membership transactions
    members.forEach((member) => {
      const planPrices: Record<string, number> = {
        basic: 2500,
        gold: 5000,
        elite: 8000,
      };
      const amount = planPrices[(member.plan || 'basic').toLowerCase()] || 0;
      
      transactions.push({
        id: `MEM-${member._id.toString().slice(-6)}`,
        member: `${member.firstName} ${member.lastName}`,
        email: member.email,
        type: 'Membership',
        amount: amount,
        payment: 'Card',
        date: new Date(member.createdAt).toLocaleDateString('en-US'),
        status: member.membershipStatus || 'active',
        description: `${member.plan?.toUpperCase() || 'BASIC'} Membership`,
      });
    });

    // Process booking transactions
    bookings.forEach((booking) => {
      const memberData = booking.memberId as any;
      const trainerData = booking.trainerId as any;
      
      transactions.push({
        id: `BKG-${booking._id.toString().slice(-6)}`,
        member: memberData?.firstName ? `${memberData.firstName} ${memberData.lastName}` : 'Unknown',
        email: memberData?.email || 'N/A',
        type: 'Trainer Session',
        amount: booking.fee || 0,
        payment: 'Card',
        date: new Date(booking.dateTime).toLocaleDateString('en-US'),
        status: booking.status,
        description: `${booking.type} - ${trainerData?.name || 'Trainer'}`,
      });
    });

    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const html = generateTransactionReport({ transactions });
    const timestamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="transaction-report_${timestamp}.html"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
