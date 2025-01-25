// 計算工作時數
export function calculateWorkHours(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let hours = endHour - startHour;
    let minutes = endMinute - startMinute;
    
    if (hours < 0) hours += 24;
    if (minutes < 0) {
        hours -= 1;
        minutes += 60;
    }
    
    return hours + minutes / 60;
}

// 計算月度工時和薪資
export function calculateMonthlyStats(scheduleData, employees, shifts) {
    const stats = {};
    
    employees.forEach(employee => {
        stats[employee.id] = {
            totalHours: 0,
            totalSalary: 0,
            shiftCounts: {}
        };
    });
    
    Object.entries(scheduleData).forEach(([date, daySchedule]) => {
        daySchedule.forEach(schedule => {
            const employee = employees.find(e => e.id === schedule.employeeId);
            const shift = shifts[schedule.shiftName];
            
            if (employee && shift) {
                const hours = calculateWorkHours(shift.startTime, shift.endTime);
                const hourlyRate = employee.hourlyRate || shift.hourlyRate;
                
                stats[employee.id].totalHours += hours;
                stats[employee.id].totalSalary += hours * hourlyRate;
                
                stats[employee.id].shiftCounts[schedule.shiftName] = 
                    (stats[employee.id].shiftCounts[schedule.shiftName] || 0) + 1;
            }
        });
    });
    
    return stats;
}

// 檢查排班規則
export function validateSchedule(newSchedule, existingSchedules, rules) {
    const errors = [];
    
    // 檢查每日最大班數
    const dailyShiftCount = existingSchedules.length + 1;
    if (dailyShiftCount > rules.maxShiftsPerDay) {
        errors.push(`超過每日最大班數限制 (${rules.maxShiftsPerDay} 班)`);
    }
    
    // 檢查休息時間
    if (existingSchedules.length > 0) {
        existingSchedules.forEach(schedule => {
            const restHours = calculateRestHours(schedule, newSchedule);
            if (restHours < rules.minRestHours) {
                errors.push(`休息時間不足 ${rules.minRestHours} 小時`);
            }
        });
    }
    
    return errors;
}

// 計算兩班之間的休息時間
function calculateRestHours(schedule1, schedule2) {
    // 實作休息時間計算邏輯
    return 24; // 臨時返回值，需要實際實作
}

// 生成 .ics 文件內容
export function generateICS(scheduleData, employee, shifts) {
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Schedule Manager//EN'
    ];
    
    Object.entries(scheduleData)
        .filter(([_, daySchedule]) => 
            daySchedule.some(s => s.employeeId === employee.id))
        .forEach(([date, daySchedule]) => {
            daySchedule
                .filter(s => s.employeeId === employee.id)
                .forEach(schedule => {
                    const shift = shifts[schedule.shiftName];
                    if (!shift) return;
                    
                    const [year, month, day] = date.split('-');
                    const [startHour, startMinute] = shift.startTime.split(':');
                    const [endHour, endMinute] = shift.endTime.split(':');
                    
                    icsContent.push(
                        'BEGIN:VEVENT',
                        `DTSTART:${year}${month}${day}T${startHour}${startMinute}00`,
                        `DTEND:${year}${month}${day}T${endHour}${endMinute}00`,
                        `SUMMARY:${schedule.shiftName}`,
                        `DESCRIPTION:${schedule.notes || ''}`,
                        'END:VEVENT'
                    );
                });
        });
    
    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
}

// 格式化日期
export function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 解析時間字符串
export function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
}
