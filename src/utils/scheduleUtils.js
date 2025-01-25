// 計算工作時數
export function calculateWorkHours(shift) {
    if (!shift || !shift.startTime || !shift.endTime) {
        return 0;
    }

    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);
    
    let hours = endHour - startHour;
    let minutes = endMinute - startMinute;
    
    if (minutes < 0) {
        hours -= 1;
        minutes += 60;
    }
    
    return hours + minutes / 60;
}

// 計算月度統計信息
export function calculateMonthlyStats(monthSchedule, employees, shifts) {
    const stats = {};
    
    // 初始化每個員工的統計信息
    employees.forEach(employee => {
        stats[employee.id] = {
            totalHours: 0,
            shiftCounts: {},
            totalShifts: 0
        };
    });
    
    // 如果沒有排班數據，直接返回初始化的統計信息
    if (!monthSchedule || typeof monthSchedule !== 'object') {
        return stats;
    }
    
    // 遍歷每一天的排班
    Object.entries(monthSchedule).forEach(([date, daySchedules]) => {
        // 確保 daySchedules 是數組
        if (!Array.isArray(daySchedules)) {
            return;
        }
        
        // 處理每個排班
        daySchedules.forEach(schedule => {
            if (!schedule || !schedule.employeeId || !schedule.shiftName) {
                return;
            }
            
            const employeeStats = stats[schedule.employeeId];
            if (!employeeStats) {
                return;
            }
            
            const shift = shifts[schedule.shiftName];
            if (!shift) {
                return;
            }
            
            // 計算工時
            const hours = calculateWorkHours(shift);
            employeeStats.totalHours += hours;
            
            // 統計班次數量
            employeeStats.shiftCounts[schedule.shiftName] = 
                (employeeStats.shiftCounts[schedule.shiftName] || 0) + 1;
            employeeStats.totalShifts += 1;
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
