const fs = require('fs');
const path = require('path');
const store = require('../store');
const { saveSettings } = require('./settings');

function renderStaffList() {
    const staffListElement = document.getElementById('staffList');
    if (!staffListElement) return;
    
    staffListElement.innerHTML = '';
    store.staffList.forEach(({ name, hours }) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-2 hover:bg-gray-50';
        li.innerHTML = `
            <span>${name}</span>
            <span class="text-gray-500">${hours.toFixed(1)}小時</span>
        `;
        staffListElement.appendChild(li);
    });
}

function saveStaffList() {
    const staffEditor = document.getElementById('staffEditor');
    const newStaffList = staffEditor.value.split('\n')
        .filter(name => name.trim())
        .map(name => ({ 
            name: name.trim(), 
            hours: store.staffList.find(s => s.name === name.trim())?.hours || 0 
        }));

    store.staffList = newStaffList;
    saveSettings();
    renderStaffList();
    alert('人員列表已更新！');
}

function updateStaffHours() {
    store.staffList.forEach(staff => {
        staff.hours = calculateStaffHours(staff.name);
    });
    renderStaffList();
    saveSettings();
}

function calculateStaffHours(staffName) {
    let totalHours = 0;
    store.scheduleData.forEach(day => {
        day.shifts.forEach(shift => {
            if (shift.staff.includes(staffName)) {
                const shiftInfo = store.shifts.find(s => s.name === shift.name);
                if (shiftInfo) {
                    const [start, end] = shiftInfo.time.split('-').map(t => {
                        const [hours, minutes] = t.split(':').map(Number);
                        return hours * 60 + minutes;
                    });
                    let duration = end - start;
                    if (duration < 0) duration += 24 * 60;
                    totalHours += duration / 60;
                }
            }
        });
    });
    return totalHours;
}

module.exports = {
    renderStaffList,
    saveStaffList,
    updateStaffHours
};