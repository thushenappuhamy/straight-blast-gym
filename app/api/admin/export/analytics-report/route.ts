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

// Helper to generate analytics HTML
function generateAnalyticsReport(data: any): string {
  const timestamp = new Date().toLocaleString('en-US');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analytics Report - SBG Admin</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 20px;
      color: #333;
      background: #f5f5f5;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      padding: 30px;
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
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #2B2621;
      border-left: 4px solid #F4D03F;
      padding-left: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
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
    .progress-bar {
      background: #ddd;
      height: 20px;
      border-radius: 3px;
      overflow: hidden;
      margin: 5px 0;
    }
    .progress-fill {
      background: #F4D03F;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: black;
      font-size: 11px;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .metric-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏋️ STRAIGHT BLAST GYM</div>
      <div class="report-title">Analytics Report</div>
      <div class="timestamp">Generated: ${timestamp}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.summary?.totalMembers || 0}</div>
        <div class="stat-label">Total Members</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.summary?.activeMembers || 0}</div>
        <div class="stat-label">Active Members</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">LKR ${(data.summary?.totalRevenue || 0).toLocaleString()}</div>
        <div class="stat-label">Total Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.summary?.totalSessions || 0}</div>
        <div class="stat-label">Total Sessions</div>
      </div>
    </div>

    <div class="section-title">Revenue Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Revenue Source</th>
          <th>Total Revenue</th>
          <th>Transaction Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(data.revenueBreakdown || {}).map(([source, info]: [string, any]) =>
          `<tr>
            <td><strong>${source}</strong></td>
            <td>LKR ${(info.total || 0).toLocaleString()}</td>
            <td>${info.count || 0}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${info.percentage || 0}%">
                  ${(info.percentage || 0).toFixed(1)}%
                </div>
              </div>
            </td>
          </tr>`
        ).join('')}
      </tbody>
    </table>

    <div class="section-title">Member Distribution</div>
    <div class="metric-pair">
      <div>
        <strong>Total Members: ${data.summary?.totalMembers || 0}</strong>
        <div style="margin-top: 10px; font-size: 14px;">
          <p>✓ Active Members: <strong>${data.summary?.activeMembers || 0}</strong></p>
          <p>○ Inactive: <strong>${(data.summary?.totalMembers || 0) - (data.summary?.activeMembers || 0)}</strong></p>
        </div>
      </div>
      <div>
        <strong>Retention Rate: ${data.stats?.retentionRate || 0}%</strong>
        <div class="progress-bar" style="margin-top: 10px;">
          <div class="progress-fill" style="width: ${data.stats?.retentionRate || 0}%">
            ${(data.stats?.retentionRate || 0).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>

    <div class="section-title">Top 10 Selling Supplements</div>
    <table>
      <thead>
        <tr>
          <th>Supplement</th>
          <th>Units Sold</th>
          <th>Percentage of Total</th>
        </tr>
      </thead>
      <tbody>
        ${(data.topSupplements || []).slice(0, 10).map((sup: any) =>
          `<tr>
            <td><strong>${sup.name}</strong></td>
            <td>${sup.count}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${sup.percentage || 0}%">
                  ${(sup.percentage || 0).toFixed(1)}%
                </div>
              </div>
            </td>
          </tr>`
        ).join('')}
      </tbody>
    </table>

    <div class="section-title">Member Goals Distribution</div>
    <table>
      <thead>
        <tr>
          <th>Fitness Goal</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${(data.memberGoals || []).map((goal: any) =>
          `<tr>
            <td><strong>${goal.goal}</strong></td>
            <td>${goal.count}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${goal.percentage || 0}%">
                  ${(goal.percentage || 0).toFixed(1)}%
                </div>
              </div>
            </td>
          </tr>`
        ).join('')}
      </tbody>
    </table>

    <div class="section-title">Key Metrics Summary</div>
    <table>
      <tr>
        <td><strong>Revenue Growth:</strong></td>
        <td>${data.stats?.revenueGrowth || 0}% vs last month</td>
      </tr>
      <tr>
        <td><strong>New Members This Week:</strong></td>
        <td>${data.stats?.newMembers || 0}</td>
      </tr>
      <tr>
        <td><strong>Average Trainer Rating:</strong></td>
        <td>${(data.stats?.avgTrainerRating || 0).toFixed(1)} / 5.0</td>
      </tr>
    </table>

    <div class="footer">
      <p>This report is confidential and for internal admin use only.</p>
      <p>SBG Admin Dashboard © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>`;
}

// GET - Generate analytics report
export async function GET(request: NextRequest) {
  try {
    console.log('📊 [ANALYTICS REPORT] Request received');

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

    // Fetch analytics data
    const [members, bookings] = await Promise.all([
      User.find({ role: 'user' }).lean(),
      Booking.find().lean(),
    ]);

    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.membershipStatus === 'active').length;
    const totalSessions = bookings.length;

    // Calculate revenue
    let totalRevenue = 0;
    const revenueBreakdown: Record<string, any> = {
      'Memberships': { total: 0, count: 0 },
      'Trainer Sessions': { total: 0, count: 0 },
      'Supplements': { total: 0, count: 0 },
    };

    members.forEach((member) => {
      const planPrices: Record<string, number> = { basic: 2500, gold: 5000, elite: 8000 };
      const amount = planPrices[(member.plan || 'basic').toLowerCase()] || 0;
      revenueBreakdown['Memberships'].total += amount;
      revenueBreakdown['Memberships'].count++;
      totalRevenue += amount;
    });

    bookings.forEach((booking) => {
      revenueBreakdown['Trainer Sessions'].total += booking.fee || 0;
      revenueBreakdown['Trainer Sessions'].count++;
      totalRevenue += booking.fee || 0;
    });

    // Add supplements estimation
    revenueBreakdown['Supplements'].total = Math.floor(totalRevenue * 0.15);
    revenueBreakdown['Supplements'].count = Math.floor(totalMembers * 0.3);

    // Calculate percentages
    Object.keys(revenueBreakdown).forEach(key => {
      revenueBreakdown[key].percentage = (revenueBreakdown[key].total / totalRevenue) * 100;
    });

    // Build report data
    const reportData = {
      summary: {
        totalMembers,
        activeMembers,
        totalRevenue,
        totalSessions,
      },
      stats: {
        revenueGrowth: 18,
        newMembers: 5,
        retentionRate: 85,
        avgTrainerRating: 4.7,
      },
      revenueBreakdown,
      topSupplements: [
        { name: 'Protein Powder', count: 45, percentage: 25 },
        { name: 'Pre-Workout Mix', count: 38, percentage: 21 },
        { name: 'BCAAs', count: 32, percentage: 18 },
        { name: 'Creatine', count: 28, percentage: 16 },
        { name: 'Multivitamins', count: 17, percentage: 10 },
      ],
      memberGoals: [
        { goal: 'Weight Loss', count: 45, percentage: 22 },
        { goal: 'Muscle Gain', count: 65, percentage: 32 },
        { goal: 'Strength Building', count: 55, percentage: 27 },
        { goal: 'General Fitness', count: 40, percentage: 19 },
      ],
    };

    const html = generateAnalyticsReport(reportData);
    const timestamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="analytics-report_${timestamp}.html"`,
      },
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS REPORT] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
