import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Attendance } from '@/models/Attendance';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const selectedYear = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // MRR Data calculation (last 30 days of the selected year or last 30 days if current year)
    const mrrData = [];
    let currentMRR = 0;
    
    const isCurrentYear = selectedYear === new Date().getFullYear();
    const referenceDate = isCurrentYear ? new Date() : new Date(selectedYear, 11, 31);

    // Calculate initial MRR from Users created before the start of the period
    const olderRecords = await User.find({ 
      role: 'user', 
      createdAt: { $lt: subDays(referenceDate, 30) } 
    });
    olderRecords.forEach(user => {
      const plan = (user.plan || '').toLowerCase();
      if (plan === 'elite') currentMRR += 8000;
      else if (plan === 'gold') currentMRR += 5000;
      else if (plan === 'basic') currentMRR += 2500;
    });

    for (let i = 30; i >= 0; i--) {
      const targetDate = subDays(referenceDate, i);
      const start = startOfDay(targetDate);
      const end = endOfDay(targetDate);
      
      const dailyNewUsers = await User.find({ role: 'user', createdAt: { $gte: start, $lte: end } });
      
      dailyNewUsers.forEach(user => {
        const plan = (user.plan || '').toLowerCase();
        if (plan === 'elite') currentMRR += 8000;
        else if (plan === 'gold') currentMRR += 5000;
        else if (plan === 'basic') currentMRR += 2500;
      });

      mrrData.push({
        date: format(targetDate, 'MMM dd'),
        mrr: currentMRR,
        newMembers: dailyNewUsers.length
      });
    }

    // Attendance heat map calculation
    const attendanceData: any = [
      { time: '6 AM', Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      { time: '9 AM', Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      { time: '12 PM', Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      { time: '5 PM', Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      { time: '8 PM', Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    ];

    const allAttendances = await Attendance.find({ 
      checkInTime: { 
        $gte: startOfDay(subDays(referenceDate, 7)),
        $lte: endOfDay(referenceDate)
      }
    });

    allAttendances.forEach(att => {
        const time = new Date(att.checkInTime);
        const day = time.getDay(); // 0(Sun) - 6(Sat)
        const hour = time.getHours();

        let timeSlot = '';
        if (hour >= 5 && hour < 8) timeSlot = '6 AM';
        else if (hour >= 8 && hour < 11) timeSlot = '9 AM';
        else if (hour >= 11 && hour < 15) timeSlot = '12 PM';
        else if (hour >= 15 && hour < 19) timeSlot = '5 PM';
        else timeSlot = '8 PM';
        
        const dayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
        
        const slot = attendanceData.find((d: any) => d.time === timeSlot);
        if(slot) slot[dayStr]++;
    });

    return NextResponse.json({ success: true, mrrData, attendanceData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
