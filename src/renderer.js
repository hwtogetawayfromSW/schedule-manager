import { scheduleService } from './services/scheduleService.js';
import { calculateWorkHours, calculateMonthlyStats } from './utils/scheduleUtils.js';

// 當前選中的日期
let selectedDate = null;

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    initialize();
});

function initialize() {
    try {
        console.log('Initializing application...');
        setupYearMonthSelectors();
        setupEmployeeManager();
        renderEmployeeList();
        renderCalendar();
        updateStats();
        console.log('Initialization complete.');
    } catch (error) {
        console.error('初始化失敗:', error);
    }
}

// 年月選擇器設置
function setupYearMonthSelectors() {
    console.log('Setting up year/month selectors...');
    const yearSelector = document.getElementById('yearSelector');
    const monthSelector = document.getElementById('monthSelector');

    if (!yearSelector || !monthSelector) {
        console.error('Year or month selector not found');
        return;
    }

    // 設置年份選項（從 2025 年開始，往後 10 年）
    const startYear = 2025;
    const endYear = startYear + 10;
    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年`;
        yearSelector.appendChild(option);
    }

    // 設置月份選項
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = `${month}月`;
        monthSelector.appendChild(option);
    }

    // 設置當前年月
    const now = new Date();
    yearSelector.value = Math.max(startYear, now.getFullYear());
    monthSelector.value = now.getMonth() + 1;

    // 添加事件監聽器
    yearSelector.addEventListener('change', () => {
        console.log('Year changed:', yearSelector.value);
        renderCalendar();
        updateStats();
    });
    monthSelector.addEventListener('change', () => {
        console.log('Month changed:', monthSelector.value);
        renderCalendar();
        updateStats();
    });
}

// 設置員工管理
function setupEmployeeManager() {
    const employeeManagerBtn = document.getElementById('employeeManagerBtn');
    const employeeManagerDialog = document.getElementById('employeeManagerDialog');
    const addEmployeeDialog = document.getElementById('addEmployeeDialog');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    
    // 打開員工管理對話框
    employeeManagerBtn.addEventListener('click', () => {
        renderEmployeeManagerList();
        employeeManagerDialog.classList.remove('hidden');
    });
    
    // 打開新增員工對話框
    addEmployeeBtn.addEventListener('click', () => {
        employeeManagerDialog.classList.add('hidden');
        addEmployeeDialog.classList.remove('hidden');
    });
    
    // 處理新增員工表單提交
    addEmployeeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addEmployeeForm);
        const employee = {
            name: formData.get('name'),
            position: formData.get('position'),
            hourlyRate: formData.get('hourlyRate') ? Number(formData.get('hourlyRate')) : null
        };
        
        scheduleService.addEmployee(employee.name, employee.position, employee.hourlyRate);
        addEmployeeForm.reset();
        addEmployeeDialog.classList.add('hidden');
        employeeManagerDialog.classList.remove('hidden');
        renderEmployeeManagerList();
        renderEmployeeList();
    });
    
    // 關閉對話框按鈕
    document.querySelectorAll('.close-dialog').forEach(button => {
        button.addEventListener('click', () => {
            employeeManagerDialog.classList.add('hidden');
            addEmployeeDialog.classList.add('hidden');
        });
    });
}

// 渲染員工管理列表
function renderEmployeeManagerList() {
    const employeeManagerList = document.getElementById('employeeManagerList');
    const employees = scheduleService.employees;
    
    employeeManagerList.innerHTML = employees.map(employee => `
        <div class="employee-item">
            <div class="employee-info">
                <span class="employee-name">${employee.name}</span>
                <span class="employee-position">${employee.position}</span>
            </div>
            <button class="btn btn-danger" onclick="window.removeEmployee(${employee.id})">刪除</button>
        </div>
    `).join('');
}

// 渲染員工列表
function renderEmployeeList() {
    const employeeList = document.getElementById('employeeList');
    const employees = scheduleService.employees;
    
    employeeList.innerHTML = employees.map(employee => `
        <div class="employee-item">
            <div class="employee-info">
                <span class="employee-name">${employee.name}</span>
                <span class="employee-position">${employee.position}</span>
            </div>
        </div>
    `).join('');
}

// 處理排班點擊事件
function handleScheduleClick(cell, date) {
    selectedDate = date;
    const scheduleDialog = document.getElementById('scheduleDialog');
    const selectedDateSpan = document.getElementById('selectedDate');
    const employeeSelector = document.getElementById('employeeSelector');
    const currentSchedules = document.getElementById('currentSchedules');
    const shiftButtons = document.querySelector('.shift-buttons');
    
    // 設置日期顯示
    selectedDateSpan.textContent = date;
    
    // 填充員工選擇器
    employeeSelector.innerHTML = scheduleService.employees.map(employee => `
        <option value="${employee.id}">${employee.name}</option>
    `).join('');
    
    // 顯示當前排班
    const daySchedules = scheduleService.getDaySchedule(date);
    currentSchedules.innerHTML = daySchedules.map(schedule => {
        const employee = scheduleService.employees.find(e => e.id === schedule.employeeId);
        return `
            <div class="schedule-item schedule-${schedule.shiftName}">
                <span>${employee?.name} - ${schedule.shiftName}</span>
                <button class="btn btn-danger btn-sm" onclick="window.removeSchedule('${date}', ${schedule.employeeId})">
                    ×
                </button>
            </div>
        `;
    }).join('');
    
    // 設置班次按鈕
    const shifts = Object.keys(scheduleService.shifts);
    shiftButtons.innerHTML = shifts.map(shift => `
        <button class="shift-button" data-shift="${shift}">
            ${shift}
        </button>
    `).join('');
    
    // 添加班次按鈕點擊事件
    const buttons = shiftButtons.querySelectorAll('.shift-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const employeeId = Number(employeeSelector.value);
            const shiftName = button.dataset.shift;
            const notes = document.getElementById('scheduleNotes').value;
            
            scheduleService.updateDaySchedule(date, employeeId, shiftName, notes);
            updateCellSchedules(cell, date);
            updateStats();
            scheduleDialog.classList.add('hidden');
        });
    });
    
    // 顯示對話框
    scheduleDialog.classList.remove('hidden');
}

// 更新單元格的排班顯示
function updateCellSchedules(cell, date) {
    const scheduleContainer = cell.querySelector('.schedule-container') || 
        (() => {
            const container = document.createElement('div');
            container.className = 'schedule-container';
            cell.appendChild(container);
            return container;
        })();
    
    const schedules = scheduleService.getDaySchedule(date);
    scheduleContainer.innerHTML = schedules.map(schedule => {
        const employee = scheduleService.employees.find(e => e.id === schedule.employeeId);
        return `
            <div class="schedule-item schedule-${schedule.shiftName}">
                ${employee?.name} - ${schedule.shiftName}
            </div>
        `;
    }).join('');
}

// 更新統計信息
function updateStats() {
    const statsContainer = document.getElementById('employeeStats');
    const year = parseInt(document.getElementById('yearSelector').value);
    const month = parseInt(document.getElementById('monthSelector').value);
    
    const monthSchedule = scheduleService.getMonthSchedule(year, month);
    const stats = calculateMonthlyStats(monthSchedule, scheduleService.employees, scheduleService.shifts);
    
    statsContainer.innerHTML = scheduleService.employees.map(employee => {
        const employeeStats = stats[employee.id];
        return `
            <div class="stats-item">
                <span class="stats-label">${employee.name}</span>
                <span class="stats-value">${employeeStats.totalHours.toFixed(1)}小時</span>
            </div>
        `;
    }).join('');
}

// 渲染日曆
function renderCalendar() {
    console.log('Rendering calendar...');
    const calendar = document.getElementById('calendar');
    if (!calendar) {
        console.error('Calendar container not found');
        return;
    }

    const year = parseInt(document.getElementById('yearSelector').value);
    const month = parseInt(document.getElementById('monthSelector').value);
    
    if (!year || !month) {
        console.error('Invalid year or month:', { year, month });
        return;
    }

    console.log(`Rendering calendar for ${year}年${month}月`);
    
    // 清空日曆
    calendar.innerHTML = '';

    // 添加星期標題
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendar.appendChild(header);
    });

    // 獲取當月的第一天和最後一天
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    // 填充月曆的前置空白日期
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell non-working-day';
        calendar.appendChild(cell);
    }

    // 填充當月日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        
        const currentDate = new Date(year, month - 1, day);
        if (currentDate.getDay() === 0) {
            cell.classList.add('non-working-day');
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        // 添加日期資訊到 data 屬性
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        cell.dataset.date = dateStr;
        
        // 添加點擊事件
        cell.addEventListener('click', () => handleScheduleClick(cell, dateStr));
        
        // 顯示已存在的排班資訊
        updateCellSchedules(cell, dateStr);
        
        calendar.appendChild(cell);
    }

    // 填充月曆的後置空白日期
    const lastDayOfWeek = lastDay.getDay();
    const remainingDays = 6 - lastDayOfWeek;
    for (let i = 0; i < remainingDays; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell non-working-day';
        calendar.appendChild(cell);
    }

    console.log('Calendar rendered successfully');
}

// 全局函數定義
window.removeEmployee = function(employeeId) {
    if (confirm('確定要刪除該員工嗎？')) {
        scheduleService.removeEmployee(employeeId);
        renderEmployeeManagerList();
        renderEmployeeList();
        renderCalendar();
        updateStats();
    }
};

window.removeSchedule = function(date, employeeId) {
    scheduleService.removeDaySchedule(date, employeeId);
    const cell = document.querySelector(`[data-date="${date}"]`);
    if (cell) {
        updateCellSchedules(cell, date);
    }
    updateStats();
};