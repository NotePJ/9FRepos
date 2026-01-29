# 📋 Claude Sonnet 4.5 Prompt — HCBP Refactor & Security Hardening (VS Code)

คุณคือ Senior Full-Stack Engineer (ASP.NET Core MVC .NET 8 + jQuery/AG Grid) ทำงานบน **VS Code** ในโปรเจกต์ **HR Budget Planning**. โปรดลงมือ **รีแฟคเตอร์และแพตช์โค้ด** ให้ maintainable, scalable และปลอดภัยขึ้น ตามรีวิวก่อนหน้า โดยส่งมอบเป็น **git commits แยกประเด็น** และแนบ **diff ที่แก้จริง** ในคำตอบสุดท้ายของแต่ละขั้นตอน

---

## Context
- Tech: ASP.NET Core MVC (.NET 8), jQuery, AG Grid, Bootstrap 5.3
- โค้ดไฟล์หลัก (โฟลเดอร์เดียวกับหน้า Budget Planning):
  - `budget.plan.main.js`
  - `budget.plan.events.js`
  - `budget.plan.form.validation.js`
  - `budget.plan.benefits.templates.js`
  - `budget.plan.config.js`
  - `budget.plan.api.js`
  - `budget.plan.grid.js`, `budget.plan.dynamic.forms.js`, `budget.plan.offcanvas*.js`, `budget.plan.allocation.js`, `budget.plan.core.js`, `budget.plan.options.js`, `budget.plan.filters.js`, `budget.plan.fullscreen.js`
  - `site.css`
- เป้าหมาย: ลด global pollution, แก้ logic bugs, เสริม security (OWASP), ทำให้ jQuery-first และจัดระเบียบ event/queue ให้ deterministic

---

## สิ่งที่ต้องทำ (Goals)

### 1) Global Namespace Consolidation
- สร้าง single global namespace ชื่อ `window.HCBP = { config, api, ui, batch, validate, util }`
- ย้าย/ห่อทุกการ export เดิมที่พุ่งขึ้น `window.*` ให้มาอยู่ใต้ `HCBP.*`
- ห้ามเหลือ `window.*` กระจัดกระจาย ยกเว้น `window.HCBP` เพียงตัวเดียว

### 2) Sanitized UI Alerts / XSS Hardening (OWASP A03)
- สร้างยูทิล `HCBP.util.safeHtml(textOrHtml, {allowHtml})`:
  - `allowHtml=false` → เซ็ตข้อความด้วย `.text()` เสมอ
  - `allowHtml=true` → ใช้ **DOMPurify** ถ้ามี; ถ้าไม่มีให้ fallback เป็น `.text()` (ห้าม `.html()` ตรงๆ)
- เปลี่ยนทุกจุดที่ใช้ `.html(...)` กับข้อความจากระบบ/ผู้ใช้/เซิร์ฟเวอร์ ให้ผ่าน `safeHtml`

### 3) CSRF Protection in FE Calls (OWASP A07/A05)
- อัปเดต `submitToAPI(...)` ใน `budget.plan.api.js`:
  - แนบ anti-forgery token (ค้นหาใน DOM: `input[name="__RequestVerificationToken"]` หรือ cookie `XSRF-TOKEN`)
  - ใส่ header `RequestVerificationToken: <token>`
- เพิ่ม fallback และ log warning เฉพาะโหมด dev เมื่อหา token ไม่เจอ

### 4) Real-time Validation Fix (ค่า 0 ต้องผ่าน)
- ใน `budget.plan.form.validation.js` ปรับตรรกะ `hasValue`:
  - เดิม: ถือว่า `'0'` = ว่าง → **แก้** เป็น **นับ 0 ว่า “มีค่า”**
  - แยกกฎ numeric/decimal ให้ตรวจรูปแบบและช่วงแทน
- รวมการตั้งสถานะ field (`valid / invalid / warning`) ให้ผ่านฟังก์ชันกลาง เช่น `HCBP.util.setFieldState(el, state, message?)` ที่ใช้คลาส `.is-valid/.is-invalid/.is-warning` (สอดคล้อง `site.css`)

### 5) Benefits Generator Queue: Keyed & Deterministic
- รีแฟคเตอร์ `generateBatchTemplatesForCompany(companyId, batchRowIndex, callback)` ใน `budget.plan.benefits.templates.js`:
  - เปลี่ยนจาก `Set<object>` เป็น **คิวแบบ Map keyed by `${companyId}:${rowId}`**
  - รวมงานซ้ำ (coalescing) ตาม key
  - ใช้ **Promise/Microtask + MutationObserver** เพื่อรอ DOM readiness (เลิก magic delay เช่น `setTimeout(250)`)
  - provide event custom: dispatch `benefits:ready` เมื่อพร้อม
- ปรับจุดที่ copy row ให้ **await** readiness (หรือ listen `benefits:ready`) ก่อน apply ค่า

### 6) Event Namespacing & Delegation (jQuery-first)
- ใช้ชื่อเนมสเปซอีเวนต์สม่ำเสมอ เช่น `.on('input.hcbp', ...)`
- สำหรับฟิลด์ที่ regen บ่อย (benefits), ใช้ event delegation:  
  `$(container).on('input.hcbp', '[data-benefit-field]', handler)`

### 7) Logging Policy
- สร้าง flag `HCBP.config.debug=false` (build-time/ENV)
- ห่อ `console.*` ผ่าน `HCBP.util.debug(...)` และ no-op เมื่อ `debug=false`
- ลบ/ย้าย `console.log` กระจัดกระจายมาใช้ยูทิล

### 8) CSP Note / External Fonts
- เพิ่มคอมเมนต์ใน `site.css` เรื่องแนะนำ CSP/self-host fonts (ไม่ต้องแก้ infra แต่ให้ทิ้ง TODO)

### 9) โครงสร้างไฟล์เล็กน้อย (ถ้าจำเป็น)
- เพิ่มไฟล์ `hcbp.namespace.js` (โหลดก่อนทุกไฟล์ budget.*) สำหรับประกาศ `window.HCBP` + ยูทิลพื้นฐาน
- ไม่เปลี่ยน public API ของหน้า (ปุ่ม/behavior ต้องทำงานเหมือนเดิมยกเว้นส่วนที่เป็นบั๊ก/ช่องโหว่)

---

## ขั้นตอนการทำงานบน VS Code (ให้แสดงในคำตอบด้วย)
- เปิดโฟลเดอร์โปรเจกต์ → เปิด Terminal
- รัน:
```bash
git checkout -b chore/hcbp-refactor-namespace-security
```
- ติดตั้ง DOMPurify แบบ local (หากเป็นโครงการ static asset):
  - ถ้าใช้ npm: `npm i dompurify` แล้วอิมพอร์ตใน layout/บันเดิล
  - หรือเพิ่ม `<script src=".../dompurify.min.js"></script>` ใน `BudgetManagement.cshtml` (เฉพาะ dev; โปรดคอมเมนต์ชัดเจน)
- สร้างไฟล์ใหม่ `wwwroot/js/hcbp.namespace.js` และอ้างใน `BudgetManagement.cshtml` ให้โหลดก่อน `budget.plan.*`

---

## รายละเอียดเชิงเทคนิคที่ต้องแก้ (ให้แนบ diff จริง)

### A) สร้าง namespace + ยูทิล
ไฟล์: `wwwroot/js/hcbp.namespace.js`
```js
// @hcbp core namespace (loaded first)
window.HCBP = window.HCBP || { config:{}, api:{}, ui:{}, batch:{}, validate:{}, util:{} };

(function(ns){
  ns.config.debug = false; // set true in dev if needed

  ns.util.debug = (...args) => { if (ns.config.debug && console) console.log(...args); };

  ns.util.safeHtml = function(elOrSelector, textOrHtml, { allowHtml=false } = {}){
    const $el = (window.jQuery ? jQuery(elOrSelector) : null);
    if (!$el) return;
    if (!allowHtml) { $el.text(textOrHtml ?? ""); return; }
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      $el.html(window.DOMPurify.sanitize(String(textOrHtml ?? "")));
    } else {
      // fallback: never trust raw HTML
      $el.text(textOrHtml ?? "");
    }
  };

  ns.util.setFieldState = function($el, state, message){
    $el.removeClass('is-valid is-invalid is-warning');
    if (state) $el.addClass(state);
    if (message) {
      const $msg = $el.siblings('.field-message');
      if ($msg.length) ns.util.safeHtml($msg, message, { allowHtml:false });
    }
  };

})(window.HCBP);
```

### B) รวม exports ใต้ `HCBP`
- เปิดทุกไฟล์ `budget.plan.*.js` แล้ว:
  - ค้นหา `window.` ที่ export ฟังก์ชัน/อ็อบเจ็กต์ → ปรับเป็น `HCBP.*`
  - ตัวอย่าง:  
    `window.batchEntryManager = ...` → `HCBP.batch.manager = ...`  
    `window.batchValidator = ...` → `HCBP.validate.batch = ...`  
    `window.getGridApi = ...` → `HCBP.ui.getGridApi = ...`

**Find/Replace (Regex) แนะนำบน VS Code**  
- Find: `window\.(\w+)\s*=` → Replace: `HCBP.$1 =`  
- ตรวจทานทุกเคสก่อนกด Replace all (บางอันเป็นค่าคงที่/3rd-party อย่าแตะ)

### C) Sanitize ทุก `.html(...)` ที่รับผันแปร
- ค้นหา: `\.html\(`  
- เปลี่ยนเป็น `HCBP.util.safeHtml(target, content, {allowHtml:true/false})` ตามเหมาะสม  
- กรณีข้อความระบบ/จาก validate → ใช้ `allowHtml:false` เป็นค่าเริ่มต้น

### D) CSRF Header
ไฟล์: `budget.plan.api.js` (หรือที่มี `submitToAPI`)
```diff
- function submitToAPI(url, data, options) {
+ function submitToAPI(url, data, options) {
+   const token = (document.querySelector('input[name="__RequestVerificationToken"]')?.value)
+     || (document.cookie.split('; ').find(x => x.startsWith('XSRF-TOKEN='))?.split('=')[1]);
    const headers = Object.assign({
      'Content-Type': 'application/json'
-   }, options?.headers || {});
+   }, options?.headers || {},
+   token ? { 'RequestVerificationToken': token } : {});
+   if (!token && HCBP.config.debug) {
+     console.warn('[HCBP] CSRF token not found. Ensure anti-forgery is wired.');
+   }
    return fetch(url, { method:'POST', headers, body: JSON.stringify(data) })
 }
```

### E) Real-time Validation: allow 0
ไฟล์: `budget.plan.form.validation.js`
```diff
- const hasValue = (v) => v !== '' && v !== '0';
+ const hasValue = (v) => v !== '';
  // จากนั้นให้ตรวจ numeric/decimal format แยก:
  // if (isNumericField) validateNumberFormat(v) && withinRange(v)
```
- รวมการแสดงผลสถานะไปที่ `HCBP.util.setFieldState($input, 'is-invalid', 'message')`

### F) Benefits Generator Queue (Keyed + Ready Event)
ไฟล์: `budget.plan.benefits.templates.js` (ฟังก์ชัน `generateBatchTemplatesForCompany`)
```diff
- const batchTemplateGenerationQueue = new Set();
- // debounce + setTimeout(250) รอ DOM
+ const jobQueue = new Map(); // key: `${companyId}:${rowId}` → {companyId,rowId,cb}
+ const schedule = (fn, ms=100) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
+ const drain = schedule(async () => {
+   const jobs = Array.from(jobQueue.values());
+   jobQueue.clear();
+   // group by company → regen deterministic
+   const groups = jobs.reduce((m,j)=>{ const k=j.companyId; (m[k]||(m[k]=[])).push(j); return m; },{});
+   for (const [companyId, list] of Object.entries(groups)) {
+     await regenCompanyBenefits(companyId, list.map(x=>x.rowId));
+     // await readiness
+     await waitBenefitsReady();
+     list.forEach(j => j.cb && j.cb());
+   }
+ }, 120);

+ function waitBenefitsReady(){
+   return new Promise(resolve=>{
+     const container = document.querySelector('#benefits-container');
+     if (!container) return resolve();
+     const mo = new MutationObserver((_m,_o)=>{ _o.disconnect(); resolve(); });
+     mo.observe(container, { childList:true, subtree:true });
+     // fallback timeout
+     setTimeout(()=>{ try{mo.disconnect();}catch{} resolve(); }, 1000);
+   });
+ }

- function generateBatchTemplatesForCompany(companyId, rowId, cb){
-   batchTemplateGenerationQueue.add({companyId, rowId, callback: cb});
-   // ... setTimeout(250) แล้วเคลียร์
- }
+ function generateBatchTemplatesForCompany(companyId, rowId, cb){
+   const key = `${companyId}:${rowId}`;
+   jobQueue.set(key, { companyId, rowId, cb });
+   drain();
+ }
```
- จุดที่ copy row: เปลี่ยนให้ **await** readiness หรือ listen event `benefits:ready` ก่อนตั้งค่า field

### G) jQuery Event Namespacing & Delegation
ตัวอย่างแก้:
```diff
- $('#company').on('change', onCompanyChange);
+ $('#company').on('change.hcbp', onCompanyChange);

- $('#benefits').on('input', '.benefit-field', onBenefitInput);
+ $('#benefits').on('input.hcbp', '.benefit-field', onBenefitInput);
```

### H) Logging Policy
- เปลี่ยน `console.log(...)` เป็น `HCBP.util.debug(...)` ทุกที่
- เปิดใช้งานเฉพาะ dev โดยตั้ง `HCBP.config.debug = true;` ใน dev layout

### I) CSS CSP Note
ไฟล์: `site.css`
```css
/* TODO(HCBP): Consider CSP headers and self-hosted fonts in production. */
```

---

## Testing & Acceptance Criteria (ให้รันและรายงานผล)
1. **Smoke Test (UI/Flows)**
   - เปิดหน้า Budget Planning → ไม่มี error ใน console
   - เพิ่ม/คัดลอก/ลบแถว ทำงานได้ปกติ
   - เปลี่ยนบริษัทแล้ว benefits fields regenerate ได้ครบ

2. **Copy Row Race Condition**
   - กดคัดลอกแถวหลายครั้งติดกัน → ค่า benefits ในแถวใหม่ครบ/ไม่หาย
   - ไม่เกิด flashing หรือค่า apply ไม่ครบ

3. **Validation**
   - ฟิลด์ตัวเลขที่ใส่ `0` ผ่านกฎ required ได้
   - invalid format/ช่วง แสดงสถานะผ่านคลาส `.is-invalid` และข้อความออก safe

4. **Security**
   - ค้นหาในโค้ดไม่เหลือ `.html(` ที่รับ input ผันแปรโดยไม่ sanitize
   - คำขอ save/submit มี header `RequestVerificationToken`
   - ปิด `HCBP.config.debug=false` แล้วไม่มี log หลุดในโปรดักชัน

5. **Globals**
   - ค้นหา `window.` แล้วยังคงมีเฉพาะ `window.HCBP` เท่านั้น (ยกเว้น lib ภายนอก)

---

## Git Discipline (ให้จัดเป็นคอมมิตแยก)
- `feat(hcbp): add core namespace + utilities (safeHtml, setFieldState, debug)`
- `refactor(hcbp): migrate window.* exports to HCBP.*`
- `fix(validation): treat '0' as value + unify field state`
- `feat(api): attach anti-forgery token header`
- `refactor(benefits): keyed job queue with MutationObserver readiness`
- `chore(events): namespace & delegate jQuery handlers`
- `chore(css): add CSP note`
- แนบ **diff (unified)** ของไฟล์ที่แก้ทั้งหมดในคำตอบ

---

## สิ่งที่ต้องส่งมอบ (ในคำตอบสุดท้าย)
- รายงานสรุปสิ่งที่แก้ + เหตุผลสั้นๆรายหัวข้อ (mapping กับ Goals)
- คำสั่งที่รันบน VS Code terminal
- **Unified diffs** สำหรับไฟล์ที่แก้หลัก (อย่างน้อย 6 ส่วนตามด้านบน)
- คำแนะนำการเปิด/ปิด `HCBP.config.debug`
- เช็คลิสต์ผลทดสอบตาม Acceptance Criteria (ระบุ pass/fail)

> ถ้าพบ dependency/ลำดับโหลดสคริปต์ใน `BudgetManagement.cshtml` ไม่รองรับ ให้เสนอ patch เพิ่มลำดับ `hcbp.namespace.js` ให้อยู่ก่อน `budget.plan.*` พร้อม diff

---

