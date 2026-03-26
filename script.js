const SHEET_ID = "1Pyf5a1AuEqmKvWhpmVi1m-P6q6rCuWCwsjngDVWv0hk";

async function loadTable() {
    // استخراج اسم الصف تلقائياً من اسم ملف الـ HTML (مثل c1)
    const fileName = window.location.pathname.split("/").pop().replace(".html", "");
    
    // روابط جلب البيانات بصيغة JSON
    const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;
    const scheduleUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${fileName}`;

    try {
        const [confRes, schedRes] = await Promise.all([fetch(configUrl), fetch(scheduleUrl)]);
        
        // معالجة بيانات الإعدادات (Config)
        const confText = await confRes.text();
        const confData = JSON.parse(confText.substring(47).slice(0, -2));
        
        // معالجة بيانات الجدول (Schedule)
        const schedText = await schedRes.text();
        const schedData = JSON.parse(schedText.substring(47).slice(0, -2));

        // 1. تحديث بيانات المدرسة (يقرأ من العمود C - index 2)
        const rowsConfig = confData.table.rows;
        // السطر الثاني C2: اسم المدرسة
        if (document.getElementById('school-name')) 
            document.getElementById('school-name').innerText = rowsConfig[1].c[2].v; 
        
        // السطر الثالث C3: العنوان أو الفرع
        if (document.getElementById('sub-title-text')) 
            document.getElementById('sub-title-text').innerText = rowsConfig[2].c[2].v;
            
        // السطر الرابع C4: رابط الشعار
        if (document.getElementById('school-logo'))
            document.getElementById('school-logo').src = rowsConfig[3].c[2].v;

        // 2. بناء الجدول بشكل ديناميكي
        const tbody = document.getElementById('schedule-body');
        if(!tbody) return;
        tbody.innerHTML = ""; 

        schedData.table.rows.forEach((row, index) => {
            // تخطي صف العناوين الأول أو الصفوف الفارغة تماماً
            if (index === 0 || !row.c || !row.c[0] || !row.c[0].v) return;

            let tr = `<tr><td class="day-column">${row.c[0].v}</td>`; 
            
            // التكرار على كافة الحصص (من العمود الثاني B فصاعداً)
            for (let i = 1; i < row.c.length; i++) {
                const cell = row.c[i];
                const cellVal = (cell && cell.v) ? cell.v : "-|#";
                
                let [name, link] = cellVal.split('|');
                if (!link) link = "#";

                // التحقق إذا كانت الحصة فارغة أو عطلة
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
        console.error("حدث خطأ أثناء تحميل البيانات:", err); 
        if (document.getElementById('schedule-body')) {
            document.getElementById('schedule-body').innerHTML = "<tr><td colspan='10'>يرجى التأكد من اتصال الإنترنت أو إعدادات الشيت</td></tr>";
        }
    }
}

// دالة توليد الألوان بناءً على اسم المادة لضمان التناسق
function generateColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash % 360)}, 65%, 40%)`;
}

// التوقيع في الكونسول
console.log("%c Designed by Eng Ahmad Hussein ", "color: white; background: #333; font-size: 20px; font-weight: bold; padding: 10px; border-radius: 5px;");

window.onload = loadTable;
