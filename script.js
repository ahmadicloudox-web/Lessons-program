const SHEET_ID = "1Pyf5a1AuEqmKvWhpmVi1m-P6q6rCuWCwsjngDVWv0hk";

async function loadTable() {
    const fileName = window.location.pathname.split("/").pop().replace(".html", "");
    
    const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;
    const scheduleUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${fileName}`;

    try {
        const [confRes, schedRes] = await Promise.all([fetch(configUrl), fetch(scheduleUrl)]);
        
        const confText = await confRes.text();
        const confData = JSON.parse(confText.substring(47).slice(0, -2));
        
        const schedText = await schedRes.text();
        const schedData = JSON.parse(schedText.substring(47).slice(0, -2));

        // 1. تحديث إعدادات المدرسة (Config)
        const rowsConfig = confData.table.rows;
        if (document.getElementById('school-name')) {
            const schoolNameCell = rowsConfig[1] && rowsConfig[1].c[2];
            document.getElementById('school-name').innerText = schoolNameCell ? schoolNameCell.v : "بوابة الجداول الدراسية"; 
        }
        if (document.getElementById('school-logo')) {
            const logoCell = rowsConfig[3] && rowsConfig[3].c[2];
            document.getElementById('school-logo').src = logoCell ? logoCell.v : ""; 
        }

        // 2. بناء الهيدر (العناوين) ديناميكياً من الصف الأول في الشيت
        const thead = document.querySelector('thead');
        if (thead && schedData.table.rows.length > 0) {
            const headerCells = schedData.table.rows[0].c;
            // نبني الهيدر بترتيب عكسي (من اليمين لليسار كما في الشيت)
            let headerHtml = `<tr class="header-row">`;
            for (let i = headerCells.length - 1; i >= 0; i--) {
                const val = (headerCells[i] && headerCells[i].v) ? headerCells[i].v : `حصة ${headerCells.length - i - 1}`;
                headerHtml += `<th>${val}</th>`;
            }
            headerHtml += `</tr>`;
            thead.innerHTML = headerHtml;
        }

        // 3. بناء جسم الجدول (Rows)
        const tbody = document.getElementById('schedule-body');
        if(!tbody) return;
        tbody.innerHTML = ""; 

        schedData.table.rows.forEach((row, index) => {
            // تخطي الصف الأول لأنه أصبح "هيدر" الآن
            if (index === 0 || !row.c) return;

            const cells = row.c;
            // اليوم موجود في آخر خلية بجهة اليمين (العمود A برمجياً عند العكس)
            const dayName = cells[cells.length - 1] ? cells[cells.length - 1].v : "";
            if (!dayName) return;

            let tr = `<tr><td class="day-column">${dayName}</td>`; 
            
            // قراءة الحصص بترتيب عكسي من اليمين لليسار
            for (let i = cells.length - 2; i >= 0; i--) {
                const cell = cells[i];
                const cellVal = (cell && cell.v) ? cell.v : "-|#";
                
                let [name, link] = cellVal.split('|');
                if (!link) link = "#";

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
        console.error("حدث خطأ:", err);
    }
}

function generateColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash % 360)}, 65%, 40%)`;
}

window.onload = loadTable;
