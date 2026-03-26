const SHEET_ID = "1Pyf5a1AuEqmKvWhpmVi1m-P6q6rCuWCwsjngDVWv0hk";

async function loadTable() {
    // استخراج اسم الصف من رابط الصفحة (مثلاً c1)
    const fileName = window.location.pathname.split("/").pop().replace(".html", "");
    
    const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;
    const scheduleUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${fileName}`;

    try {
        const [confRes, schedRes] = await Promise.all([fetch(configUrl), fetch(scheduleUrl)]);
        const confData = JSON.parse((await confRes.text()).substring(47).slice(0, -2));
        const schedData = JSON.parse((await schedRes.text()).substring(47).slice(0, -2));

        // 1. تحديث بيانات المدرسة من تبويب Config
        if(document.getElementById('school-name')) 
            document.getElementById('school-name').innerText = confData.table.rows[0].c[1].v;
        if(document.getElementById('school-logo'))
            document.getElementById('school-logo').src = confData.table.rows[2].c[1].v;

        // 2. بناء الجدول
        const tbody = document.getElementById('schedule-body');
        if(!tbody) return;
        
        tbody.innerHTML = ""; // تنظيف الجدول قبل الملء

        schedData.table.rows.forEach(row => {
            // التحقق من وجود اسم اليوم في العمود الأول (A)
            if (!row.c || !row.c[0] || !row.c[0].v) return;

            let tr = `<tr><td class="day-column">${row.c[0].v}</td>`;
            
            // قراءة الحصص من العمود الثاني (B) وحتى العمود الثامن (H) مثلاً
            // قمت بتعديل i ليبدأ من 1 (العمود الثاني) ويستمر حتى نهاية الأعمدة المتاحة
            for (let i = 1; i < row.c.length; i++) {
                const cell = row.c[i];
                const cellVal = (cell && cell.v) ? cell.v : "-|#";
                
                // تقسيم النص إلى (اسم المادة | الرابط)
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
        console.error("حدث خطأ أثناء جلب البيانات:", err); 
    }
}

// دالة توليد ألوان متناسقة بناءً على اسم المادة
function generateColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // HSL تعطي ألواناً مريحة للعين (Hue, Saturation, Lightness)
    return `hsl(${Math.abs(hash % 360)}, 70%, 40%)`;
}

console.log("%c Designed by Eng Ahmad Hussein ", "color: white; background: #333; font-size: 20px; font-weight: bold; padding: 10px; border-radius: 5px;");
window.onload = loadTable;
