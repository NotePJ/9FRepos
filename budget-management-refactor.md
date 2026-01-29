# 🛠️ GPT‑5 mini Prompt — HCBP Refactor & Security Hardening (VS Code, Parallel Folder: `budget-management`)

คุณคือ **Senior Full‑Stack Engineer** (ASP.NET Core MVC **.NET 8**, jQuery, AG Grid, Bootstrap 5.3) ทำงานบน **VS Code**. โปรดลงมือ **รีแฟคเตอร์และแพตช์โค้ด** ให้ *maintainable, scalable, secure* โดยทำงานบนโฟลเดอร์ **parallel** ชื่อ `budget-management` (เพื่อ rollback ง่าย) และส่งมอบเป็นขั้นตอนพร้อม **diff จริง** ของไฟล์ที่แก้

---

## Project Context
- Stack: ASP.NET Core MVC (.NET 8), jQuery, AG Grid, Bootstrap 5.3
- หน้า Budget Planning ใช้ไฟล์:
  - `budget.plan.main.js`
  - `budget.plan.events.js`
  - `budget.plan.form.validation.js`
  - `budget.plan.benefits.templates.js`
  - `budget.plan.config.js`
  - `budget.plan.api.js`
  - `budget.plan.grid.js`, `budget.plan.dynamic.forms.js`, `budget.plan.offcanvas*.js`, `budget.plan.allocation.js`, `budget.plan.core.js`, `budget.plan.options.js`, `budget.plan.filters.js`, `budget.plan.fullscreen.js`
  - `site.css`
- เป้าหมาย: ลด window pollution, แก้ logic bugs, เสริมความปลอดภัยตาม OWASP, จัด event/queue ให้ deterministic, และทำให้ jQuery‑first

---

## Operating Mode (สำคัญ)
- ทำงานบน **parallel folder**: `wwwroot/lib/razor/js/budget-management/*`
- **ห้ามแก้**ของเดิมใน `wwwroot/lib/razor/js/budget.plan.*.js`
- รายงานผลเป็นลำดับขั้น + แนบ **unified diffs** ทุกไฟล์ที่แก้ใน `budget-management/*`
- ให้แนบคำแนะนำการทดสอบและสรุปผล pass/fail ตาม Acceptance Criteria

---

## Setup Steps (ให้พิมพ์ขั้นตอนในคำตอบ + ใช้ทำงานจริง)
1) สร้างโฟลเดอร์และคัดลอกไฟล์
```
wwwroot/lib/razor/js/budget-management/ ← ใหม่
wwwroot/lib/razor/js/budget-management/hcbp/ ← ใหม่
คัดลอก budget.plan.*.js ทั้งหมดจาก wwwroot/lib/razor/js/budget-planning → ไปยัง budget-management/
```
2) อ่านไฟล์ budget-baseColumns.md 
3) อ่านไฟล์ budget-planning-system-architecture.md
4) อ่านไฟล์ budget-config-event-workflow.md
5) อ่านไฟล์ budget-planning-event-workflow.md
6) อ่านไฟล์ budget-allocation-workflow.md
7) สร้าง `wwwroot/lib/razor/js/budget-management/hcbp/hcbp.namespace.js` (เนื้อหาด้านล่าง)
8) ปรับ `Views/Home/BudgetPlanning.cshtml` ให้ **DEV** โหลดสคริปต์จาก `budget-management/` โดยให้ `hcbp.namespace.js` โหลดก่อนทุกไฟล์ budget.* (Production ยังคงโหลดชุดเดิม)
9) สรุปรวม workflow ทั้งหมดวิเคาระห์ทำความเข้าใจ แล้วพิจารณาปรับ Work Items (Goals) หากมีข้อ concern ก็ให้แจ้งก่อนปรับปรุง

## Work Items (Goals) — ลงมือทำและแนบ diff

### 1) Global Namespace Consolidation
- สร้าง single global namespace: `window.HCBP = { config, api, ui, batch, validate, util }`
- ย้ายการ export เดิม (`window.*`) ให้มาอยู่ใต้ `HCBP.*`
- ห้ามเหลือ `window.*` กระจัดกระจาย (ยกเว้น `window.HCBP`)

### 2) XSS Hardening / Safe Rendering (OWASP A03)
- สร้าง `HCBP.util.safeHtml(el, textOrHtml, {allowHtml})`
  - `allowHtml=false` → `.text()` เสมอ
  - `allowHtml=true` → ใช้ DOMPurify; ถ้าไม่มีให้ fallback เป็น `.text()`
- แทนที่จุดที่ใช้ `.html(...)` กับค่า “ผันแปร” ให้เรียก `safeHtml` แทน

### 3) CSRF Protection in FE Calls (OWASP A07/A05)
- อัปเดต `submitToAPI(...)` (ใน `budget.plan.api.js`) ให้แนบ Anti‑Forgery Token:
  - หา token ใน `input[name="__RequestVerificationToken"]` หรือ cookie `XSRF-TOKEN`
  - ใส่ header `RequestVerificationToken: <token>`
  - ถ้าไม่พบ token ให้เตือนเฉพาะโหมด dev

### 4) Real‑time Validation Fix (ค่า ‘0’ ต้องถือว่า “มีค่า”)
- ใน `budget.plan.form.validation.js`:
  - เปลี่ยน `hasValue` เป็น `v !== ''` (ยอมรับ ‘0’)
  - ตรวจ numeric/decimal แยกตาม format + ช่วง
  - รวมการตั้งสถานะ field ผ่าน `HCBP.util.setFieldState($input, state, message?)`
    - ใช้คลาส `.is-valid/.is-invalid/.is-warning` ให้สอดคล้อง `site.css`

### 5) Benefits Generator Queue — Keyed + Deterministic
- รีแฟคเตอร์ `generateBatchTemplatesForCompany(companyId, batchRowIndex, callback)`:
  - เปลี่ยนจาก `Set<object>` เป็น **Map keyed by `${companyId}:${rowId}`**
  - รวมงานซ้ำ (coalescing) ตาม key
  - ใช้ Promise/Microtask + **MutationObserver** รอ DOM readiness (เลิก magic delay)
  - dispatch event `benefits:ready` เมื่อพร้อม (หรือคืน Promise)
- จุด copy row ให้รอ readiness ก่อน apply ค่า

### 6) jQuery‑first Events (Namespaces & Delegation)
- ใช้ชื่อเนมสเปซอีเวนต์สม่ำเสมอ เช่น `.on('change.hcbp', ...)`
- สำหรับฟิลด์ที่ regenerate บ่อย ใช้ delegation:
  `$(container).on('input.hcbp', '[data-benefit-field]', handler)`

### 7) Logging Policy
- เพิ่ม `HCBP.config.debug=false` (เปิดเฉพาะ DEV)
- สร้าง `HCBP.util.debug(...)` และแทนที่ `console.log(...)` ให้เรียกผ่าน util
- ปิด log เมื่อ `debug=false`

### 8) CSS / CSP Note
- ใน `site.css` เพิ่มคอมเมนต์ TODO เรื่อง CSP และ self‑host fonts สำหรับโปรดักชัน

---

## File to Add — `wwwroot/lib/razor/js/budget-management/hcbp/hcbp.namespace.js`
> สร้างไฟล์นี้และใช้ใน DEV ก่อนเสมอ (โหลดก่อน budget.* ทุกไฟล์)
```js
// @hcbp core namespace (loaded first)
window.HCBP = window.HCBP || { config:{}, api:{}, ui:{}, batch:{}, validate:{}, util:{} };

(function(ns){
  ns.config.debug = false; // set true in DEV

  ns.util.debug = (...args) => { if (ns.config.debug && console) console.log(...args); };

  ns.util.safeHtml = function(elOrSelector, textOrHtml, { allowHtml=false } = {}){
    const $el = (window.jQuery ? jQuery(elOrSelector) : null);
    if (!$el) return;
    if (!allowHtml) { $el.text(textOrHtml ?? ""); return; }
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      $el.html(window.DOMPurify.sanitize(String(textOrHtml ?? "")));
    } else {
      $el.text(textOrHtml ?? ""); // fallback: never trust raw HTML
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

---

## Diffs ที่คาดหวัง (สรุป)
- `budget.plan.api.js`: เพิ่มการแนบ CSRF header ใน `submitToAPI(...)`
- `budget.plan.form.validation.js`: เปลี่ยน `hasValue`, เรียก `setFieldState`
- `budget.plan.benefits.templates.js`: เปลี่ยนคิวเป็น Map keyed + readiness via MutationObserver
- ทุกไฟล์ `budget.plan.*.js` ที่ export ไป `window.*` → เปลี่ยนเป็น `HCBP.*`
- จุดที่ใช้ `.html(...)` กับค่า “ผันแปร” → เปลี่ยนเป็น `HCBP.util.safeHtml(...)`
- `site.css`: เพิ่มคอมเมนต์ TODO เรื่อง CSP

---

## Acceptance Criteria (ให้ทดสอบ & รายงานผล)
1. **Smoke Test**: หน้า Budget Planning ไม่มี error console, เพิ่ม/คัดลอก/ลบแถวได้, เปลี่ยนบริษัทแล้ว benefits fields regenerate ครบ
2. **Copy Row Race**: คัดลอกหลายครั้งติดกัน ค่า benefits ในแถวใหม่ครบ ไม่กระพริบ/ไม่หาย
3. **Validation**: ค่า `0` ผ่านกฎ required; รูปแบบ/ช่วงผิด → แสดง `.is-invalid` พร้อมข้อความที่ถูก sanitize
4. **Security**: ค้นหาโค้ดไม่เหลือ `.html(` ที่รับค่า “ผันแปร” โดยไม่ sanitize; คำขอ save/submit มี header `RequestVerificationToken`; `debug=false` ไม่พ่น log ในโปรดักชัน
5. **Globals**: เหลือ global เดียวคือ `window.HCBP`

---

## What to Return (ในคำตอบ)
- ขั้นตอนที่ลงมือทำจริง (bullet) + เหตุผลสั้นๆ mapping กับ Goals
- รายการคำสั่ง/การแก้ไฟล์ที่ทำใน VS Code
- **Unified diffs** ของไฟล์ใน `budget-management/*` ที่แก้ทั้งหมด
- เช็คลิสต์ผลทดสอบตาม Acceptance Criteria (pass/fail)

> หากพบปัญหาลำดับการโหลดสคริปต์ ให้แนบ patch ของ `BudgetPlanning.cshtml` (เฉพาะ DEV) เพื่อให้ `hcbp.namespace.js` โหลดก่อน budget.* และให้ของ Production ยังชี้สคริปต์เดิมจนกว่าจะอนุมัติ

---

## TODO / Resume checklist (pick up where you left off)

Use these items to quickly resume the refactor. Mark statuses using the tags: [not-started], [in-progress], [blocked], [done]. Keep this block at the end of the file so it's easy to find.

- [not-started] 1) Read & audit legacy files
  - Files: `wwwroot/lib/razor/js/budget-planning/*.js` (all budget.plan.* files), `budget-baseColumns.md`, `budget-planning-event-workflow.md`, `budget-config-event-workflow.md`
  - Purpose: extract template rendering, event names, selectors, and async generation logic to port into `budget-management/`.

- [not-started] 2) Create parallel folder & copy stubs
  - Path to create: `wwwroot/lib/razor/js/budget-management/` and `.../hcbp/`
  - Action: copy legacy files into parallel folder as start points OR create minimal stubs exporting `HCBP.*` (no auto-init).

- [not-started] 3) Implement `hcbp.namespace.js`
  - Location: `wwwroot/lib/razor/js/budget-management/hcbp/hcbp.namespace.js`
  - Must export: `HCBP.config`, `HCBP.util.safeHtml`, `HCBP.util.setFieldState`, `HCBP.api.submitToAPI`, `HCBP.validate`, `HCBP.config.features.showMasterGrid = false`.

- [not-started] 4) Port/Refactor core modules (one-by-one)
  - Files (priority order):
    1. `budget.plan.core.js` → `HCBP.core`
    2. `budget.plan.grid.js` → `HCBP.grid` (implement dynamic columns)
    3. `budget.plan.benefits.templates.js` → `HCBP.batch` (keyed Promise queue)
    4. `budget.plan.events.js` → `HCBP.ui.events` (copy-row, save-row handlers)
    5. `budget.plan.form.validation.js` → `HCBP.validate`
    6. the rest (dynamic.forms, offcanvas, fullscreen, allocation, options, filters, config) → stubs then iterate

- [not-started] 5) Replace unsafe DOM writes
  - Replace all `.html(` and `innerHTML =` in `budget-management/` with `HCBP.util.safeHtml` or DOM API.

- [not-started] 6) Add Row-Save handler
  - Ensure delegated namespaced handler `$(document).on('click.hcbp', '[data-action="save-row"]', ...)` exists.
  - Implement `HCBP.ui.events._buildRowPayload` and call `HCBP.api.submitToAPI`.

- [not-started] 7) Guard master/detail
  - Wrap any master/detail code with `if (HCBP.config.features.showMasterGrid) { ... }`.

- [not-started] 8) Verification tasks (run after edits)
  - Strict scan (must be 0 results): search `wwwroot/lib/razor/js/budget-management/**/*.js` for the regexes `\.html\(` and `innerHTML\s*=`.
  - Node parse: run a quick vm.Script parse for each `budget-management` JS file.
  - Selector check: confirm `BudgetManagement.cshtml` contains preserved selectors and deprecated selectors are removed.

- [not-started] 9) Docs & diffs
  - Produce textual unified diffs (`UNIFIED_PATCH.txt`) for all files created/changed under `budget-management/` and append `CHANGELOG.md` / `PATCH_NOTES.txt`.

- [not-started] 10) Smoke test (optional)
  - Use `smoke-test.js` (Puppeteer) to simulate Copy Row + concurrent generation + Save-row. Requires local dev server.

### Quick commands to run locally (PowerShell)
Use these to verify and resume quickly. Run from repository root.

Search for risky DOM writes in parallel folder:
```powershell
Select-String -Path .\wwwroot\lib\razor\js\budget-management\**\*.js -Pattern '\.html\(|innerHTML\s*= ' -SimpleMatch -List
``` 

Run Node parse check (simple script invocation): create `tools/parse-check.js` with a small vm.Script loader, then run:
```powershell
node .\tools\parse-check.js .\wwwroot\lib\razor\js\budget-management\
```

Run smoke-test (requires dev server and Puppeteer installed):
```powershell
# start dev server in separate terminal
dotnet run --project .\HCBPCoreUI-Backend.csproj

# from repo root (install puppeteer if needed)
node .\wwwroot\lib\razor\js\budget-management\smoke-test.js
```

### Notes for the next session (shortcut)
- Next file to edit: `hcbp/hcbp.namespace.js` (create if missing) — this unlocks safeHtml, CSRF header and debug toggles. Mark that file as your first commit.
- Keep changes confined to `wwwroot/lib/razor/js/budget-management/` and `Views/Home/BudgetManagement.cshtml` (DEV only). Do NOT modify files under `budget-planning/` or third-party libs.
- If you need to stub server-side template rendering, use `HCBP.config.api.templateRenderUrl` and leave a TODO comment linking to `budget-planning` source location.

---


If you'd like, I can now start by creating the `hcbp.namespace.js` stub and the minimal file scaffolding for the top 5 modules; tell me to proceed and I'll apply the diffs and run the quick scans.


---

### Updated resume checklist (automated)

This section was appended by the refactor automation to reflect files created in the `budget-management/` parallel folder and next steps.

- [done] Created `hcbp/hcbp.namespace.js` with `HCBP.util.safeHtml`, `setFieldState`, `ensureDomPurify`, and `config.debug` flag.
- [done] Added delegated namespaced save-row handler in `budget.plan.events.js` (parallel) and Copy Row logic that awaits `HCBP.batch.generateBatchTemplatesForCompany`.
- [done] Added stubs:
  - `budget.plan.core.js` (HCBP.core.init)
  - `budget.plan.grid.js` (HCBP.grid.init, buildColumnsForCompany)
  - `budget.plan.benefits.templates.js` (HCBP.batch.generateBatchTemplatesForCompany keyed Promise skeleton)
  - `budget.plan.form.validation.js` (HCBP.validate.hasValue/isNumeric/isDecimal, bindNumericValidation)
- [done] Updated `Views/Home/BudgetManagement.cshtml` (DEV) to load `budget-management/` scripts and removed master/detail UI from the parallel view; `budget.plan.deprecation.js` added to set `HCBP.config.features.showMasterGrid = false`.

Next recommended steps:
- [in-progress] Replace any remaining unsafe `.html(` or `innerHTML =` in `wwwroot/lib/razor/js/budget-management/` with `HCBP.util.safeHtml` (run strict scan).
- [in-progress] Implement `HCBP.api.submitToAPI` to attach anti-forgery token header (CSRF) in `budget.plan.api.js` (parallel file).
- [not-started] Extract and centralize `_buildRowPayload` helper in `HCBP.ui.events` and finish optimistic UI handling for save-row.
- [not-started] Port the rest of legacy modules into parallel stubs and iterate until feature parity.

How to resume quickly:
1. Run the strict scan (PowerShell provided in this doc) to confirm no unsafe DOM writes remain in `budget-management/`.
2. Implement `HCBP.api.submitToAPI` in `budget.plan.api.js` (parallel) and run Node parse check.
3. Manually run the app in DEV and call `HCBP.ui.events.init()` and `HCBP.core.init()` from the browser console to exercise binding.

