/**
 * 日期相關的工具函數
 */

// 檢查是否為工作日（預設週日公休）
function isWorkDay(date) {
    return date.getDay() !== 0; // 0 表示週日
}

// 取得指定年月的所有日期
function getMonthDates(year, month) {
    const dates = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const { schedule } = require('../store/scheduleStore').getState();

    // 填充月曆的前置空白日期
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
        dates.push({
            day: '',
            month: '',
            year: '',
            isHoliday: true,
            shifts: []
        });
    }

    // 填充當月日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        const scheduleData = schedule.find(s => 
            s.year === year && 
            s.month === month && 
            s.day === day
        );

        dates.push({
            day,
            month,
            year,
            isHoliday: !isWorkDay(date),
            shifts: scheduleData ? scheduleData.shifts : []
        });
    }

    // 填充月曆的後置空白日期
    const lastDayOfWeek = lastDay.getDay();
    for (let i = lastDayOfWeek; i < 6; i++) {
        dates.push({
            day: '',
            month: '',
            year: '',
            isHoliday: true,
            shifts: []
        });
    }

    return dates;
}

// 格式化時間字串 (HH:mm)
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

// 計算兩個時間之間的小時差
function calculateHoursBetween(startTime, endTime) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const totalStartMinutes = startHours * 60 + startMinutes;
    const totalEndMinutes = endHours * 60 + endMinutes;
    
    return (totalEndMinutes - totalStartMinutes) / 60;
}

module.exports = {
    isWorkDay,
    getMonthDates,
    formatTime,
    calculateHoursBetween
};
