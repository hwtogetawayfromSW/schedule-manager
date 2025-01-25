class CalendarService {
    constructor() {
        this.selectedYear = new Date().getFullYear();
        this.selectedMonth = new Date().getMonth() + 1;
        this.selectedDate = null;
    }

    updateCalendar(year, month) {
        this.selectedYear = year;
        this.selectedMonth = month;
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) {
            console.error('Calendar body element not found');
            return;
        }

        const firstDay = new Date(this.selectedYear, this.selectedMonth - 1, 1);
        const lastDay = new Date(this.selectedYear, this.selectedMonth, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        let html = '';
        let date = 1;
        
        // Create calendar rows
        for (let i = 0; i < 6; i++) {
            let row = '<tr>';
            
            // Create calendar cells
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDay) {
                    // Empty cells before first day
                    row += '<td></td>';
                } else if (date > daysInMonth) {
                    // Empty cells after last day
                    row += '<td></td>';
                } else {
                    // Regular day cells
                    const currentDate = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    row += `
                        <td class="calendar-cell" data-date="${currentDate}">
                            <div class="date-number">${date}</div>
                            <div class="schedule-container"></div>
                        </td>
                    `;
                    date++;
                }
            }
            
            row += '</tr>';
            html += row;
            
            if (date > daysInMonth) {
                break;
            }
        }

        calendarBody.innerHTML = html;
        this.setupCalendarCellEvents();
        
        // 更新所有單元格的排班信息
        const cells = document.querySelectorAll('.calendar-cell');
        cells.forEach(cell => {
            const date = cell.dataset.date;
            if (date) {
                this.updateCellSchedules(cell, date);
            }
        });
        
        console.log('Calendar rendered successfully');
    }

    setupCalendarCellEvents() {
        const cells = document.querySelectorAll('.calendar-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const date = cell.dataset.date;
                if (date) {
                    this.handleScheduleClick(cell, date);
                }
            });
        });
    }

    handleScheduleClick(cell, date) {
        // 打開排班對話框
        const scheduleDialog = document.getElementById('scheduleDialog');
        if (scheduleDialog) {
            const selectedDateSpan = document.getElementById('selectedDate');
            if (selectedDateSpan) {
                selectedDateSpan.textContent = date;
            }
            dialogService.openDialog(scheduleDialog);
        }
    }

    updateCellSchedules(cell, date) {
        const scheduleContainer = cell.querySelector('.schedule-container');
        if (!scheduleContainer) return;

        const schedules = scheduleService.getDaySchedules(date);
        const shifts = scheduleService.getShifts();

        scheduleContainer.innerHTML = schedules.map(schedule => {
            const shift = shifts[schedule.shiftName];
            if (!shift) return '';

            const style = `
                background-color: ${shift.color};
                color: white;
                opacity: ${schedule.isDefault ? '0.6' : '1'};
            `;

            return `
                <div class="schedule-item" style="${style}" title="${schedule.isDefault ? '預設班別' : ''}">
                    ${schedule.shiftName}
                    ${schedule.isDefault ? ' (預設)' : ''}
                </div>
            `;
        }).join('');
    }
}

// 創建並導出日曆服務實例
const calendarService = new CalendarService();
const scheduleService = require('./scheduleService');
const dialogService = require('./dialogService');
module.exports = calendarService;
