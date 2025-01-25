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
    
    // 設置年月選擇器
    setupYearMonthSelectors();
    
    // 設置員工管理
    setupEmployeeManager();
    
    // 設置班別管理
    setupShiftManager();
    
    // 設置排班管理
    setupScheduleManager();
    
    // 更新統計資料
    updateStats();
}

// 設置年月選擇器
function setupYearMonthSelectors() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    
    if (!yearSelect || !monthSelect) {
        console.error('Year or month selector not found');
        return;
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // 設置年份選項
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年`;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
    
    // 設置月份選項
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = `${month}月`;
        monthSelect.appendChild(option);
    }
    monthSelect.value = currentDate.getMonth() + 1;
    
    // 添加事件監聽器
    yearSelect.addEventListener('change', () => {
        calendarService.currentYear = parseInt(yearSelect.value);
        calendarService.renderCalendar();
    });
    
    monthSelect.addEventListener('change', () => {
        calendarService.currentMonth = parseInt(monthSelect.value);
        calendarService.renderCalendar();
    });
    
    // 初始更新日曆
    calendarService.renderCalendar();
}

// 設置員工管理
function setupEmployeeManager() {
    console.log('Setting up employee manager...');
    
    // 渲染員工列表
    function renderEmployeeList() {
        console.log('Rendering employee list...');
        const employeeList = document.getElementById('employeeList');
        const employees = scheduleService.getEmployees();
        
        employeeList.innerHTML = employees.map(employee => `
            <div class="employee-item">
                <div class="employee-info">
                    <span>${employee.name}</span>
                    <span>${employee.position}</span>
                </div>
                <div class="employee-actions">
                    <button onclick="editEmployee('${employee.id}')" class="btn btn-small">編輯</button>
                    <button onclick="deleteEmployee('${employee.id}')" class="btn btn-small btn-danger">刪除</button>
                </div>
            </div>
        `).join('');
    }
    
    // 設置員工管理按鈕事件
    const employeeSettingsBtn = document.getElementById('employeeSettingsBtn');
    if (employeeSettingsBtn) {
        employeeSettingsBtn.addEventListener('click', () => {
            const dialog = document.getElementById('employeeDialog');
            if (dialog) {
                renderEmployeeList();
                dialogService.openDialog(dialog);
            } else {
                console.error('Employee dialog not found');
            }
        });
    }
    
    // 設置新增員工按鈕事件
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', () => {
            const form = document.getElementById('employeeForm');
            if (form) {
                form.reset();
                form.elements['employeeId'].value = '';
                
                const formTitle = document.querySelector('#employeeDialog h2');
                if (formTitle) {
                    formTitle.textContent = '新增員工';
                }
            }
        });
    }
    
    // 設置員工表單提交事件
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        employeeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(employeeForm);
            const employee = {
                name: formData.get('name'),
                position: formData.get('position'),
                hourlyRate: parseFloat(formData.get('hourlyRate'))
            };
            
            const employeeId = formData.get('employeeId');
            if (employeeId) {
                // 更新現有員工
                employee.id = employeeId;
                scheduleService.updateEmployee(employee);
            } else {
                // 添加新員工
                scheduleService.addEmployee(employee);
            }
            
            employeeForm.reset();
            renderEmployeeList();
            dialogService.closeDialog(employeeDialog);
            calendarService.renderCalendar();
        });
    }
    
    // 定義全局編輯員工函數
    window.editEmployee = (employeeId) => {
        const employee = scheduleService.getEmployeeById(employeeId);
        if (employee) {
            const form = document.getElementById('employeeForm');
            form.elements['employeeId'].value = employee.id;
            form.elements['name'].value = employee.name;
            form.elements['position'].value = employee.position;
            form.elements['hourlyRate'].value = employee.hourlyRate;
            
            const formTitle = document.querySelector('#employeeDialog h2');
            if (formTitle) {
                formTitle.textContent = '編輯員工';
            }
        }
    };
    
    // 定義全局刪除員工函數
    window.deleteEmployee = (employeeId) => {
        if (confirm('確定要刪除這個員工嗎？')) {
            scheduleService.removeEmployee(employeeId);
            renderEmployeeList();
            calendarService.renderCalendar();
        }
    };
    
    // 初始渲染
    renderEmployeeList();
}

// 設置班別管理
function setupShiftManager() {
    console.log('Setting up shift manager...');
    
    // 渲染班別列表
    function renderShiftList() {
        const shiftList = document.getElementById('shiftList');
        const shifts = scheduleService.getShifts();
        
        shiftList.innerHTML = Object.entries(shifts).map(([name, shift]) => `
            <div class="shift-item" style="border-left: 4px solid ${shift.color}">
                <div class="shift-info">
                    <span class="shift-name">${name}</span>
                    <span class="shift-time">
                        ${shift.isFullDay ? '整天' : `${shift.startTime} - ${shift.endTime}`}
                    </span>
                </div>
                <div class="shift-actions">
                    <button onclick="editShift('${name}')" class="btn btn-small">編輯</button>
                    <button onclick="deleteShift('${name}')" class="btn btn-small btn-danger">刪除</button>
                </div>
            </div>
        `).join('');
    }
    
    // 渲染每週預設班別設定
    function renderWeeklySettings() {
        const container = document.getElementById('weeklySettingsContainer');
        const shifts = scheduleService.getShifts();
        const weeklyDefaults = scheduleService.getWeeklyDefaults();
        const days = [
            { key: 'sunday', label: '星期日' },
            { key: 'monday', label: '星期一' },
            { key: 'tuesday', label: '星期二' },
            { key: 'wednesday', label: '星期三' },
            { key: 'thursday', label: '星期四' },
            { key: 'friday', label: '星期五' },
            { key: 'saturday', label: '星期六' }
        ];
        
        container.innerHTML = days.map(day => `
            <div class="weekly-setting">
                <h4>${day.label}</h4>
                <div class="shift-options">
                    ${Object.entries(shifts).map(([shiftName, shift]) => `
                        <label class="shift-option">
                            <input type="checkbox" 
                                   value="${shiftName}" 
                                   ${weeklyDefaults[day.key]?.includes(shiftName) ? 'checked' : ''}
                                   onchange="updateWeeklyDefault('${day.key}', '${shiftName}', this.checked)">
                            <span style="background-color: ${shift.color}">
                                ${shiftName}
                            </span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    // 設置整天選項
    const isFullDayCheckbox = document.getElementById('isFullDay');
    const timeGroup = document.getElementById('timeGroup');
    
    if (isFullDayCheckbox && timeGroup) {
        isFullDayCheckbox.addEventListener('change', function() {
            timeGroup.style.display = this.checked ? 'none' : 'grid';
            const timeInputs = timeGroup.querySelectorAll('input[type="time"]');
            timeInputs.forEach(input => {
                input.required = !this.checked;
            });
        });
    }
    
    // 處理顏色預設值
    const colorPresets = document.querySelectorAll('.color-preset');
    const colorInput = document.getElementById('shiftColor');
    
    if (colorInput) {
        colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                if (color) {
                    colorInput.value = color;
                }
            });
        });
    }
    
    // 處理班別表單提交
    const editShiftForm = document.getElementById('editShiftForm');
    if (editShiftForm) {
        editShiftForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const formData = new FormData(this);
            const shiftData = {
                name: formData.get('name'),
                color: formData.get('color'),
                isFullDay: formData.get('isFullDay') === 'on'
            };
            
            if (!shiftData.isFullDay) {
                shiftData.startTime = formData.get('startTime');
                shiftData.endTime = formData.get('endTime');
            }
            
            const originalName = formData.get('originalName');
            if (originalName) {
                // 刪除原有班別
                scheduleService.removeShift(originalName);
            }
            
            // 添加新班別
            scheduleService.addShift(shiftData.name, shiftData);
            
            // 更新界面
            renderShiftList();
            renderWeeklySettings();
            calendarService.renderCalendar();
            
            // 關閉對話框
            dialogService.closeDialog(editShiftDialog);
        });
    }
    
    // 設置班別設定按鈕事件
    const shiftSettingsBtn = document.getElementById('shiftSettingsBtn');
    if (shiftSettingsBtn) {
        shiftSettingsBtn.addEventListener('click', () => {
            renderShiftList();
            renderWeeklySettings();
            dialogService.openDialog(shiftSettingsDialog);
        });
    }
    
    // 定義全局更新每週預設函數
    window.updateWeeklyDefault = (day, shiftName, checked) => {
        const weeklyDefaults = scheduleService.getWeeklyDefaults();
        weeklyDefaults[day] = weeklyDefaults[day] || [];
        
        if (checked && !weeklyDefaults[day].includes(shiftName)) {
            weeklyDefaults[day].push(shiftName);
        } else if (!checked) {
            weeklyDefaults[day] = weeklyDefaults[day].filter(s => s !== shiftName);
        }
        
        scheduleService.updateWeeklyDefaults(weeklyDefaults);
        calendarService.renderCalendar();
    };
    
    // 定義全局編輯班別函數
    window.editShift = (shiftName) => {
        const shift = scheduleService.getShiftByName(shiftName);
        if (shift) {
            const form = document.getElementById('editShiftForm');
            form.elements['originalName'].value = shiftName;
            form.elements['name'].value = shiftName;
            form.elements['color'].value = shift.color;
            form.elements['isFullDay'].checked = shift.isFullDay;
            
            if (!shift.isFullDay) {
                form.elements['startTime'].value = shift.startTime;
                form.elements['endTime'].value = shift.endTime;
            }
            
            document.getElementById('timeGroup').style.display = shift.isFullDay ? 'none' : 'grid';
            
            const formTitle = document.querySelector('#editShiftDialog h2');
            if (formTitle) {
                formTitle.textContent = '編輯班別';
            }
            
            dialogService.openDialog(editShiftDialog);
        }
    };
    
    // 定義全局刪除班別函數
    window.deleteShift = (shiftName) => {
        if (confirm('確定要刪除這個班別嗎？')) {
            scheduleService.removeShift(shiftName);
            renderShiftList();
            renderWeeklySettings();
            calendarService.renderCalendar();
        }
    };
    
    // 添加新增班別按鈕事件
    const addShiftBtn = document.getElementById('addShiftBtn');
    if (addShiftBtn) {
        addShiftBtn.addEventListener('click', () => {
            const form = document.getElementById('editShiftForm');
            if (form) {
                form.reset();
                form.elements['originalName'].value = '';
                
                const formTitle = document.querySelector('#editShiftDialog h2');
                if (formTitle) {
                    formTitle.textContent = '新增班別';
                }
                
                document.getElementById('timeGroup').style.display = 'grid';
                dialogService.openDialog(editShiftDialog);
            }
        });
    }
    
    // 初始渲染
    renderShiftList();
    renderWeeklySettings();
    
    console.log('Shift manager setup complete');
}

// 更新統計資料
function updateStats() {
    const employeeCount = document.getElementById('employeeCount');
    const shiftCount = document.getElementById('shiftCount');
    const scheduleCount = document.getElementById('scheduleCount');
    
    if (employeeCount) {
        employeeCount.textContent = scheduleService.getEmployees().length;
    }
    
    if (shiftCount) {
        shiftCount.textContent = Object.keys(scheduleService.getShifts()).length;
    }
    
    if (scheduleCount) {
        scheduleCount.textContent = '0'; // TODO: 實現排班計數
    }
}

// 設置排班管理
function setupScheduleManager() {
    console.log('Setting up schedule manager...');
    // TODO: 實現排班管理功能
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

// 更新日曆
function updateCalendar() {
    const year = parseInt(document.getElementById('yearSelect').value);
    const month = parseInt(document.getElementById('monthSelect').value);
    const calendarBody = document.getElementById('calendarBody');
    
    if (!calendarBody) return;
    
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    let html = '';
    let currentRow = '';
    let currentDay = 1;
    
    // 填充日曆前面的空白
    for (let i = 0; i < startDay; i++) {
        currentRow += '<td class="calendar-cell empty"></td>';
    }
    
    // 填充日期
    while (currentDay <= totalDays) {
        if ((startDay + currentDay - 1) % 7 === 0) {
            html += '<tr>' + currentRow;
            currentRow = '';
        }
        
        const date = `${year}-${String(month).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
        const schedules = scheduleService.getDaySchedules(date);
        
        currentRow += `
            <td class="calendar-cell" data-date="${date}">
                <div class="calendar-date">${currentDay}</div>
                <div class="calendar-schedules">
                    ${schedules.map(schedule => {
                        const shift = scheduleService.getShiftByName(schedule.shiftName);
                        if (!shift) return '';
                        return `
                            <div class="schedule-item ${schedule.isDefault ? 'default' : ''}"
                                 style="background-color: ${shift.color}">
                                ${schedule.shiftName}
                            </div>
                        `;
                    }).join('')}
                </div>
                <button class="add-schedule-btn" onclick="openScheduleDialog('${date}')">+</button>
            </td>
        `;
        
        if ((startDay + currentDay) % 7 === 0) {
            html += currentRow + '</tr>';
            currentRow = '';
        }
        
        currentDay++;
    }
    
    // 填充日曆後面的空白
    const remainingCells = 7 - ((startDay + totalDays) % 7);
    if (remainingCells < 7) {
        for (let i = 0; i < remainingCells; i++) {
            currentRow += '<td class="calendar-cell empty"></td>';
        }
        html += currentRow + '</tr>';
    }
    
    calendarBody.innerHTML = html;
}

// 統計功能
function updateStats() {
    try {
        const totalEmployees = document.getElementById('totalEmployees');
        const totalShifts = document.getElementById('totalShifts');
        const totalSchedules = document.getElementById('totalSchedules');
        
        if (!totalEmployees || !totalShifts || !totalSchedules) {
            console.error('統計元素未找到');
            return;
        }
        
        const stats = {
            employees: scheduleService.getEmployees().length,
            shifts: Object.keys(scheduleService.getShifts()).length,
            schedules: Object.values(scheduleService.schedules || {}).reduce((total, daySchedules) => total + (daySchedules?.length || 0), 0)
        };
        
        totalEmployees.textContent = stats.employees;
        totalShifts.textContent = stats.shifts;
        totalSchedules.textContent = stats.schedules;
    } catch (error) {
        console.error('更新統計資料失敗:', error);
    }
}

// 全局函數定義
window.removeEmployee = function(employeeId) {
    if (confirm('確定要刪除該員工嗎？')) {
        scheduleService.removeEmployee(employeeId);
        renderEmployeeList();
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