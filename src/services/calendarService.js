const scheduleService = require('./scheduleService');
const dialogService = require('./dialogService');

class CalendarService {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth() + 1;
    }

    renderCalendar() {
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) return;

        // 清空日曆
        calendarBody.innerHTML = '';
        
        const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        let date = 1;
        
        // 創建日曆網格
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                
                if (i === 0 && j < startingDay) {
                    // 填充上個月的空白日期
                    cell.textContent = '';
                } else if (date > totalDays) {
                    // 填充下個月的空白日期
                    cell.textContent = '';
                } else {
                    // 填充當前月份的日期
                    const dateDiv = document.createElement('div');
                    dateDiv.className = 'calendar-date';
                    dateDiv.textContent = date;
                    
                    const schedulesDiv = document.createElement('div');
                    schedulesDiv.className = 'calendar-schedules';
                    
                    cell.appendChild(dateDiv);
                    cell.appendChild(schedulesDiv);
                    
                    // 設置日期屬性
                    const currentDate = new Date(this.currentYear, this.currentMonth - 1, date);
                    cell.dataset.date = currentDate.toISOString().split('T')[0];
                    
                    // 添加點擊事件
                    cell.addEventListener('click', () => {
                        this.handleDateClick(cell);
                    });
                    
                    date++;
                }
                
                row.appendChild(cell);
            }
            
            calendarBody.appendChild(row);
            if (date > totalDays) break;
        }
        
        // 更新所有日期格的排班信息
        this.updateAllCellSchedules();
    }
    
    updateAllCellSchedules() {
        const cells = document.querySelectorAll('#calendarBody td[data-date]');
        cells.forEach(cell => {
            const date = cell.dataset.date;
            const schedules = scheduleService.getDaySchedules(date);
            this.updateCellSchedules(cell, schedules);
        });
    }
    
    updateCellSchedules(cell, schedules) {
        const schedulesDiv = cell.querySelector('.calendar-schedules');
        if (!schedulesDiv) return;
        
        schedulesDiv.innerHTML = '';
        
        schedules.forEach(schedule => {
            const scheduleDiv = document.createElement('div');
            scheduleDiv.className = 'schedule-item';
            
            // 獲取班別信息
            const shift = scheduleService.getShiftByName(schedule.shiftName);
            if (shift) {
                scheduleDiv.style.backgroundColor = shift.color;
                scheduleDiv.style.color = this.getContrastColor(shift.color);
                
                // 獲取員工信息
                const employee = scheduleService.getEmployeeById(schedule.employeeId);
                const employeeName = employee ? employee.name : '未知';
                
                // 顯示員工名稱和班別
                scheduleDiv.textContent = `${employeeName} - ${schedule.shiftName}`;
                
                // 添加點擊事件
                scheduleDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`是否要刪除 ${employeeName} 的 ${schedule.shiftName} 班別？`)) {
                        scheduleService.removeSchedule(cell.dataset.date, schedule.id);
                        this.updateAllCellSchedules();
                    }
                });
            }
            
            schedulesDiv.appendChild(scheduleDiv);
        });
        
        // 添加新增排班按鈕
        const addButton = document.createElement('button');
        addButton.className = 'add-schedule-btn';
        addButton.textContent = '+';
        addButton.title = '新增排班';
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openScheduleDialog(cell.dataset.date);
        });
        schedulesDiv.appendChild(addButton);
    }
    
    openScheduleDialog(date) {
        const scheduleDialog = document.getElementById('scheduleDialog');
        if (!scheduleDialog) return;
        
        // 設置當前選擇的日期
        scheduleDialog.dataset.date = date;
        
        // 更新對話框標題
        const titleElement = scheduleDialog.querySelector('h2');
        if (titleElement) {
            const dateObj = new Date(date);
            titleElement.textContent = `排班 - ${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        }
        
        // 渲染當前日期的排班列表
        this.renderScheduleList(date);
        
        // 打開對話框
        dialogService.openDialog(scheduleDialog);
    }
    
    renderScheduleList(date) {
        const scheduleList = document.getElementById('scheduleList');
        if (!scheduleList) return;
        
        const schedules = scheduleService.getDaySchedules(date);
        scheduleList.innerHTML = '';
        
        if (schedules.length === 0) {
            scheduleList.innerHTML = '<p>尚無排班資料</p>';
        } else {
            const table = document.createElement('table');
            table.className = 'data-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>員工</th>
                        <th>班別</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${schedules.map(schedule => {
                        const employee = scheduleService.getEmployeeById(schedule.employeeId);
                        const shift = scheduleService.getShiftByName(schedule.shiftName);
                        return `
                            <tr>
                                <td>${employee?.name || '未知'}</td>
                                <td>
                                    <span class="shift-color" style="background-color: ${shift?.color || '#ccc'}"></span>
                                    ${schedule.shiftName}
                                </td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="calendarService.removeSchedule('${date}', '${schedule.id}')">刪除</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            `;
            scheduleList.appendChild(table);
        }
        
        // 更新新增排班的員工和班別選項
        this.updateScheduleDialogOptions();
    }
    
    updateScheduleDialogOptions() {
        const employeeSelect = document.getElementById('scheduleEmployee');
        const shiftSelect = document.getElementById('scheduleShift');
        
        if (employeeSelect) {
            const employees = scheduleService.getEmployees();
            employeeSelect.innerHTML = `
                <option value="">請選擇員工</option>
                ${employees.map(employee => `
                    <option value="${employee.id}">${employee.name}</option>
                `).join('')}
            `;
        }
        
        if (shiftSelect) {
            const shifts = scheduleService.getShifts();
            shiftSelect.innerHTML = `
                <option value="">請選擇班別</option>
                ${Object.entries(shifts).map(([name, shift]) => `
                    <option value="${name}">${name}</option>
                `).join('')}
            `;
        }
    }
    
    removeSchedule(date, scheduleId) {
        scheduleService.removeSchedule(date, scheduleId);
        this.renderScheduleList(date);
        this.updateAllCellSchedules();
    }
    
    handleDateClick(cell) {
        const date = cell.dataset.date;
        if (!date) return;
        
        // 打開排班對話框
        const scheduleDialog = document.getElementById('scheduleDialog');
        if (scheduleDialog) {
            // 設置當前選擇的日期
            scheduleDialog.dataset.date = date;
            
            // 更新對話框標題
            const titleElement = scheduleDialog.querySelector('h2');
            if (titleElement) {
                const dateObj = new Date(date);
                titleElement.textContent = `排班 - ${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            }
            
            // 渲染當前日期的排班列表
            const scheduleList = document.getElementById('scheduleList');
            if (scheduleList) {
                const schedules = scheduleService.getDaySchedules(date);
                scheduleList.innerHTML = '';
                
                if (schedules.length === 0) {
                    scheduleList.innerHTML = '<p>尚無排班資料</p>';
                } else {
                    const table = document.createElement('table');
                    table.className = 'data-table';
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th>員工</th>
                                <th>班別</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${schedules.map(schedule => `
                                <tr>
                                    <td>${scheduleService.getEmployeeById(schedule.employeeId)?.name || '未知'}</td>
                                    <td>${schedule.shiftName}</td>
                                    <td>
                                        <button class="btn btn-danger btn-sm" onclick="removeSchedule('${date}', '${schedule.id}')">刪除</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    `;
                    scheduleList.appendChild(table);
                }
            }
            
            dialogService.openDialog(scheduleDialog);
        }
    }
    
    updateCalendar(year, month) {
        this.currentYear = year;
        this.currentMonth = month;
        this.renderCalendar();
    }
    
    getContrastColor(hexcolor) {
        // 移除 # 號（如果有的話）
        hexcolor = hexcolor.replace('#', '');
        
        // 將顏色轉換為 RGB
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        
        // 計算亮度
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // 根據亮度返回黑色或白色
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }
}

const calendarService = new CalendarService();
module.exports = calendarService;
