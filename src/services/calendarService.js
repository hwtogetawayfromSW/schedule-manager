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
        // 這個方法將在 renderer.js 中實現
        console.log('Handle schedule click:', date);
    }

    updateCellSchedules(cell, date) {
        // 這個方法將在 renderer.js 中實現
        console.log('Update cell schedules:', date);
    }
}

// 創建並導出日曆服務實例
const calendarService = new CalendarService();
module.exports = calendarService;
