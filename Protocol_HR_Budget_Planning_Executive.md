---
Title: "Protocol – HR Budget Planning (Executive Edition)"
Version: "1.0"
LastUpdated: "2025-11-10"
Owner: "SA (System Analyst)"
Authors:
  - "Senior Tech Writer"
  - "Solution Architect"
Audience: "Executive / Non-Technical Managers"
Status: "Production – Ready for Presentation"
---

# โปรโตคอลระบบ HR Budget Planning (สำหรับผู้บริหาร)

ตารางเมทาดาต้า

| รายการ | ค่า |
|---|---|
| เวอร์ชัน | 1.0 |
| แก้ไขล่าสุด | 10 พฤศจิกายน 2568 |
| ผู้รับผิดชอบ | SA (System Analyst) |
| ผู้จัดทำ | Senior Tech Writer + Solution Architect |

## สารบัญ

- [วัตถุประสงค์ (Objective)](#วัตถุประสงค์-objective)
- [ภาพรวมระบบ (Executive Overview)](#ภาพรวมระบบ-executive-overview)
- [ขอบเขตและผู้มีส่วนเกี่ยวข้อง (Scope & Stakeholders)](#ขอบเขตและผู้มีส่วนเกี่ยวข้อง-scope--stakeholders)
- [กระบวนการ End-to-End (Process Protocol)](#กระบวนการ-end-to-end-process-protocol)
- [ขั้นตอนปฏิบัติ (Operations Runbook)](#ขั้นตอนปฏิบัติ-operations-runbook)
- [มาตรการควบคุมความเสี่ยง (Risk & Control Matrix)](#มาตรการควบคุมความเสี่ยง-risk--control-matrix)
- [KPI & SLA (Process Metrics)](#kpi--sla-process-metrics)
- [ไทม์ไลน์การใช้งาน/รอบงบ (Timeline)](#ไทม์ไลน์การใช้งานรอบงบ-timeline)
- [ภาคผนวก (Appendix)](#ภาคผนวก-appendix)

---

## วัตถุประสงค์ (Objective)

โปรโตคอลฉบับนี้ใช้สำหรับ “การนำเสนอและการปฏิบัติงาน” ของระบบงบประมาณบุคลากร (HR Budget) ให้ผู้บริหารและผู้ใช้งานที่ไม่ใช่สายเทคนิคเข้าใจภาพรวม การทำงาน จุดควบคุมความเสี่ยง และวิธีใช้งานหลักอย่างกระชับและปฏิบัติได้ทันที

สรุปประเด็นผู้บริหารในหน้าแรก

- ✅ ลดงานซ้ำด้วยโหมด Batch Entry และ Copy Row
- ✅ ตรวจสอบความถูกต้องแบบเรียลไทม์ (Critical/Warning/Valid)
- ✅ ฟอร์ม Dynamic รองรับบริษัท BJC/BIGC อัตโนมัติ
- ✅ กรองข้อมูลเป็นขั้น (Cascade) ลดความผิดพลาดด้วย Debounce 300ms
- ✅ สรุปผลผ่าน AG Grid พร้อมส่งออก Excel
- ✅ บันทึกแบบธุรกรรม (Batch Transaction) ป้องกันข้อมูลครึ่งเดียว

---

## ภาพรวมระบบ (Executive Overview)

แผนภาพโมดูลหลัก (ASCII)

```
UI (Razor) ──> Events (JS) ──> Dynamic Forms ──> Validation ──> Grid/Reports ──> API/DB
  |               |                |                 |               |            |
  |               |                |                 |               |            └─ SQL (ฟังก์ชันคำนวณ / ตารางบริษัท)
  |               |                |                 |               └─ AG Grid + Excel Export
  |               |                |                 └─ กฎตรวจสอบ + สัญญาณเตือน
  |               |                └─ ฟอร์มเฉพาะบริษัท (BJC/BIGC)
  |               └─ เหตุการณ์โต้ตอบ/Batch Entry
  └─ หน้า Budget Planning (Views/Home/BudgetPlanning.cshtml)
```

จุดเด่นที่ “ลดความเสี่ยงและลดงานซ้ำ”

- ลดงานซ้ำ: เพิ่มหลายแถวพร้อมกัน, คัดลอกแถว (Copy Row) โดยคงค่า Dropdown ตามต้นฉบับ
- ลดความผิดพลาด: กรองเลือกแบบเป็นขั้น (Company → COBU → Year → Cost Center …)
- ฟอร์ม Dynamic: เปลี่ยนฟิลด์อัตโนมัติตามบริษัท (BJC/BIGC)
- ตรวจแบบเรียลไทม์: แสดงสถานะ Critical/Warning/Valid ทันทีขณะกรอก
- สรุปภาพรวม: ตาราง AG Grid, ปุ่ม Export Excel, โหมดเต็มหน้าจอ

แหล่งอ้างอิงในโค้ด

- หน้า UI: `Views/Home/BudgetPlanning.cshtml`
- สถาปัตยกรรมระบบ: `wwwroot/lib/razor/js/budget-planning/budget-planning-system-architecture.md`
- เวิร์กโฟลว์เหตุการณ์: `budget-planning-event-workflow.md`
- สไตล์ธีมและ Validation UI: `wwwroot/css/site.css`
- โมดูล JS หลัก: `wwwroot/lib/razor/js/budget-planning/*`

---

## ขอบเขตและผู้มีส่วนเกี่ยวข้อง (Scope & Stakeholders)

ตาราง RASCI (แบบย่อ)

| บทบาท | หน้าที่ | R | A | S | C | I |
|---|---|---|---|---|---|---|
| HR Budget Owner | กำหนดรอบงบ/เกณฑ์ | ✅ | ✅ |  | ✅ | ✅ |
| BU/COBU | กรอก/ทบทวนงบ | ✅ |  |  | ✅ | ✅ |
| Finance | ตรวจสอบ/Consolidate |  | ✅ | ✅ | ✅ | ✅ |
| IT/Support | สนับสนุนระบบ/ข้อมูล |  |  | ✅ | ✅ | ✅ |
| ผู้บริหาร | รับทราบ/อนุมัติ |  | ✅ |  |  | ✅ |

ขอบเขตข้อมูล (ตัวอย่างที่มีในระบบ)

- มิติข้อมูล: Company, COBU/Format, Budget Year, Cost Center, Division, Department, Section, Company/Store, Position, Job Band, Salary Structure, Run Rate Group
- บริษัท: BJC, BIGC (ฟอร์มและจำนวนฟิลด์ต่างกัน)

---

## กระบวนการ End-to-End (Process Protocol)

Swimlane (ASCII)

```
HR Budget Owner | ── ตั้งรอบงบ ── แจ้งกำหนดการ ───────────────────────────────┐
BU/COBU         | ─────────── ตั้งค่า Filter ─ กรอก Batch Entry ─ Validate ─┤
Finance         | ─────── ติดตามคุณภาพ ─ Consolidate ─ รายงาน ─────────────┤
IT/Support      | ─ โหลดข้อมูลอ้างอิง ─ สนับสนุน ─ สำรอง/ตรวจ Log ───────┤
System          | ─ กรองแบบ Cascade ─ Dynamic Forms ─ Validation ─ Grid ──┘
```

SIPOC (ย่อ)

| Input | Process | Output | Control |
|---|---|---|---|
| Master/Filter, กฎบริษัท | Batch Entry + Validation | ข้อมูลงบที่ผ่านตรวจ | Debounce 300ms, Required, Duplicate Check |

Trigger & Control Points (สำคัญ)

- Filter Cascade + Debounce 300ms (ลด API-call ถี่ และลดการเลือกผิด)
- Dynamic Benefits by Company (BJC/BIGC) แสดงฟิลด์เฉพาะบริษัท
- Validation Center (Critical/Warning/Valid) พร้อมสรุปต่อแถวและภาพรวม
- Copy Row คัดลอกค่า Dropdown แบบอิงค่า value + รอการโหลดแบบ Retry สำหรับ 7 ฟิลด์: Division, Department, Section, Company/Store, Job Band, Salary Structure, Run Rate Group

อ้างอิงเวิร์กโฟลว์: `budget-planning-event-workflow.md`

---

## ขั้นตอนปฏิบัติ (Operations Runbook)

หมายเหตุ: แต่ละขั้นมี Speaker Notes และที่วางรูปหน้าจอไว้สำหรับประกอบการนำเสนอ

### 1) ตั้งค่าตัวกรอง (Company → COBU → Year → Cost Center …)

- เลือก Company/COBU/Year แล้วจึงเลือก Cost Center และมิติอื่นๆ ตามลำดับ
- ระบบใช้ Debounce 300ms ในการโหลดข้อมูลแบบต่อเนื่องเพื่อลดข้อผิดพลาด

![screenshot-placeholder](./images/step-01.png)

Speaker Notes:
- ย้ำลำดับการเลือกเพื่อให้ Dropdown ถัดไปถูกต้อง
- อธิบายว่าระบบซ่อน/แสดงตัวเลือกตามบริษัทและปี
- ปุ่ม Reset/ Search อยู่มุมขวาของกลุ่มตัวกรอง

### 2) เปิด Batch Entry / เพิ่มแถว

- คลิก “Add Row (Batch Entry)” เพื่อเปิดโหมดกรอกแบบหลายแถวพร้อมกัน
- ปุ่ม “เพิ่มแถว” จะเพิ่มแถวใหม่ใน Accordion พร้อมตัวนับจำนวนแถว

![screenshot-placeholder](./images/step-02.png)

Speaker Notes:
- อธิบายข้อดีของ Batch Entry: ลดงานซ้ำและลดเวลารวม
- ปุ่ม Select All/Expand/Collapse ใช้จัดการหลายแถวพร้อมกัน
- ปุ่ม “ลบแถวที่เลือก” จะพร้อมใช้เมื่อมีการเลือกแถว

### 3) เลือกบริษัทและโหลดฟอร์ม Dynamic (BJC/BIGC)

- เมื่อเลือก Company ในแถว ระบบจะโหลดฟอร์มที่ต่างกัน (BJC/BIGC)
- ฟิลด์บางส่วน เช่น Bonus/Benefits และ Salary Structure จะแตกต่างตามบริษัท

![screenshot-placeholder](./images/step-03.png)

Speaker Notes:
- ฟอร์ม Dynamic ช่วยลดข้อผิดพลาดจากฟิลด์ที่ไม่เกี่ยวข้อง
- ป้ายกำกับ (Label) จะอัปเดตตามบริษัท เช่น COBU/Format
- กรณี BIGC บางฟีเจอร์เช่น Allocation Batch จะปรากฏเฉพาะช่วงเงื่อนไขที่กำหนด

### 4) กรอก Benefits/Payroll ตามเทมเพลตบริษัท

- ฟิลด์ Benefits ทั้งฝั่ง LE (ปีก่อน) และ Budget Year ถูกจัดตามบริษัท
- ระบบรองรับการคำนวณ (CAL) และสรุปคอลัมน์สำคัญในหน้าฟอร์ม

![screenshot-placeholder](./images/step-04.png)

Speaker Notes:
- ปุ่ม CAL เรียกคำนวณจาก API (SQL Function) และเติมค่าให้อัตโนมัติ
- สรุปค่าเดือน/ปี (เช่น pe_sb_year) คำนวณบนหน้าให้เห็นทันที
- เน้นว่าจำนวนฟิลด์ BJC มากกว่า BIGC (ซับซ้อนกว่าเล็กน้อย)

### 5) ตรวจ Validation แบบเรียลไทม์ (Critical/Warning/Valid)

- ระบบแสดงกรอบสี/ข้อความเมื่อฟิลด์ไม่ครบ/ผิดเงื่อนไขหรือผ่าน
- แสดงสรุปผลระดับแถว และสรุปรวมเมื่อกด Validate All

![screenshot-placeholder](./images/step-05.png)

Speaker Notes:
- อธิบาย 3 ระดับ: ⛔ Critical, ⚠️ Warning, ✅ Valid
- ระบบแนะนำให้แก้ไขสำหรับ Critical ก่อนบันทึก
- สีและสไตล์มาจาก `site.css` รองรับ Light/Dark Theme

### 6) บันทึกลง Grid + ตรวจคอลัมน์สำคัญ (รวม GL Header ถ้ามี)

- เมื่อข้อมูลครบ สามารถ Save ทั้งหมด (Batch Transaction)
- ตาราง AG Grid แสดงผลและให้ส่งออก Excel ได้

![screenshot-placeholder](./images/step-06.png)

Speaker Notes:
- การบันทึกแบบ Batch ถ้ามีสักหนึ่งแถวผิด ระบบจะ Rollback ทั้งชุด
- ตรวจคอลัมน์สรุปและรหัส GL (ถ้ามีการกำหนด) ก่อน Export
- ใช้โหมด Fullscreen เพื่อดูตารางสะดวกขึ้น

### 7) สรุปผล/ส่งออก/รายงาน

- ใช้ปุ่ม Export Excel บนตาราง หรือดู Master/Detail (Cost Center → Employee)
- จัดทำรายงานสรุปให้ผู้บริหารทบทวนและอนุมัติ

![screenshot-placeholder](./images/step-07.png)

Speaker Notes:
- Master Grid (Cost Centers) + Detail Grid (Employees) ใช้ Drill-down
- สถานะและตัวเลขสำคัญควรถูกต้องก่อน “Cut-off/Freeze”
- แนะนำให้ Export เก็บเป็นหลักฐานก่อนส่งอนุมัติ

---

## มาตรการควบคุมความเสี่ยง (Risk & Control Matrix)

| ความเสี่ยง | สาเหตุ | การควบคุมในระบบ | หลักฐาน/รายการตรวจ | เจ้าของ |
|---|---|---|---|---|
| เลือกบริษัทผิด | ใช้รายการรวม/ไม่เข้าใจความต่าง | ฟอร์ม Dynamic ตามบริษัท + ป้ายกำกับเปลี่ยนอัตโนมัติ | Screenshot แถว + Company ID | HR Budget Owner |
| ฟิลด์ไม่ครบ | ข้ามฟิลด์สำคัญ | Real-time Validation (Critical/Warning/Valid) | รายงาน Validate All + แถวที่ Error | BU/COBU |
| ค่าศูนย์/ติดลบ | กรอกผิด/สูตรผิด | กฎค่าว่าง/ช่วงตัวเลข + CAL จากฟังก์ชันฐานข้อมูล | Log การคำนวณ + ค่าเข้า/ออก | Finance |
| กรอกซ้ำ | คัดลอกข้อมูลซ้ำโดยไม่ตั้งใจ | Duplicate Check ก่อน Save (Batch Transaction) | รายการ Failed Rows (ถ้ามี) | HR Budget Owner |
| คลิกถี่ | โหลด Dropdown ยังไม่เสร็จ | Debounce 300ms และรอ Cascade | เวลาโหลด/Spinner | IT/Support |
| สิทธิ์แก้ไข | ใช้บัญชีไม่เหมาะสม | Login + Session; แยกหน้าที่ผู้ใช้ | Log การล็อกอิน/แก้ไข | IT/Support |
| Audit/Log | ไม่มีร่องรอยตรวจสอบ | ตาราง Log การเข้าสู่ระบบ/การบันทึก | Log ตาราง HRB_LOGIN_LOG | IT/Support |

---

## KPI & SLA (Process Metrics)

| KPI | สูตร/แหล่งข้อมูล | ค่าเป้าหมาย | ความถี่รายงาน |
|---|---|---|---|
| % ผ่านตรวจครั้งแรก | Valid Rows / Total Rows | ≥ 85% | รายสัปดาห์ |
| เวลาเฉลี่ยต่อแถว | เวลาเริ่มกรอกถึง Valid | ≤ 3 นาที/แถว | รายสัปดาห์ |
| เวลา Cycle Close | วันเริ่มรอบถึง Freeze | ≤ ตามแผนรอบ | รายรอบ |
| ข้อผิดพลาด/100 แถว | จำนวน Error ÷ แถว × 100 | ≤ 5 | รายสัปดาห์ |
| เวลา Export รายงาน | คลิก Export ถึงไฟล์พร้อม | ≤ 30 วินาที | รายสัปดาห์ |

หมายเหตุ: ข้อมูลดึงจากสรุป Validate, Log ปฏิบัติการ และเวลา Export จากหน้าจอ

---

## ไทม์ไลน์การใช้งาน/รอบงบ (Timeline)

แผนภาพ (ASCII)

```
สัปดาห์ 1   | เตรียมข้อมูล/กฎบริษัท
สัปดาห์ 2-3 | กรอก Batch Entry + CAL + Validate
สัปดาห์ 4   | Consolidate + Review
สัปดาห์ 5   | Approve → Freeze
```

- Cut-off/Freeze: เมื่อผู้บริหารอนุมัติ ให้ล็อกชุดข้อมูลของรอบนั้น
- Escalation Path: BU/COBU → HR Budget Owner → Finance → ผู้บริหาร (ตามระดับความเสี่ยง/ผลกระทบ)

---

## ภาคผนวก (Appendix)

คำเตือน/ข้อความระบบ (สำคัญ – ภาษาไทย)

- “กรุณาเลือก Company/COBU/Year ให้ครบถ้วนก่อนดำเนินการ”
- “ฟิลด์สำคัญไม่ครบถ้วน (Critical) กรุณาตรวจสอบอีกครั้ง”
- “พบรายการซ้ำ ข้อมูลไม่ได้ถูกบันทึก (Batch Rollback)”
- “กำลังโหลดข้อมูล โปรดรอ…”

Mapping คอลัมน์/GL (แบบย่อสำหรับผู้บริหาร)

- สรุปสวัสดิการ/ค่าใช้จ่ายหลัก (Salary, OT, Allowances, Provident, Social Security, Medical, Training)
- รหัส GL เฉพาะบริษัทอาจต่างกัน (อ้างอิงจากการตั้งค่าของ Grid/Template)

ลิงก์/ไฟล์อ้างอิงภายในโปรเจกต์

- View: `Views/Home/BudgetPlanning.cshtml`
- สถาปัตยกรรม: `wwwroot/lib/razor/js/budget-planning/budget-planning-system-architecture.md`
- เวิร์กโฟลว์เหตุการณ์: `budget-planning-event-workflow.md`
- สไตล์ธีม/Validation UI: `wwwroot/css/site.css`
- โมดูล JS (ตัวอย่าง): `budget.plan.events.js`, `budget.plan.dynamic.forms.js`, `budget.plan.form.validation.js`, `budget.plan.grid.js`, `budget.plan.api.js`, `budget.plan.filters.js`

---

หมายเหตุเพิ่มเติมสำหรับการนำเสนอ

- ใช้ภาพหน้าจอจริงขององค์กรแทน placeholder เมื่อสรุปตัวเลขพร้อมรีวิว
- สำหรับ BIGC มี “Allocation Batch Entry” เฉพาะเงื่อนไขที่กำหนด (ดูปุ่ม “Add Row (Allocation)”) ในหน้าเดียวกัน
- เอกสารนี้อ่านจบได้ภายใน 10–15 นาที และพร้อมสำหรับบอร์ดผู้บริหาร
