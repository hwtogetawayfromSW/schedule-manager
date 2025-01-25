const fs = require('fs');
const path = require('path');
const scheduleStore = require('./features/schedule/store/scheduleStore');
const scheduleService = require('./features/schedule/services/scheduleService');
const { getMonthDates } = require('./features/schedule/utils/dateUtils');

// Initialize application
async function initialize() {
    try {
        // 確保 data 目錄存在
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        
        // 初始化 store
        await scheduleStore.initialize();
        
        // 設置 UI
        setupYearMonthSelectors();
        setupEventListeners();
        renderCalendar();
        updateStaffList();
    } catch (error) {
        console.error('初始化失敗:', error);
        alert('系統初始化失敗: ' + error.message);
    }
}

function setupEventListeners() {
    // 匯出按鈕
    document.getElementById('exportButton')?.addEventListener('click', exportScheduleAsImage);
    document.getElementById('exportICSButton')?.addEventListener('click', exportICS);
    
    // 年月選擇器
    document.getElementById('yearSelector')?.addEventListener('change', renderCalendar);
    document.getElementById('monthSelector')?.addEventListener('change', renderCalendar);
}

function setupYearMonthSelectors() {
    const yearSelector = document.getElementById('yearSelector');
    const monthSelector = document.getElementById('monthSelector');
    
    if (!yearSelector || !monthSelector) return;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // 設置年份選項（前後 5 年）
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        if (year === currentYear) option.selected = true;
        yearSelector.appendChild(option);
    }
    
    // 設置月份選項
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month + '月';
        if (month === currentDate.getMonth() + 1) option.selected = true;
        monthSelector.appendChild(option);
    }
}

function renderCalendar() {
    const year = parseInt(document.getElementById('yearSelector').value);
    const month = parseInt(document.getElementById('monthSelector').value);
    const dates = getMonthDates(year, month);
    
    // 獲取當前的班表數據
    const { schedule } = scheduleStore.getState();
    
    // 更新日曆視圖
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    
    // 清空現有內容
    calendar.innerHTML = '';
    
    // 添加星期標題
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    weekDays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // 添加日期格子
    dates.forEach(({ date, isWorkDay }) => {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        if (!isWorkDay) cell.classList.add('non-working-day');
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        cell.appendChild(dayNumber);
        
        // 如果是工作日，添加班別資訊
        if (isWorkDay) {
            const scheduleData = schedule.find(s => 
                s.year === year && 
                s.month === month && 
                s.day === date.getDate()
            );
            
            if (scheduleData) {
                scheduleData.shifts.forEach(shift => {
                    const shiftElement = document.createElement('div');
                    shiftElement.className = 'shift-info';
                    shiftElement.textContent = `${shift.name} (${shift.staff.join(', ')})`;
                    cell.appendChild(shiftElement);
                });
            }
        }
        
        calendar.appendChild(cell);
    });
}

function updateStaffList() {
    const { totalHours } = scheduleStore.getState();
    const staffList = document.getElementById('staffList');
    if (!staffList) return;
    
    staffList.innerHTML = '';
    Object.entries(totalHours).forEach(([staffId, hours]) => {
        const li = document.createElement('li');
        li.textContent = `${staffId}: ${hours.toFixed(1)}小時`;
        staffList.appendChild(li);
    });
}

// 訂閱 store 的變更
scheduleStore.subscribe(() => {
    renderCalendar();
    updateStaffList();
});

// 初始化應用
document.addEventListener('DOMContentLoaded', initialize);
