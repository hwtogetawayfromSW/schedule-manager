const store = require('../store');

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    
    const year = parseInt(document.getElementById('yearSelector').value);
    const month = parseInt(document.getElementById('monthSelector').value) - 1;
    calendar.innerHTML = '';

    // Calendar header
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'text-center font-semibold p-2 bg-gray-100';
        header.textContent = day;
        calendar.appendChild(header);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();

    // Empty cells
    for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell bg-gray-50';
        calendar.appendChild(emptyCell);
    }

    // Days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        renderCalendarDay(calendar, year, month, day);
    }
}

function renderCalendarDay(calendar, year, month, day) {
    // ... 保留原有的 renderCalendarDay 邏輯，但使用 store.scheduleData ...
}

module.exports = {
    renderCalendar
};