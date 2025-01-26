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

        calendarBody.innerHTML = '';
        
        const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        let date = 1;
        
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                cell.className = 'calendar-cell';
                
                if (i === 0 && j < startingDay) {
                    cell.classList.add('empty');
                } else if (date > totalDays) {
                    cell.classList.add('empty');
                } else {
                    // Format the date string properly
                    const currentDate = new Date(this.currentYear, this.currentMonth - 1, date);
                    const dateStr = this.formatDate(currentDate);
                    cell.dataset.date = dateStr;
                    
                    const dateDiv = document.createElement('div');
                    dateDiv.className = 'calendar-date';
                    dateDiv.textContent = date;
                    
                    const schedulesDiv = document.createElement('div');
                    schedulesDiv.className = 'calendar-schedules';
                    
                    // Get schedules for the current date
                    const schedules = scheduleService.getDaySchedules(dateStr);
                    
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
                    
                    // Add click event
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
        
        // Parse the date string to ensure correct format
        const date = new Date(dateStr);
        const formattedDate = this.formatDate(date);
        
        // Update dialog title with correct date
        const title = dialog.querySelector('h2');
        if (title) {
            title.textContent = `排班 - ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        }
        
        // Set the date input with correct format
        const dateInput = dialog.querySelector('input[name="date"]');
        if (dateInput) {
            dateInput.value = formattedDate;
        }
        
        // Update schedule list with correct date
        this.updateScheduleList(formattedDate);
        
        dialogService.openDialog(dialog);
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
