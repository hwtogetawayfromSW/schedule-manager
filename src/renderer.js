// 引入服務
const scheduleService = require('./services/scheduleService');
const dialogService = require('./services/dialogService');
const calendarService = require('./services/calendarService');

// 當前選中的日期
let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth() + 1;
let selectedDate = null;

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    try {
        initializeApp();
    } catch (error) {
        console.error('初始化失敗:', error);
    }
});

// 初始化應用程式
function initializeApp() {
    console.log('Initializing application...');
    
    // 初始化排班服務
    scheduleService.initialize();
    
    // 設置年月選擇器
    setupYearMonthSelectors();
    
    // 設置員工管理
    setupEmployeeManager();
    
    // 設置班別管理
    setupShiftManager();
    
    // 渲染日曆
    calendarService.renderCalendar();
    
    // 渲染員工列表
    renderEmployeeList();
    
    // 更新統計資料
    updateStats();
    
    console.log('Initialization complete.');
}

// 年月選擇器設置
function setupYearMonthSelectors() {
    const yearSelector = document.getElementById('yearSelector');
    const monthSelector = document.getElementById('monthSelector');
    
    if (!yearSelector || !monthSelector) {
        console.error('Year or month selector not found');
        return;
    }

    console.log('Setting up year/month selectors...');
    
    // 設置年份選項
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelector.appendChild(option);
    }
    
    // 設置月份選項
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        if (month === new Date().getMonth() + 1) option.selected = true;
        monthSelector.appendChild(option);
    }
    
    // 添加事件監聽器
    yearSelector.addEventListener('change', () => {
        calendarService.updateCalendar(parseInt(yearSelector.value), parseInt(monthSelector.value));
    });
    
    monthSelector.addEventListener('change', () => {
        calendarService.updateCalendar(parseInt(yearSelector.value), parseInt(monthSelector.value));
    });

    console.log('Year/month selectors setup complete');
}

// 設置員工管理
function setupEmployeeManager() {
    console.log('Setting up employee manager...');
    
    const employeeManagerBtn = document.getElementById('employeeManagerBtn');
    const employeeManagerDialog = document.getElementById('employeeManagerDialog');
    const addEmployeeDialog = document.getElementById('addEmployeeDialog');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    
    if (!employeeManagerBtn || !employeeManagerDialog || !addEmployeeDialog || !addEmployeeBtn || !addEmployeeForm) {
        console.error('Employee manager elements not found');
        return;
    }
    
    // 打開員工管理對話框
    employeeManagerBtn.addEventListener('click', () => {
        console.log('Opening employee manager dialog');
        renderEmployeeManagerList();
        dialogService.openDialog(employeeManagerDialog);
    });
    
    // 打開新增員工對話框
    addEmployeeBtn.addEventListener('click', () => {
        dialogService.closeDialog(employeeManagerDialog);
        dialogService.openDialog(addEmployeeDialog);
    });
    
    // 處理新增員工表單提交
    addEmployeeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addEmployeeForm);
        const employee = {
            name: formData.get('name'),
            position: formData.get('position'),
            hourlyRate: formData.get('hourlyRate')
        };
        
        scheduleService.addEmployee(employee);
        addEmployeeForm.reset();
        dialogService.closeDialog(addEmployeeDialog);
        dialogService.openDialog(employeeManagerDialog);
        renderEmployeeManagerList();
        renderEmployeeList();
    });

    console.log('Employee manager setup complete');
}

// 設置班別管理
function setupShiftManager() {
    console.log('Setting up shift manager...');
    
    const shiftSettingsBtn = document.getElementById('shiftSettingsBtn');
    const shiftSettingsDialog = document.getElementById('shiftSettingsDialog');
    const editShiftDialog = document.getElementById('editShiftDialog');
    const addShiftBtn = document.getElementById('addShiftBtn');
    const editShiftForm = document.getElementById('editShiftForm');
    const saveShiftSettingsBtn = document.getElementById('saveShiftSettingsBtn');
    
    if (!shiftSettingsBtn || !shiftSettingsDialog || !editShiftDialog || !addShiftBtn || !editShiftForm || !saveShiftSettingsBtn) {
        console.error('Shift manager elements not found');
        return;
    }
    
    // 打開班別設定對話框
    shiftSettingsBtn.addEventListener('click', () => {
        console.log('Opening shift settings dialog');
        renderShiftList();
        renderWeeklySettings();
        dialogService.openDialog(shiftSettingsDialog);
    });
    
    // 添加新班別
    addShiftBtn.addEventListener('click', () => {
        editShiftForm.reset();
        dialogService.closeDialog(shiftSettingsDialog);
        dialogService.openDialog(editShiftDialog);
    });
    
    // 處理班別表單提交
    editShiftForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(editShiftForm);
        const shift = {
            name: formData.get('name'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            color: formData.get('color')
        };
        
        scheduleService.addShift(shift);
        editShiftForm.reset();
        dialogService.closeDialog(editShiftDialog);
        dialogService.openDialog(shiftSettingsDialog);
        renderShiftList();
    });
    
    // 保存每週預設設定
    saveShiftSettingsBtn.addEventListener('click', () => {
        const weeklySettings = {};
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        days.forEach(day => {
            const dayElement = document.getElementById(`weekly-${day}`);
            if (dayElement) {
                const shifts = Array.from(dayElement.querySelectorAll('input[type="checkbox"]:checked'))
                    .map(checkbox => checkbox.value);
                weeklySettings[day] = shifts;
            }
        });
        
        scheduleService.setWeeklyDefaults(weeklySettings);
        dialogService.closeDialog(shiftSettingsDialog);
    });

    console.log('Shift manager setup complete');
}

// 處理排班點擊事件
calendarService.handleScheduleClick = function(cell, date) {
    selectedDate = date;
    const scheduleDialog = document.getElementById('scheduleDialog');
    const selectedDateSpan = document.getElementById('selectedDate');
    const employeeSelector = document.getElementById('employeeSelector');
    const currentSchedules = document.getElementById('currentSchedules');
    const shiftButtons = document.querySelector('.shift-buttons');
    
    // 設置日期顯示
    selectedDateSpan.textContent = date;
    
    // 填充員工選擇器
    const employees = scheduleService.getEmployees();
    employeeSelector.innerHTML = employees.map(employee => `
        <option value="${employee.id}">${employee.name}</option>
    `).join('');
    
    // 顯示當前排班
    const daySchedules = scheduleService.getDaySchedule(date);
    currentSchedules.innerHTML = daySchedules.map(schedule => {
        const employee = scheduleService.getEmployee(schedule.employeeId);
        return `
            <div class="schedule-item schedule-${schedule.shiftName}">
                <span>${employee?.name} - ${schedule.shiftName}</span>
                <button class="btn-delete" onclick="window.removeSchedule('${date}', ${schedule.employeeId})">×</button>
            </div>
        `;
    }).join('');
    
    // 設置班次按鈕
    const shifts = scheduleService.getShifts();
    shiftButtons.innerHTML = Object.entries(shifts).map(([name, shift]) => `
        <button class="shift-button" data-shift="${name}" style="background-color: ${shift.color}">
            ${name}
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
            calendarService.updateCellSchedules(cell, date);
            updateStats();
            dialogService.closeDialog(scheduleDialog);
        });
    });
    
    // 顯示對話框
    dialogService.openDialog(scheduleDialog);
}

// 更新單元格的排班顯示
calendarService.updateCellSchedules = function(cell, date) {
    if (!cell) return;
    
    const scheduleContainer = cell.querySelector('.schedule-container');
    if (!scheduleContainer) return;
    
    const schedules = scheduleService.getDaySchedule(date);
    scheduleContainer.innerHTML = schedules.map(schedule => {
        const employee = scheduleService.getEmployee(schedule.employeeId);
        return `
            <div class="schedule-item schedule-${schedule.shiftName}">
                ${employee?.name} - ${schedule.shiftName}
            </div>
        `;
    }).join('');
}

// 渲染員工列表
function renderEmployeeList() {
    console.log('Rendering employee list...');
    
    const employeeList = document.getElementById('employeeList');
    if (!employeeList) {
        console.error('Employee list element not found');
        return;
    }
    
    const employees = scheduleService.getEmployees();
    employeeList.innerHTML = employees.map(employee => `
        <div class="employee-item">
            <span>${employee.name}</span>
            <button class="btn-delete" onclick="window.removeEmployee(${employee.id})">×</button>
        </div>
    `).join('');
}

// 渲染員工管理列表
function renderEmployeeManagerList() {
    console.log('Rendering employee manager list...');
    
    const employeeManagerList = document.getElementById('employeeManagerList');
    if (!employeeManagerList) {
        console.error('Employee manager list element not found');
        return;
    }
    
    const employees = scheduleService.getEmployees();
    employeeManagerList.innerHTML = employees.map(employee => `
        <tr>
            <td>${employee.name}</td>
            <td>${employee.position}</td>
            <td>${employee.hourlyRate}</td>
            <td>
                <button class="btn-delete" onclick="window.removeEmployee(${employee.id})">刪除</button>
            </td>
        </tr>
    `).join('');
}

// 渲染班別列表
function renderShiftList() {
    console.log('Rendering shift list...');
    
    const shiftList = document.getElementById('shiftList');
    if (!shiftList) {
        console.error('Shift list element not found');
        return;
    }
    
    const shifts = scheduleService.getShifts();
    shiftList.innerHTML = Object.entries(shifts).map(([name, shift]) => `
        <tr>
            <td>${name}</td>
            <td>${shift.startTime}</td>
            <td>${shift.endTime}</td>
            <td style="background-color: ${shift.color}">${shift.color}</td>
            <td>
                <button class="btn-delete" onclick="window.removeShift('${name}')">刪除</button>
            </td>
        </tr>
    `).join('');
}

// 渲染每週預設設定
function renderWeeklySettings() {
    console.log('Rendering weekly settings...');
    
    const weeklySettingsContainer = document.getElementById('weeklySettingsContainer');
    if (!weeklySettingsContainer) {
        console.error('Weekly settings container not found');
        return;
    }
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const shifts = scheduleService.getShifts();
    const weeklyDefaults = scheduleService.getWeeklyDefaults();
    
    weeklySettingsContainer.innerHTML = days.map(day => `
        <div class="weekly-setting" id="weekly-${day}">
            <h3>${day.charAt(0).toUpperCase() + day.slice(1)}</h3>
            ${Object.keys(shifts).map(shiftName => `
                <label>
                    <input type="checkbox" value="${shiftName}"
                        ${weeklyDefaults[day]?.includes(shiftName) ? 'checked' : ''}>
                    ${shiftName}
                </label>
            `).join('')}
        </div>
    `).join('');
}

// 更新統計資料
function updateStats() {
    console.log('Updating stats...');
    
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) {
        console.error('Stats container not found');
        return;
    }
    
    const stats = scheduleService.calculateStats();
    statsContainer.innerHTML = `
        <div>總排班數：${stats.totalShifts}</div>
        <div>總工時：${stats.totalHours}</div>
        <div>總薪資：${stats.totalSalary}</div>
    `;
}

// 全局函數定義
window.removeEmployee = function(employeeId) {
    if (confirm('確定要刪除該員工嗎？')) {
        scheduleService.removeEmployee(employeeId);
        renderEmployeeList();
        renderEmployeeManagerList();
        calendarService.renderCalendar();
        updateStats();
    }
}

window.removeShift = function(shiftName) {
    if (confirm('確定要刪除該班別嗎？')) {
        scheduleService.removeShift(shiftName);
        renderShiftList();
        calendarService.renderCalendar();
        updateStats();
    }
}

window.removeSchedule = function(date, employeeId) {
    if (confirm('確定要刪除該排班嗎？')) {
        scheduleService.removeDaySchedule(date, employeeId);
        const cell = document.querySelector(`[data-date="${date}"]`);
        if (cell) {
            calendarService.updateCellSchedules(cell, date);
        }
        updateStats();
    }
}