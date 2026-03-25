const SHEET_ID = "1Pyf5a1AuEqmKvWhpmVi1m-P6q6rCuWCwsjngDVWv0hk";

async function loadTable() {
    // استخراج اسم الصف من اسم الملف تلقائياً
    const fileName = window.location.pathname.split("/").pop().replace(".html", "");
    
    // روابط البيانات من جوجل شيت
    const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;
    const scheduleUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${fileName}`;

    try {
        const [confRes, schedRes] = await Promise.all([fetch(configUrl), fetch(scheduleUrl)]);
        const confData = JSON.parse((await confRes.text()).substring(47).slice(0, -2));
        const schedData = JSON.parse((await schedRes.text()).substring(47).slice(0, -2));

        // 1. تحديث بيانات المدرسة (من تبويب Config)
        document.getElementById('school-name').innerText = confData.table.rows[0].c[1].v;
        document.getElementById('school-logo').src = confData.table.rows[2].c[1].v;

        // 2. بناء الجدول (من تبويب الصف)
        const tbody = document.getElementById('schedule-body');
        schedData.table.rows.forEach(row => {
            if(!row.c[0]) return;
            let tr = `<tr><td class="day-column">${row.c[0].v}</td>`;
            
            for(let i=2; i<=6; i++) {
                const cellVal = row.c[i] ? row.c[i].v : "-|#";
                const [name, link] = cellVal.split('|');
                
                if(name === "-" || name === "عطلة") {
                    tr += `<td class="empty-cell">لا يوجد</td>`;
                } else {
                    const color = generateColor(name);
                    tr += `<td><a href="${link}" class="subject-card" style="background:${color}">${name}</a></td>`;
                }
            }
            tr += `</tr>`;
            tbody.innerHTML += tr;
        });
    } catch (err) { console.error("Error:", err); }
}

// دالة توليد الألوان الدائرية
function generateColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash % 360)}, 65%, 45%)`;
}
console.log("%c Designed by Eng Ahmad Hussein ", "color: white; background: #333; font-size: 20px; font-weight: bold;");
window.onload = loadTable;