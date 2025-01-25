const store = require('../store');
const html2canvas = require('html2canvas');

async function exportScheduleAsImage() {
    try {
        const calendar = document.getElementById('calendar');
        calendar.style.backgroundColor = 'white';
        calendar.style.padding = '20px';
        
        const canvas = await html2canvas(calendar, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
        });

        const link = document.createElement('a');
        const year = document.getElementById('yearSelector').value;
        const month = document.getElementById('monthSelector').value;
        link.download = `schedule_${year}_${month}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('匯出圖片失敗:', error);
        alert('匯出圖片失敗: ' + error.message);
    }
}

function exportICS() {
    try {
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//C20//Schedule//EN'
        ];

        store.scheduleData.forEach(day => {
            const date = `${day.year}${String(day.month).padStart(2, '0')}${String(day.day).padStart(2, '0')}`;
            
            day.shifts.forEach(shift => {
                const shiftInfo = store.shifts.find(s => s.name === shift.name);
                if (shiftInfo && shift.staff.length > 0) {
                    const [startTime, endTime] = shiftInfo.time.split('-');
                    
                    shift.staff.forEach(staffName => {
                        icsContent.push('BEGIN:VEVENT');
                        icsContent.push(`DTSTART;TZID=Asia/Taipei:${date}T${startTime.replace(':', '')}00`);
                        icsContent.push(`DTEND;TZID=Asia/Taipei:${date}T${endTime.replace(':', '')}00`);
                        icsContent.push(`SUMMARY:${shift.name} - ${staffName}`);
                        icsContent.push('END:VEVENT');
                    });
                }
            });
        });

        icsContent.push('END:VCALENDAR');
        
        const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'schedule.ics';
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('匯出 ICS 失敗:', error);
        alert('匯出 ICS 失敗: ' + error.message);
    }
}

module.exports = {
    exportScheduleAsImage,
    exportICS
};