// src/components/admin/pdfTemplates/lettersPDF.js
//
// HR letter PDFs (letter theme):
//   printOfferLetter      — Letter of Appointment
//   printPromotionLetter  — Promotion letter
//   printHikeLetter       — Salary Revision / Hike letter
//   printResignationLetter — Resignation letter

import {
  BASE_CSS, esc, fmtDate,
  todayDash, todayStr,
  letterCoHeaderHR, letterFooter,
  openPrintWindow,
} from "./pdfShared";

// HR letter PDFs use letterCoHeaderHR (no GST/CIN/PAN)
const letterCoHeader = letterCoHeaderHR;

// ── Letter theme ──────────────────────────────────────────────
const LETTER_CSS = `${BASE_CSS}
  body { padding:32px 40px 40px; line-height:1.7; font-size:12px; }
  @media print {
      @page { size:A4; margin:0; }
  body { padding:14mm 16mm; }
  }
  .hdr { display:flex; justify-content:space-between; align-items:flex-start;
         border-bottom:2.5px solid #0f766e; padding-bottom:12px; margin-bottom:20px; }
  .hdr-left { display:flex; align-items:flex-start; gap:14px; flex:1; }
  .hdr-right { text-align:right; font-size:10.5px; color:#444;
               line-height:1.7; flex-shrink:0; margin-left:16px; }
  .hdr-right .stamp { font-size:13px; font-weight:800; color:#0f766e; margin-bottom:2px; }
  .co-name { font-size:26px; font-weight:900; color:#0f766e;
             letter-spacing:-0.5px; line-height:1.1; margin-bottom:5px; }
  .co-meta { font-size:10.5px; line-height:1.65; color:#222; }
  .ref-date { display:flex; justify-content:space-between;
              margin-bottom:16px; font-size:11.5px; }
  .addr { margin-bottom:16px; font-size:12px; line-height:1.7; }
  .sub  { text-align:center; font-size:17px; font-weight:bold; margin:14px 0 16px; }
  .section { page-break-inside:avoid; break-inside:avoid; }
  h2 { font-size:14px; font-weight:900; text-transform:uppercase; margin:18px 0 7px;
       letter-spacing:0.01em; page-break-after:avoid; break-after:avoid; color:#0f766e; }
  p  { font-size:12px; margin-bottom:12px; text-align:justify; line-height:1.7; }
  ol { font-size:12px; padding-left:22px; margin:0 0 10px; }
  ol li { margin-bottom:8px; text-align:justify; line-height:1.7;
          page-break-inside:avoid; break-inside:avoid; }
  ol.alpha { list-style-type:lower-alpha; }
  ol.roman { list-style-type:lower-roman; padding-left:28px; }
  .sign-section { margin-top:36px; font-size:12px; line-height:1.9;
                  page-break-inside:avoid; break-inside:avoid; }
  .declare { border-top:1px solid #444; margin-top:32px; padding-top:16px;
             font-size:12px; line-height:2.0;
             page-break-inside:avoid; break-inside:avoid; }
  .field-row { margin-top:16px; font-size:12px; line-height:2.4; }
  .field-row p { margin:0; text-align:left; }
`;

// ── Shared employee address block ─────────────────────────────
function empAddrBlock(employee, empName) {
  return `<div class="addr">To&nbsp;<br/><strong>${empName},</strong><br/>
  ${employee.empAddress1 || "—"}<br/>
  ${employee.empAddress2 ? employee.empAddress2 + "<br/>" : ""}${employee.empAddress3 || ""}
</div>`;
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

// ── 5 · Offer Letter (Appointment) ───────────────────────────
export function printOfferLetter({ employee, position }) {
  if (!position) { alert("No active position found for this employee."); return; }
  const empName   = `${employee.empName || ""} ${employee.empLastName || ""}`.trim();
  const effDate   = position.epEfficientDate || todayStr();
  const annualCtc = (parseFloat(position.empMonthGross || position.empCtc || 0) * 12).toFixed(2);
  const dateStr   = todayDash();

  openPrintWindow(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Offer Letter – ${empName}</title>
<style>${LETTER_CSS} @page{size:A4;margin:14mm 16mm;}</style>
</head><body>
${letterCoHeader()}
<div class="ref-date" style="justify-content:flex-end;"><span>Date: ${dateStr}</span></div>
${empAddrBlock(employee, empName)}
<p>Dear ${empName},</p>
<div class="sub">Sub: Letter of Appointment</div>
<p>its our pleasure in appointing you in MosIC solution(P)Ltd., as <strong>${position.position || "—"}</strong>
in <strong>${position.department || "—"}</strong> or in such other capacity the management shall from time to
time determine. Please note that the employment terms contained in this letter are subject to the company policy.</p>

<div class="section"><h2>1. Appointment</h2><ol>
  <li>Your date appointment is effective from <strong>${effDate}</strong>.</li>
  <li>You will be liable to be transferred in such capacity as the company may from time to time determine
  to any other location, department, function, establishment, or branch of the company or its subsidiary,
  associate or affiliate Company. In such case you will be governed by the terms and conditions of service
  applicable to the new assignment.</li>
  <li>The age of retirement is 58 Years.</li>
</ol></div>

<div class="section"><h2>2. Compensation</h2>
<p>You will be eligible to receive the following:</p>
<ol class="alpha">
  <li>Annual pay (CTC) of <strong>&#8377; ${Number(annualCtc).toLocaleString("en-IN")}</strong> Per Annum.</li>
  <li>You are entitled to other compensation and benefits in accordance with the company policy as
  modified and inimated to you from time to time.</li>
  <li>Your salary will be reviewed periodically as per company policy.</li>
  <li>Changes in your compensation are subject to the discretion of the company and will be subject
  to and be on the basis of your effective performance and results during your employment and
  other relevant criteria.</li>
</ol></div>

<div class="section"><h2>3. Other Benefits</h2>
<p>You will be entitle to the following:</p>
<ol class="alpha">
  <li>Leave, holidays and working hours as applicable to your category of employees and location of posting.</li>
</ol></div>

<div class="section"><h2>4. Responsibilities</h2>
<ol class="alpha">
  <li>In view of your position and office, you must effectively, diligently and to the best of your ability perform
  all responsibilities and ensure results. There may be times when you will be expected to work extra hours
  to achieve the above when the job so requires. In this connection, you are required not to engage in
  activities that have or will have an adverse impact on the reputation/image and business of company
  whether directly or indirectly.</li>
  <li>You will be required to under take travel on Company work for which you will be reimbused for travel
  expenses as per the company policy applicable to you.</li>
  <li>We at MosIC solutions are committed to ensure 'Integrity' in all aspects of its functioning. You are
  expected to comply with the policies of the company including the Code of Business Conduct and other
  policies of the company as they form an integral part of the terms of employment with MosIC solutions.
  Consequently you are required to understand the scope and intent behind these policies and to comply
  with the same. These policies are updated/modified on a periodic basis and new policies may be
  introduced and notified to employees from time to time and you will be required to comply with same.</li>
  <li>Consistent with [c] above, any matter or situation or incident that may arise that could potentially result
  or has resulted, in any violation of the policies or the terms of your employment, shall immediately be
  brought to the notice of your Business unit head or manager.</li>
</ol></div>

<div class="section"><h2>5. Conflicts of Interest</h2>
<ol class="alpha">
  <li>You are required to engage yourself exclusively in the work assigned by MosIC solutions and shall not
  take up any independent or individual assignments (whether the same is part time or full time, in an
  advisory capacity or otherwise) directly or indirectly without the express written consent of your Business
  Unit Head.</li>
  <li>you shall ensure that you shall not, directly or indirectly, engage any activity or ave any interest in, or
  perform any services for any person who is involved in activities, which are or shall be in conflict with the
  interests of MosIC Solutions.</li>
  <li>The Conflict of interest Policy also refers to the need on your part, during your employement and for a
  period of one year from the cessation of your employment with MosIC solutions ( irrespective of the
  circumstances of, or the reasons for the cessation) not to solicit, induce or encourage:
    <ol class="roman">
      <li>Any employee of MosIC solutions to terminate their employment with MosIC solutions or to accept
      employment with any competitor, supplier or any customer with whom you have a connection.</li>
      <li>Any customer or vendor of MosIC solutions to move his existing business with MosIC solutions to
      a third party or to terminate his business relationship with MosIC solutions.</li>
      <li>Any existing employee to become associated with, or perform services of any type for any third party.</li>
    </ol>
  </li>
  <li>In case of any conflict or doubt, please discuss the matter with your Business Unit Head, to understand
  the position of MosIC solutions and resolve the conflict.</li>
</ol></div>

<div class="section"><h2>6. Confidentiality</h2>
<ol class="alpha">
  <li>In consideration of the opportunities, training and access to new techniques and know-how that will be
  made available to you, you will be required to comply with the confidentiality policy of the company.
  Therefore, please ensure that you as secret and confidential all Confidential Information ( as defined from
  time to time in the Confidentiality Policy of the company) and shall not use or disclose any such
  Confidential information except as may be required under obligation of law or as may be required by
  MosIC solutions and in the course of your employment. This covenant shall endure during your
  ( employment irrespective of the circumstances of, or the reasons, for the cessation).</li>
  <li>In your work for MosIC solutions, you will be expected not to use or disclose any confidential information,
  including trade secrets, of any former employer or other person with whom you have and obligation
  of confidentiality and by signing below you affirm that you have you have no conflicting obligations or
  non-complete agreements that would prevent you from working without limitation for MosIC solutions.</li>
</ol></div>

<div class="section"><h2>7. Assignment of Intellectual Property</h2>
<p>During you tenure with the company you shall disclose and assign to MosIC solutions as its exclusive
property, all developments developed or conceived by you solely or jointly with others that are related to
the company's business or that results from work that you perform for the Company or using the
Company's equipement, supplies or facilities and shall comply with policy.</p></div>

<div class="section"><h2>8. Non-Compete</h2>
<p>In the course of your employment with the Company you will be providing services to customers or
clients of the Company during which process you would be handling sensitive information including but
not limited to key customers of the Company, competitor information, customer sensitive information
('Confidential Information'). You acknowledge and recognize that confidential information available to you,
if leaked would cause irreparable harm to the company and its protection is of utmost importance to
( the Company. You confirm that for a period of six (6) months after separation of your employment from
the company irrespective of the circumstances of or the reason for the separation), you will not accept
any offer of employment from a customer or client with whom you have interacted or worked in a
professional capacity representing the Company client with whom you have interacted or worked in a
professional capacity representing the Company during the six(6)month preceding the date of separation.</p></div>

<div class="section"><h2>9. General</h2>
<ol class="alpha">
  <li>We trust that you have not provided us with any false declaration or wilfully suppressed any material
  information. If you have, you will be liable to be removed from service without any prior notice. Please
  note that you are required to inform us if there are any agreements, oral or written, which you have
  entered into and which may relate to or affect your commitments under this agreement.</li>
  <li>Your employment terms may be specifically enforce legally, if required. In this connection, if any of the
  provisions of the this Agreement are declared or found to be void or unenforceable due to any reason
  whatsoever, the remaining provisions of this Agreement shall continue in full force and effect.</li>
  <li>These employment terms supersede and replace any existing Agreement or understanding, if
  between MosIC solutions and you relating the same subject matter.</li>
  <li>You warrant that you are not prevented by a court or by any other administrative or judicial order
  from providing the service required under this agreement. In the event that you are not a citizen of
  the country of posting, you should have a valid work permit to work in the country of posting.</li>
</ol></div>

<div class="section"><h2>10. Notice Period</h2>
<p>This contract of employment is terminable, without resons, by either party giving two months prior written
notice. MosIC solution reserves the right to pay or recover salary in lieu of notice period. Further, the
company may be at its discretion relieve you from such date as it may deem fit even prior to the
expiry of the notice period. However if the management desires the employee to continue the
employment during the notice period, the employee shall do so.</p>
<p>Please confirm that the above terms are acceptable to you and that you accept the appointment by
signing copy of this letter of appointment.</p></div>

${letterFooter()}
</body></html>`);
}

// ── 6 · Promotion Letter ──────────────────────────────────────
export function printPromotionLetter({ employee, position }) {
  if (!position) { alert("No active position found for this employee."); return; }
  const empName   = `${employee.empName || ""} ${employee.empLastName || ""}`.trim();
  const firstName = employee.empName || empName;
  const effDate   = position.epEfficientDate || todayStr();
  const annualCtc = (parseFloat(position.empMonthGross || position.empCtc || 0) * 12).toFixed(2);
  const dateStr   = todayDash();

  openPrintWindow(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Promotion Letter – ${empName}</title>
<style>${LETTER_CSS} @page{size:A4;margin:14mm 16mm;}</style>
</head><body>
${letterCoHeader()}
<div class="ref-date" style="justify-content:flex-end;"><span>Date: ${dateStr}</span></div>
${empAddrBlock(employee, empName)}
<p>Dear ${empName}</p>
<div class="sub">Sub: Letter of Promotion</div>
<p>its our pleasure in appointing you in MosIC solution(P)Ltd., as <strong>${position.position || "—"}</strong> in <strong>${position.department || "—"}</strong>
or in such other capacity the management shall from time to time determine. Please note that the
employment terms contained in this letter are subject to the company policy.</p>

<div class="section"><h2>1. Appointment</h2><ol>
  <li>Your date appointment is effective from <strong>${effDate}</strong>.</li>
  <li>You will be liable to be transferred in such capacity as the company may from time to time determine
  to any other location, department, function, establishment, or branch of the company or its subsidiary,
  associate or affiliate Company. In such case you will be governed by the terms and conditions of service
  applicable to the new assignment.</li>
  <li>The age of retirement is 58 Years.</li>
</ol></div>

<div class="section"><h2>2. Compensation</h2>
<p>You will be eligible to receive the following:</p>
<ol class="alpha">
  <li>Annual pay (CTC) of <strong>&#8377; ${Number(annualCtc).toLocaleString("en-IN")}</strong> Per Annum.</li>
  <li>You are entitled to other compensation and benefits in accordance with the company policy as
  modified and inimated to you from time to time.</li>
  <li>Your salary will be reviewed periodically as per company policy.</li>
  <li>Changes in your compensation are subject to the discretion of the company and will be subject
  to and be on the basis of your effective performance and results during your employment and
  other relevant criteria.</li>
</ol></div>

<div class="section"><h2>3. Other Benefits</h2>
<p>You will be entitle to the following:</p>
<ol class="alpha">
  <li>Leave, holidays and working hours as applicable to your category of employees and location of posting.</li>
</ol></div>

<div class="section"><h2>4. Responsibilities</h2>
<ol class="alpha">
  <li>In view of your position and office, you must effectively, diligently and to the best of your ability perform
  all responsibilities and ensure results. There may be times when you will be expected to work extra hours
  to achieve the above when the job so requires. In this connection, you are required not to engage in
  activities that have or will have an adverse impact on the reputation/image and business of company
  whether directly or indirectly.</li>
  <li>You will be required to under take travel on Company work for which you will be reimbused for travel
  expenses as per the company policy applicable to you.</li>
  <li>We at MosIC solutions are committed to ensure 'Integrity' in all aspects of its functioning. You are
  expected to comply with the policies of the company including the Code of Business Conduct and other
  policies of the company as they form an integral part of the terms of employment with MosIC solutions.
  Consequently you are required to understand the scope and intent behind these policies and to comply
  with the same. These policies are updated/modified on a periodic basis and new policies may be
  introduced and notified to employees from time to time and you will be required to comply with same.</li>
  <li>Consistent with [c] above, any matter or situation or incident that may arise that could potentially result
  or has resulted, in any violation of the policies or the terms of your employment, shall immediately be
  brought to the notice of your Business unit head or manager.</li>
</ol></div>

<div class="section"><h2>5. Conflicts of Interest</h2>
<ol class="alpha">
  <li>You are required to engage yourself exclusively in the work assigned by MosIC solutions and shall not
  take up any independent or individual assignments (whether the same is part time or full time, in an
  advisory capacity or otherwise) directly or indirectly without the express written consent of your Business
  Unit Head.</li>
  <li>you shall ensure that you shall not, directly or indirectly, engage any activity or ave any interest in, or
  perform any services for any person who is involved in activities, which are or shall be in conflict with the
  interests of MosIC Solutions.</li>
  <li>The Conflict of interest Policy also refers to the need on your part, during your employement and for a
  period of one year from the cessation of your employment with MosIC solutions (irrespective of the
  circumstances of, or the reasons for the cessation) not to solicit, induce or encourage:
    <ol class="roman">
      <li>Any employee of MosIC solutions to terminate their employment with MosIC solutions or to accept
      employment with any competitor, supplier or any customer with whom you have a connection.</li>
      <li>Any customer or vendor of MosIC solutions to move his existing business with MosIC solutions to
      a third party or to terminate his business relationship with MosIC solutions.</li>
      <li>Any existing employee to become associated with, or perform services of any type for any third party.</li>
    </ol>
  </li>
  <li>In case of any conflict or doubt, please discuss the matter with your Business Unit Head, to understand
  the position of MosIC solutions and resolve the conflict.</li>
</ol></div>

<div class="section"><h2>6. Confidentiality</h2>
<ol class="alpha">
  <li>In consideration of the opportunities, training and access to new techniques and know-how that will be
  made available to you, you will be required to comply with the confidentiality policy of the company.
  Therefore, please ensure that you as secret and confidential all Confidential Information (as defined from
  time to time in the Confidentiality Policy of the company) and shall not use or disclose any such
  Confidential information except as may be required under obligation of law or as may be required by
  MosIC solutions and in the course of your employment. This covenant shall endure during your
  employment irrespective of the circumstances of, or the reasons, for the cessation.</li>
  <li>In your work for MosIC solutions, you will be expected not to use or disclose any confidential information,
  including trade secrets, of any former employer or other person with whom you have and obligation
  of confidentiality and by signing below you affirm that you have you have no conflicting obligations or
  non-complete agreements that would prevent you from working without limitation for MosIC solutions.</li>
</ol></div>

<div class="section"><h2>7. Assignment of Intellectual Property</h2>
<p>During you tenure with the company you shall disclose and assign to MosIC solutions as its exclusive
property, all developments developed or conceived by you solely or jointly with others that are related to
the company's business or that results from work that you perform for the Company or using the
Company's equipement, supplies or facilities and shall comply with policy.</p></div>

<div class="section"><h2>8. Non-Compete</h2>
<p>In the course of your employment with the Company you will be providing services to customers or
clients of the Company during which process you would be handling sensitive information including but
not limited to key customers of the Company, competitor information, customer sensitive information
('Confidential Information'). You acknowledge and recognize that confidential information available to you,
if leaked would cause irreparable harm to the company and its protection is of utmost importance to
the Company. You confirm that for a period of six (6) months after separation of your employment from
the company irrespective of the circumstances of or the reason for the separation), you will not accept
any offer of employment from a customer or client with whom you have interacted or worked in a
professional capacity representing the Company during the six (6) month preceding the date of separation.</p></div>

<div class="section"><h2>9. General</h2>
<ol class="alpha">
  <li>We trust that you have not provided us with any false declaration or wilfully suppressed any material
  information. If you have, you will be liable to be removed from service without any prior notice. Please
  note that you are required to inform us if there are any agreements, oral or written, which you have
  entered into and which may relate to or affect your commitments under this agreement.</li>
  <li>Your employment terms may be specifically enforce legally, if required. In this connection, if any of the
  provisions of the this Agreement are declared or found to be void or unenforceable due to any reason
  whatsoever, the remaining provisions of this Agreement shall continue in full force and effect.</li>
  <li>These employment terms supersede and replace any existing Agreement or understanding, if
  between MosIC solutions and you relating the same subject matter.</li>
  <li>You warrant that you are not prevented by a court or by any other administrative or judicial order
  from providing the service required under this agreement. In the event that you are not a citizen of
  the country of posting, you should have a valid work permit to work in the country of posting.</li>
</ol></div>

<div class="section"><h2>10. Notice Period</h2>
<p>This contract of employment is terminable, without resons, by either party giving two months prior written
notice. MosIC solution reserves the right to pay or recover salary in lieu of notice period. Further, the
company may be at its discretion relieve you from such date as it may deem fit even prior to the
expiry of the notice period. However if the management desires the employee to continue the
employment during the notice period, the employee shall do so.</p>
<p>Please confirm that the above terms are acceptable to you and that you accept the appointment by
signing copy of this letter of appointment.</p></div>

<div class="sign-section">
Sincerely,<br/>
for MosIC solution(p)Ltd<br/><br/>
Managing Director
</div>
<div class="declare">
<strong>Declaration &amp; Acknowledgment from Employee:</strong><br/>
I have read, Understood and agree to accept employment on the terms and conditions herein.
<div class="field-row">
  <p>I shall be reporting to duty on &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
  <p>Name :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
  <p>Signature:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
  <p>Date :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
  <p>Place :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
</div>
</div>
</body></html>`);
}

// ── 7 · Salary Hike / Revision Letter ────────────────────────
export function printHikeLetter({ employee, position, prevSalary }) {
  if (!position) { alert("No active position found for this employee."); return; }
  const empName   = `${employee.empName || ""} ${employee.empLastName || ""}`.trim();
  const firstName = employee.empName || empName;
  const effDate   = position.epEfficientDate || todayStr();
  const basic     = parseFloat(position.empBasic     || 0);
  const hra       = parseFloat(position.empHra       || 0);
  const allowance = parseFloat(position.empAllowance || 0);
  const gross     = parseFloat(position.empMonthGross || position.empCtc || (basic + hra + allowance));
  const dateStr   = todayDash();
  // derive month label from effDate e.g. "JANUARY-2026"
  const effDateObj  = effDate ? new Date(effDate) : new Date();
  const monthLabel  = effDateObj.toLocaleString("en-IN", { month: "long", year: "numeric" }).toUpperCase().replace(" ", "-");

  openPrintWindow(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Salary Hike Letter – ${empName}</title>
<style>${LETTER_CSS}
  .hike-meta { display:flex; justify-content:space-between; align-items:flex-start;
               margin-bottom:16px; font-size:11.5px; }
  .hike-to   { line-height:1.9; }
  .hike-right { text-align:left; line-height:1.9; }
  .hike-right .lbl { font-weight:700; }
  table.sal { width:100%; border-collapse:collapse; margin:14px 0; }
  table.sal td { border:1px solid #ccc; padding:7px 12px; font-size:12px; }
  table.sal td:last-child { text-align:right; font-weight:600; }
  table.sal tr.total td { font-weight:700; background:#f0fffe; border-top:2px solid #0f766e; }
  @page{size:A4;margin:14mm 16mm;}
</style>
</head><body>
${letterCoHeader()}
<div class="sub" style="margin:14px 0 10px;">PAY HIKE FOR MONTH OF — ${monthLabel}</div>
<div class="hike-meta">
  <div class="hike-to">
    TO<br/>
    <strong>${esc(empName)},</strong><br/>
    ${esc(employee.empAddress1 || "—")},<br/>
    ${employee.empAddress2 ? esc(employee.empAddress2) + ",<br/>" : ""}${esc(employee.empAddress3 || "")}.
  </div>
  <div class="hike-right">
    <span class="lbl">DATE :</span> ${dateStr}<br/>
    <span class="lbl">DESIGNATION :</span> ${esc(position.position || "—")}<br/>
    <span class="lbl">EMAIL :</span> ${esc(employee.empMail || "—")}<br/>
    <span class="lbl">CURRENCY :</span> INR
  </div>
</div>
<p>DEAR ${esc(firstName)},</p>
<p>We are pleased to communicate to you that based on the Performance appraisal your salary is
revised and the new monthly salary is as follows</p>

<table class="sal">
  <tr><td>Payment</td><td></td></tr>
  <tr><td>FIXED PAY</td><td>${basic.toFixed(2)}</td></tr>
  <tr><td>HRA</td><td>${hra.toFixed(2)}</td></tr>
  <tr><td>OTHER ALLOWANCE</td><td>${allowance.toFixed(2)}</td></tr>
  <tr class="total"><td>Gross Annual Salary</td><td>${gross.toFixed(2)}</td></tr>
</table>

<p>New salary will be implemented from <strong>${effDate}</strong> till further communication on salary revision.</p>

<div class="sign-section">
With Regards<br/><br/>
(Authorised signatory)
</div>
</body></html>`);
}

// ── 8 · Resignation Letter ────────────────────────────────────
export function printResignationLetter({ employee, position, lastWorkingDate }) {
  const empName  = `${employee.empName || ""} ${employee.empLastName || ""}`.trim();
  const dateStr  = todayDash();
  const endDate  = lastWorkingDate;
  const desig    = position?.position || position?.role || "";
  const fromDate = employee.empDoj || "—";
  openPrintWindow(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Resignation Letter – ${empName}</title>
<style>${LETTER_CSS} @page{size:A4;margin:14mm 16mm;}</style>
</head><body>
${letterCoHeader()}
<div class="ref-date" style="justify-content:flex-end;">
  <span>DATE : ${dateStr}</span>
</div>
<div class="sub" style="margin-top:10px">RESIGNATION LETTER</div>
<p style="margin-top:12px">TO WHOMSOEVER IT MAY CONCERN</p>
<p>Hereby it is certified that <strong>${esc(empName)}</strong> has been working as
<strong>${esc(desig || "—")}</strong> from <strong>${fmtDate(fromDate)}</strong> to <strong>${fmtDate(endDate)}</strong>.</p>

<p>During this period, his/her performance is very good and we wish him/her success for all future endeavours.</p>
<div class="sign-section">
  Authorised signatory<br/>
  Director
</div>
</body></html>`);
}
