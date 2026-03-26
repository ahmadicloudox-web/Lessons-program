const SHEET_ID = "1Pyf5a1AuEqmKvWhpmVi1m-P6q6rCuWCwsjngDVWv0hk";

async function loadTable() {
    const fileName = window.location.pathname.split("/").pop().replace(".html", "");
    
    const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;
    const scheduleUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${fileName}`;

    try {
        const [confRes, schedRes] = await Promise.all([fetch(configUrl), fetch(scheduleUrl)]);
        const confData = JSON.parse((await confRes.text()).substring(47).slice(0, -2));
        const schedData = JSON.parse((await schedRes.text()).substring(47).slice(0, -2));

        // 1. تحديث بيانات المدرسة والشعار من تبويب Config
        // يقرأ من العمود C (Index 2) والصفوف تبدأ من Row 2 (Index 1)
        const rowsConfig = confData.table.rows;
        if (document.getElementById('school-name')) 
            document.getElementById('school-name').innerText = rowsConfig[1].c[2].v; 
        
        if (document.getElementById('sub-title-text')) 
            document.getElementById('sub-title-text').innerText = rowsConfig[2].c[2].v;
            
        if (document.getElementById('school-logo'))
            document.getElementById('school-logo').src = rowsConfig[3].c[2].v;

        // 2. بناء الجدول بشكل ديناميكي كامل
        const tbody = document.getElementById('schedule-body');
        const thead = document.querySelector('thead tr'); // لتحديث عناوين الحصص تلقائياً
        
        if(!tbody) return;
        tbody.innerHTML = ""; 

        // تحديث عناوين الحصص (Header) بناءً على الشيت
        if(thead && schedData.table.rows[0]) {
            let headerHtml = `<th>اليوم</th>`;
            for(let i = 1; i < schedData.table.rows[0].c.length; i++) {
                const label = schedData.table.rows[0].c[i] ? schedData.table.rows[0].c[i].v : `الحصة ${i}`;
                headerHtml += `<th>${label}</th>`;
            }
            thead.innerHTML = headerHtml;
        }

        // بناء صفوف الأيام (الأحد - الخميس)
        schedData.table.rows.forEach((row, index) => {
            if (index === 0) return; // تخطي صف العنوان
            if (!row.c || !row.c[0] || !row.c[0].v) return;

            let tr = `<tr><td class="day-column">${row.c[0].v}</td>`; 
            
            // التكرار يمر على كل الأعمدة المتاحة في الشيت (حصص غير محدودة)
            for (let i = 1; i < row.c.length; i++) {
                const cell = row.c[i];
                const cellVal = (cell && cell.v) ? cell.v : "-|#";
                
                let [name, link] = cellVal.split('|');
                if (!link) link = "#";

                if (name === "-" || name.includes("عطلة") || name === "لا يوجد") {
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
        console.error("Error loading data:", err); 
    }
}

function generateColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash % 360)}, 65%, 40%)`;
}

console.log("%c Designed by Eng Ahmad Hussein ", "color: white; background: #333; font-size: 20px; font-weight: bold; padding: 10px; border-radius: 5px;");
window.onload = loadTable;
