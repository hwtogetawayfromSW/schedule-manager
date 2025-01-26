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
                    
                    // 確保使用正確的當前日期
                    const currentDate = new Date(this.currentYear, this.currentMonth, date);
                    const dateStr = currentDate.toISOString().split('T')[0];
                    cell.dataset.date = dateStr;
                    
                    // 獲取當天的預設班別
                    const dayOfWeek = currentDate.getDay();
                    const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const defaultShifts = scheduleService.getWeeklyDefaults()[weekDays[dayOfWeek]] || [];
                    
                    // 獲取當天的實際排班
                    const schedules = scheduleService.getDaySchedules(dateStr);
                    
                    // 如果沒有實際排班，顯示預設班別
                    if (schedules.length === 0) {
                        defaultShifts.forEach(shiftName => {
                            const shift = scheduleService.getShiftByName(shiftName);
                            if (shift) {
                                const shiftDiv = document.createElement('div');
                                shiftDiv.className = 'schedule-item default-shift';
                                shiftDiv.style.backgroundColor = shift.color;
                                shiftDiv.style.color = this.getContrastColor(shift.color);
                                shiftDiv.textContent = shiftName;
                                schedulesDiv.appendChild(shiftDiv);
                            }
                        });
                    }
                    
                    // 顯示實際排班
                    schedules.forEach(schedule => {
                        const shift = scheduleService.getShiftByName(schedule.shiftName);
                        if (shift) {
                            const shiftDiv = document.createElement('div');
                            shiftDiv.className = 'schedule-item';
                            shiftDiv.style.backgroundColor = shift.color;
                            shiftDiv.style.color = this.getContrastColor(shift.color);
                            
                            const employee = scheduleService.getEmployeeById(schedule.employeeId);
                            shiftDiv.textContent = `${employee ? employee.name : '未知'} - ${schedule.shiftName}`;
                            
                            schedulesDiv.appendChild(shiftDiv);
                        }
                    });
                    
                    cell.appendChild(dateDiv);
                    cell.appendChild(schedulesDiv);
                    
                    // 添加點擊事件
                    cell.addEventListener('click', () => {
                        this.handleDateClick(dateStr);
                    });
                    
                    date++;
                }
                
                row.appendChild(cell);
            }
            
            calendarBody.appendChild(row);
            if (date > totalDays) break;
        }
    }
    
    handleDateClick(dateStr) {
        const dialog = document.getElementById('scheduleDialog');
        if (!dialog) return;
        
        // 更新對話框標題
        const title = dialog.querySelector('h2');
        if (title) {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            title.textContent = `排班 - ${year}/${month}/${day}`;
        }
        
        // 設置新增排班的日期
        const dateInput = dialog.querySelector('input[name="date"]');
        if (dateInput) {
            dateInput.value = dateStr;
        }
        
        // 更新排班列表
        this.updateScheduleList(dateStr);
        
        // 打開對話框
        dialogService.openDialog(dialog);
    }
    
    updateScheduleList(dateStr) {
        const scheduleList = document.getElementById('scheduleList');
        if (!scheduleList) return;
        
        const schedules = scheduleService.getDaySchedules(dateStr);
        
        if (schedules.length === 0) {
            scheduleList.innerHTML = '<p>尚無排班資料</p>';
            return;
        }
        
        scheduleList.innerHTML = schedules.map(schedule => {
            const employee = scheduleService.getEmployeeById(schedule.employeeId);
            const shift = scheduleService.getShiftByName(schedule.shiftName);
            return `
                <div class="schedule-item" style="background-color: ${shift ? shift.color : '#ccc'}">
                    <span>${employee ? employee.name : '未知'} - ${schedule.shiftName}</span>
                    <button onclick="window.deleteSchedule('${dateStr}', '${schedule.id}')" class="btn btn-small btn-danger">刪除</button>
                </div>
            `;
        }).join('');
    }
    
    getContrastColor(hexcolor) {
        // 移除 # 符號（如果有的話）
        hexcolor = hexcolor.replace('#', '');
        
        // 將顏色轉換為 RGB
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        
        // 計算亮度
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // 根據亮度返回黑色或白色
        return brightness > 128 ? '#000000' : '#ffffff';
    }
}

const calendarService = new CalendarService();
module.exports = calendarService;
