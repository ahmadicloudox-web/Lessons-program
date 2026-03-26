const SHEET_ID = "1Pyf5a1AuEqmKvWhpmVi1m-P6q6rCuWCwsjngDVWv0hk";

async function loadTable() {
    const fileName = window.location.pathname.split("/").pop().replace(".html", "");
    
    const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;
    const scheduleUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${fileName}`;

    try {
        const [confRes, schedRes] = await Promise.all([fetch(configUrl), fetch(scheduleUrl)]);
        const confData = JSON.parse((await confRes.text()).substring(47).slice(0, -2));
        const schedData = JSON.parse((await schedRes.text()).substring(47).slice(0, -2));

        // 1. تحديث بيانات المدرسة من تبويب Config
        const rowsConfig = confData.table.rows;
        // قراءة البيانات من العمود C (Index 2)
        if (document.getElementById('school-name')) 
            document.getElementById('school-name').innerText = rowsConfig[1].c[2].v; // الخلية C2
        
        if (document.getElementById('sub-title-text')) 
            document.getElementById('sub-title-text').innerText = rowsConfig[2].c[2].v; // الخلية C3
            
        if (document.getElementById('school-logo'))
            document.getElementById('school-logo').src = rowsConfig[3].c[2].v; // الخلية C4

        // 2. بناء الجدول
        const tbody = document.getElementById('schedule-body');
        if(!tbody) return;
        tbody.innerHTML = ""; 

        schedData.table.rows.forEach((row) => {
            // التحقق من وجود بيانات في أول خلية (اليوم) لضمان عدم قراءة صفوف فارغة
            if (!row.c || !row.c[0] || !row.c[0].v) return;

            let tr = `<tr><td class="day-column">${row.c[0].v}</td>`; 
            
            // قراءة كافة الأعمدة (الحصص) من العمود الثاني فصاعداً
            for (let i = 1; i < row.c.length; i++) {
                const cell = row.c[i];
                const cellVal = (cell && cell.v) ? cell.v : "-|#";
                
                let [name, link] = cellVal.split('|');
                if (!link) link = "#";

                // معالجة الخلايا الفارغة أو العطلات
                if (name === "-" || name.trim() === "" || name.includes("عطلة") || name === "لا يوجد") {
                    tr += `<td class="empty-cell">لا يوجد</td>`;
                } else {
                    const color = generateColor(name);
                    tr += `<td><a href="${link}" target="_blank" class="subject-card" style="background:${color}">${name}</a></td>`;
                }
            }
            tr += `</tr>`;
            tbody.innerHTML += tr;
        });

    } catch (err) { 
        console.error("خطأ في جلب البيانات:", err); 
    }
}

function generateColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash % 360)}, 65%, 40%)`;
}

console.log("%c Designed by Eng Ahmad Hussein ", "color: white; background: #333; font-size: 20px; font-weight: bold; padding: 10px; border-radius: 5px;");
window.onload = loadTable;
