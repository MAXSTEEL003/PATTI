// Live calculation and render to preview
function q(selector, root=document) { return root.querySelector(selector); }
function qAll(selector, root=document) { return Array.from(root.querySelectorAll(selector)); }

function formatNumber(n, compact=false){
  if (n === '' || n === null || typeof n === 'undefined') return '';
  const num = Number(n) || 0;
  if (compact){
    try{
      return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 2 }).format(num);
    }catch(e){
      return num.toLocaleString('en-IN');
    }

// Generate image blob with html2canvas preferred, fallback to domtoBlob.
// Provides clearer errors for cross-origin taint problems.
async function generateImageBlob(node, preferCanvas=true){
  // try html2canvas first when available
  if(preferCanvas && window.html2canvas){
    try{
      const canvas = await html2canvas(node, {backgroundColor:'#fff', scale: window.devicePixelRatio || 1, useCORS:true, allowTaint:false});
      const blob = await new Promise((res, rej)=> canvas.toBlob(res, 'image/png'));
      if(!blob) throw new Error('html2canvas returned no blob');
      return blob;
    }catch(e){
      console.warn('html2canvas failed, falling back to domtoBlob:', e);
      // if the error mentions taint or security, rethrow to allow caller to explain CORS issues
      const msg = (e && e.message) ? e.message.toLowerCase() : '';
      if(msg.includes('taint') || msg.includes('security') || msg.includes('cross-origin')) throw e;
      // otherwise, continue to fallback
    }
  }
  // fallback to domtoBlob
  const blob = await domtoBlob(node, 2);
  if(!blob) throw new Error('domtoBlob failed to produce blob');
  return blob;
}
  }
  return num.toLocaleString('en-IN');
}

// parse user-entered values robustly: strip commas and non-numeric characters
function parseInput(v){
  if (v === '' || v === null || typeof v === 'undefined') return 0;
  // allow digits, minus and dot
  const cleaned = String(v).replace(/[^0-9.\-]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

function escapeHtml(str){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Format a date string (ISO or other) into DD/MM/YYYY for consistent display
function formatDate(val){
  if(!val) return '';
  const d = new Date(val);
  if(isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function recalcAll(){
  // compute each item amount and totals
  const rows = qAll('#itemsTable .itemRow');
  const outItems = q('#out_items');
  if(outItems) outItems.innerHTML = '';
  // Calculate amount once using global QTY and RATE
  const gQty = parseInput(q('#rate_qty')?.value);
  const gRate = parseInput(q('#rate_rate')?.value);
  const amount = gQty * gRate;
  let subtotal = amount; // subtotal is the single calculated amount

  // Update first row amount display (if exists) and render preview row
  if(rows.length > 0){
    const first = rows[0];
    const amtDisplay = first.querySelector('.amountDisplay');
    if(amtDisplay){
      // support both input elements and plain cells
      if(amtDisplay.tagName === 'INPUT' || amtDisplay.tagName === 'TEXTAREA') amtDisplay.value = formatNumber(amount);
      else amtDisplay.textContent = formatNumber(amount);
    }
  }
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>Amount</td><td>${formatNumber(amount)}</td>`;
  if(outItems) outItems.appendChild(tr);

  const lorry = parseInput(q('#lorry')?.value);
  const discount = parseInput(q('#discount')?.value);
  const sellerComm = parseInput(q('#seller_commission')?.value);
  const qdiff = parseInput(q('#qdiff')?.value);
  const rateQty = parseInput(q('#rate_qty')?.value);
  const rateRate = parseInput(q('#rate_rate')?.value);
  const lorrySmall = parseInput(q('#lorry_small')?.value);

  // compute PRE-TOTAL (sum of B6+B7+B9+B10). NOTE: SHORTAGE must NOT be included
  // anywhere in these totals — the user requested it be handled separately at the end.
  const pretaxTotal = lorrySmall + discount + sellerComm + qdiff;

  // show LORRY and DISCOUNT as full formatted amounts (not compact)
  const outLorry = q('#out_lorry'); if(outLorry) outLorry.textContent = formatNumber(lorrySmall, false);
  const outDiscount = q('#out_discount'); if(outDiscount) outDiscount.textContent = formatNumber(discount, false);
  const outSeller = q('#out_seller'); if(outSeller) outSeller.textContent = formatNumber(sellerComm);
  const outQdiff = q('#out_qdiff'); if(outQdiff) outQdiff.textContent = formatNumber(qdiff);
  const outTotal = q('#out_total'); if(outTotal) outTotal.textContent = formatNumber(pretaxTotal);

  // shortage = PRE-TOTAL - cheque amount
  // IMPORTANT: shortage is intentionally kept separate and must not be "clubbed"
  // into other totals. We store it in a dedicated variable and DOM element only.
  const chqAmt = parseInput(q('#chq_amount')?.value);
  const shortage = pretaxTotal - chqAmt;

  // populate exact A1..I11 cells to match the Excel screenshot
  // write to dedicated span for B1 so text serialization works reliably
  const millerVal = q('#miller_name')?.value || '';
  if(q('#B1_value')) q('#B1_value').textContent = millerVal;
  const B1_td = q('#B1'); if(B1_td) B1_td.textContent = millerVal;
  // map inputs to preview cells as requested
  const B2 = q('#B2'); if(B2) B2.textContent = q('#party_name')?.value || '';
  const B3 = q('#B3'); if(B3) B3.textContent = q('#bill_no')?.value || '';
  const B4 = q('#B4'); {
    const arrivalVal = q('#arrival_dt')?.value;
     if(B4) B4.textContent = arrivalVal ? formatDate(arrivalVal) : '';
  }
  // QTY -> B5, RATE -> D5, E5 shows calculated amount
  const B5 = q('#B5'); if(B5) B5.textContent = formatNumber(gQty);

  // RATE row: E5 should show the single calculated amount
  const singleAmount = gQty * gRate;
  const C5 = q('#C5'); if(C5) C5.textContent = '';
  const D5 = q('#D5'); if(D5) D5.textContent = formatNumber(gRate);
  const E5 = q('#E5'); if(E5) E5.textContent = formatNumber(singleAmount);

  // LORRY small in B6, main LORRY total in E6
  const B6 = q('#B6'); if(B6) B6.textContent = formatNumber(parseInput(q('#lorry_small')?.value));
  // E6 will mirror the computed TOTAL (B11) per user instruction; assigned later after computedTotal is calculated.

  // DISCOUNT -> B7, keep main discount in E7
  const B7 = q('#B7'); if(B7) B7.textContent = formatNumber(discount);
  // E7 will be computed as E5 - B11 (singleAmount - computedTotal) per user request.

  // NOTE: E8 will be mirrored from G6 after computedTotal is known (see below).
  // SELLER COM -> B9 and also show in E9
  const B8 = q('#B8'); if(B8) B8.textContent = formatNumber(parseInput(q('#seller_commission')?.value));

  // Q-DIFF should appear in B10 (user requested)
  const B10 = q('#B10'); if(B10) B10.textContent = formatNumber(parseInput(q('#qdiff')?.value));

  // compute TOTAL as sum of the preview cells B6 + B7 + B9 + B10
  // This mirrors pretaxTotal above and explicitly excludes shortage.
  const lorryHire = parseInput(q('#lorry_small')?.value);
  const discountMain = parseInput(q('#discount')?.value);
  const seller = parseInput(q('#seller_commission')?.value);
  const qdiffVal = parseInput(q('#qdiff')?.value);
  const computedTotal = lorryHire + discountMain + seller + qdiffVal;
  // put TOTAL in B11 and E11 (B9 is used for seller commission)
  const B11 = q('#B11'); if(B11) B11.textContent = formatNumber(computedTotal);
  const E11 = q('#E11'); if(E11) E11.textContent = formatNumber(computedTotal);

  // E7 = E5 - B11 (singleAmount - computedTotal)
  const E7 = q('#E7'); if(E7) E7.textContent = formatNumber(singleAmount - computedTotal);

  // E6 mirrors B11 (computedTotal): write into the dedicated span AND also
  // set the parent TD's visible textContent so merged-cell rendering always
  // shows the value (this avoids cases where a span might be hidden).
  const E6_value = q('#E6_value');
  const E6_td = q('#E6');
  if(E6_value) E6_value.textContent = formatNumber(computedTotal);
  if(E6_td) E6_td.textContent = formatNumber(computedTotal);
  // ensure G6 holds a visible value (mirror computedTotal into G6) so E8 can mirror G6
  const G6_node = q('#G6'); if(G6_node) G6_node.textContent = formatNumber(computedTotal);
  // E8 should mirror I6 (cheque amount) per user request; format if numeric otherwise copy text.
  const E8 = q('#E8');
  const I6_node = q('#I6');
  let e8Text = '';
  if(I6_node && String(I6_node.textContent).trim() !== ''){
    const i6txt = String(I6_node.textContent).trim();
    // treat as numeric when only digits, commas, dots, spaces or minus present
    if(/^[0-9,\.\-\s]+$/.test(i6txt)){
      e8Text = formatNumber(parseInput(i6txt));
    }else{
      e8Text = i6txt;
    }
  }else{
    // fallback: leave empty if I6 empty
    e8Text = '';
  }
  if(E8) E8.textContent = e8Text;

  // Populate the merged D10 cell with the Remarks text (trimmed)
  const D10_val = q('#D10_value');
  // sanitize remarks: replace newlines, trim and clamp to 200 chars to avoid layout break
  const rawRemarks = (q('#remarks')?.value || '');
  const sanitized = String(rawRemarks).replace(/\s+/g,' ').trim();
  const maxLen = 200;
  const remarksVal = sanitized.length > maxLen ? sanitized.slice(0, maxLen) + '…' : sanitized;
  if(D10_val) D10_val.textContent = remarksVal;

  // Compute E9 as E7 - E8 (numeric). E7 is singleAmount - computedTotal, E8 is cheque amount.
  // We'll parse both as numbers and set the formatted result into #E9, with color class.
  const E9_td = q('#E9');
  let e7num = parseInput(singleAmount - computedTotal);
  let e8num = 0;
  // prefer reading numeric I6 (cheque amount) as source of E8 value
  const I6_read = q('#I6');
  if(I6_read) e8num = parseInput(I6_read.textContent || I6_read.innerText || '0');
  const e9num = e7num - e8num;
  const e9text = formatNumber(e9num);
  if(E9_td) {
    E9_td.textContent = e9text;
    E9_td.classList.remove('pos','neg');
    if(e9num > 0) E9_td.classList.add('pos');
    else if(e9num < 0) E9_td.classList.add('neg');
  }

  // CHQ fields in column I: CHQ AM row6, CHQ NO row7, CHQ DT row8, BANK row9
  const I6 = q('#I6'); if(I6) I6.textContent = formatNumber(parseInput(q('#chq_amount')?.value));
  const I7 = q('#I7'); if(I7) I7.textContent = q('#chq_no')?.value || '';
  const I8 = q('#I8'); {
    const chqDateVal = q('#chq_date')?.value;
     if(I8) I8.textContent = chqDateVal ? formatDate(chqDateVal) : '';
  }
  const I9 = q('#I9'); if(I9) I9.textContent = q('#bank')?.value || '';
}

// Attempt to scan a sheet (array of rows) and fill form fields using common labels
function scanAndFill(rows){
  // Improved row-based mapping: first column is label, pick first numeric/value cell in the row
  const labelMap = {};
  rows.forEach((r,ri)=>{
    if(!r || r.length===0) return;
    const label = String(r[0]||'').trim();
    if(!label) return;
    // prefer E (index 4) for amount-like rows (RATE row often has amount in col E)
    let value = null;
    if(r[4] !== undefined && String(r[4]).trim() !== '') value = r[4];
    else {
      // otherwise pick first cell after column A that looks like a number or non-empty
      for(let c=1;c<r.length;c++){
        if(r[c] !== undefined && String(r[c]).trim() !== ''){ value = r[c]; break; }
      }
    }
    labelMap[label.toUpperCase()] = value;
  });

  function getLabel(...keys){
    for(const k of keys){
      const v = labelMap[k.toUpperCase()];
      if(typeof v !== 'undefined' && v !== null && String(v).trim() !== '') return v;
    }
    return null;
  }

  const miller = getLabel('MILLER NAME'); if(miller) q('#miller_name').value = miller;
  const party = getLabel('PARTY NAME'); if(party) q('#party_name').value = party;
  const bill = getLabel('BILL NO'); if(bill) q('#bill_no').value = bill;
  const arrival = getLabel('ARRIVAL DT'); if(arrival) q('#arrival_dt').value = new Date(arrival).toISOString().slice(0,10);

  // RATE row: prefer the computed amount in column E
  const rateAmount = getLabel('RATE');
  if(rateAmount) {
    // if the sheet had a RATE cached value, set first row qty/rate if possible
    const first = q('#itemsTable .itemRow');
    if(first){
      // assume rateAmount is the total; leave it unless user sets qty/rate
    }
  }
  const lorry = getLabel('LORRY HIRE','LORRY');
  if(lorry){
    // main #lorry input was removed; prefer setting #lorry if present, otherwise set #lorry_small
    const node = q('#lorry');
    if(node) node.value = lorry;
    else if(q('#lorry_small')) q('#lorry_small').value = lorry;
  }
  const discount = getLabel('DISCOUNT'); if(discount) q('#discount').value = discount;
  const seller = getLabel('SELLER COM'); if(seller) q('#seller_commission').value = seller;
  const qd = getLabel('Q-DIFF'); if(qd) q('#qdiff').value = qd;
  const chq = getLabel('CHQ AM'); if(chq) q('#chq_amount').value = chq;
  const chqno = getLabel('CHQ NO'); if(chqno) q('#chq_no').value = chqno;
  const chqdt = getLabel('CHQ DT'); if(chqdt) q('#chq_date').value = new Date(chqdt).toISOString().slice(0,10);
  const bank = getLabel('BANK'); if(bank) q('#bank').value = bank;

  // reflect these into preview placeholders
  if(miller) q('#out_miller').textContent = miller;
  if(party) q('#out_party').textContent = party;
  if(bill) q('#out_bill').textContent = bill;
  if(arrival) q('#out_arrival').textContent = formatDate(arrival);
}

function wire(){
  // input listeners
  // removed dynamic adjustments; addRow no longer used

  q('#itemsTable')?.addEventListener('click', e=>{
    if(e.target.classList.contains('del')){
      const tr = e.target.closest('tr'); tr.remove(); recalcAll();
    }
  });

  function attachRowListeners(tr){
    qAll('.qtyInput, .rateInput, .desc', tr).forEach(inp=> inp.addEventListener('input', recalcAll));
  }

  qAll('#itemsTable .itemRow').forEach(attachRowListeners);
  q('#lorry')?.addEventListener('input', recalcAll);
  q('#discount')?.addEventListener('input', recalcAll);
  q('#seller_commission')?.addEventListener('input', recalcAll);
  q('#qdiff')?.addEventListener('input', recalcAll);
  q('#rate_qty')?.addEventListener('input', recalcAll);
  q('#rate_rate')?.addEventListener('input', recalcAll);
  // removed #company and #date listeners (not used in Excel format)
  q('#remarks')?.addEventListener('input', ()=> {
    const el = q('#out_remarks'); if(el) el.textContent = q('#remarks').value;
    // also update merged D10 preview immediately
    const d10 = q('#D10_value'); if(d10) d10.textContent = q('#remarks').value.trim();
  });
  q('#miller_name')?.addEventListener('input', ()=> {
    const el = q('#out_miller'); if(el) el.textContent = q('#miller_name').value;
  });
  // also update the sheet cell B1 immediately when miller name is edited
  q('#miller_name')?.addEventListener('input', ()=>{
    const v = q('#miller_name').value || '';
    if(q('#B1_value')){
      q('#B1_value').textContent = v;
      // flash to show update
      q('#B1_value').classList.remove('flash');
      // force reflow
      void q('#B1_value').offsetWidth;
      q('#B1_value').classList.add('flash');
    }
    // also set cell text directly as a stronger fallback
    if(q('#B1')) q('#B1').textContent = v;
    console.log('miller_name input ->', v);
    recalcAll();
  });
  q('#party_name')?.addEventListener('input', ()=> { const el = q('#out_party'); if(el) el.textContent = q('#party_name').value; });
  // also update sheet cell B2 live from PARTY NAME input
  q('#party_name')?.addEventListener('input', ()=>{
    const v = q('#party_name').value || '';
    const b2 = q('#B2'); if(b2) b2.textContent = v;
    try{ recalcAll(); }catch(e){}
  });
  q('#bill_no')?.addEventListener('input', ()=> { const el = q('#out_bill'); if(el) el.textContent = q('#bill_no').value; });
  q('#arrival_dt')?.addEventListener('input', ()=> { const el = q('#out_arrival'); if(el) el.textContent = q('#arrival_dt').value ? formatDate(q('#arrival_dt').value) : ''; });

  // also update sheet cell B4 live from ARRIVAL DT input and trigger recalc
  q('#arrival_dt')?.addEventListener('input', ()=>{
    const v = q('#arrival_dt').value || '';
  const b4 = q('#B4'); if(b4) b4.textContent = v ? formatDate(v) : '';
    try{ recalcAll(); }catch(e){}
  });

  // format amount inputs on blur, parse on focus
  function wireFormatting(sel){
    qAll(sel).forEach(inp=>{
      inp.addEventListener('focus', e=>{ e.target.value = (parseInput(e.target.value)||0); });
      inp.addEventListener('blur', e=>{ e.target.value = formatNumber(parseInput(e.target.value)); recalcAll(); });
    });
  }
  // apply formatting to all relevant inputs
  wireFormatting('.qtyInput, .rateInput');
  wireFormatting('#rate_qty, #rate_rate');
  wireFormatting('#lorry, #discount, #chq_amount');

  // also format seller commission and qdiff
  wireFormatting('#seller_commission, #qdiff');

  // cheque inputs wiring
  q('#chq_amount')?.addEventListener('input', ()=>{ const el = q('#out_chq_amount'); if(el) el.textContent = 'CHQ AM: ' + formatNumber(parseInput(q('#chq_amount').value)); recalcAll(); });
  // CHQ NO is free-form string (may contain letters, leading zeros). Update preview cell I7 live.
  q('#chq_no')?.addEventListener('input', ()=>{
    const val = q('#chq_no').value || '';
    const out = q('#out_chq_no'); if(out) out.textContent = 'CHQ NO: ' + val;
    const previewI7 = q('#I7'); if(previewI7) previewI7.textContent = val;
    try{ recalcAll(); }catch(e){}
  });
  q('#chq_date')?.addEventListener('input', ()=>{ const el = q('#out_chq_date'); if(el) el.textContent = 'CHQ DT: ' + formatDate(q('#chq_date').value); try{ recalcAll(); }catch(e){} });
  q('#bank')?.addEventListener('input', ()=>{ const el = q('#out_bank'); if(el) el.textContent = 'BANK: ' + q('#bank').value; try{ recalcAll(); }catch(e){} });

  // Import removed per user request — Excel is only reference

  // export
  q('#exportBtn')?.addEventListener('click', async ()=>{
    const node = q('#note');
    // ensure latest DOM is applied
    try{ recalcAll(); }catch(e){}
    // give browser a short moment to paint
    await new Promise(res=> setTimeout(res, 120));
      if(window.html2canvas){
        // Request a canvas scaled for devicePixelRatio so exported PNG has crisp lines
        const canvas = await html2canvas(node, {backgroundColor:'#fff', scale: window.devicePixelRatio || 1});
        canvas.toBlob(blob=>{
          const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'patti-note.png'; a.click(); URL.revokeObjectURL(url);
        });
      }else{
        // fallback: render a higher-resolution blob
        const blob = await domtoBlob(node, 2);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'patti-note.png'; a.click();
        URL.revokeObjectURL(url);
      }
  });

  q('#copyBtn')?.addEventListener('click', async ()=>{
    const node = q('#note');
    const copyBtn = q('#copyBtn');
    
    // Update button state
    if(copyBtn) {
      copyBtn.textContent = 'Copying...';
      copyBtn.disabled = true;
    }
    
    try{
      // Ensure latest calculations are applied
      try{ recalcAll(); }catch(e){}
      
      // Give browser time to render updates
      await new Promise(res=> setTimeout(res, 150));
      
      // Check clipboard support
      const isSecure = window.isSecureContext === true;
      const hasClipboard = !!(navigator.clipboard);
      const hasClipboardItem = !!(window.ClipboardItem);
      
      console.log('Clipboard check:', {isSecure, hasClipboard, hasClipboardItem});
      
      if(!isSecure || !hasClipboard || !hasClipboardItem){
        console.warn('Clipboard not fully supported, using fallback');
        await downloadFallback();
        return;
      }

      // Try to copy to clipboard (primary) and fall back to execCommand (secondary)
      try{
        let blob;
        try{
          blob = await generateImageBlob(node);
        }catch(genErr){
          console.warn('Image generation failed:', genErr);
          // show a more helpful message when cross-origin taint is detected
          const msg = (genErr && genErr.message) ? genErr.message.toLowerCase() : '';
          if(msg.includes('tainted') || msg.includes('security') || msg.includes('cross-origin')){
            const advice = 'Canvas was tainted by cross-origin resources. On deployed sites, ensure assets (images/fonts/CSS) are served with proper CORS headers or host them on the same origin. Also use HTTPS.';
            if(q('#clipboardText')) q('#clipboardText').textContent = 'Copy failed: ' + advice;
            alert('Copy failed due to cross-origin/taint issues. See console and UI for guidance.');
          }else{
            if(q('#clipboardText')) q('#clipboardText').textContent = 'Copy failed: ' + (genErr && genErr.message ? genErr.message : String(genErr));
          }
          await downloadFallback();
          return;
        }

        if(!blob){
          throw new Error('generateImageBlob returned no blob');
        }

        console.log('Generated blob, size:', blob.size);

        // Primary: modern clipboard API
        try{
          await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
          console.log('Successfully copied to clipboard (ClipboardItem)');
          alert('✅ Image copied to clipboard! You can now paste it.');
        }catch(primaryErr){
          console.warn('Primary clipboard write failed:', primaryErr);
          // Secondary: execCommand fallback (works in some browsers)
          const execOk = await tryExecCommandCopy(blob);
          if(execOk){
            console.log('Copied via execCommand fallback');
            alert('✅ Image copied to clipboard via fallback!');
          }else{
            console.warn('execCommand fallback failed');
            alert('⚠️ Clipboard copy failed. Opening as download instead.');
            await downloadFallback();
          }
        }

      }catch(clipErr){
        console.warn('Clipboard copy failed (overall):', clipErr);
        if(q('#clipboardText')) q('#clipboardText').textContent = 'Copy error: ' + (clipErr && clipErr.message ? clipErr.message : String(clipErr));
        alert('⚠️ Clipboard copy failed. Opening as download instead.');
        await downloadFallback();
      }
      
    }catch(err){
      console.error('Unexpected error during copy operation:', err);
      alert('❌ Copy failed. Please try the Export PNG button instead.');
    }finally{
      // Reset button state
      if(copyBtn) {
        copyBtn.textContent = 'Copy Image';
        copyBtn.disabled = false;
      }
    }
    
    async function downloadFallback(){
      try{
        let blob;
        if(window.html2canvas){
          const canvas = await html2canvas(node, {
            backgroundColor: '#fff', 
            scale: window.devicePixelRatio || 1,
            useCORS: true,
            allowTaint: false
          });
          blob = await new Promise(res=> canvas.toBlob(res, 'image/png'));
        }else{
          blob = await domtoBlob(node, 2);
        }
        
        const url = URL.createObjectURL(blob);

        // Detect Safari (desktop and iOS) to provide a better manual-copy UX.
  const ua = navigator.userAgent || '';
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Android/.test(ua);
  const isiOS = /iP(ad|hone|od)/.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edge|OPR|Brave|Chromium/.test(ua);

  if(isSafari || isiOS){
          // Open a simple page with the image and instructions so user can long-press (iOS)
          // or right-click/save (desktop Safari) to copy/save the image.
          const html = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
            <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0;padding:12px;font-family:system-ui,Segoe UI,Arial;background:#fff;color:#111}img{max-width:100%;height:auto;border:1px solid #ddd;box-shadow:0 4px 18px rgba(0,0,0,0.08)}.hint{margin-top:14px;padding:10px 14px;border-radius:8px;background:#f3f4f6;color:#111;max-width:680px;text-align:center}</style>
            <img src="${url}" alt="Patti Note"><div class="hint">${isiOS? 'Long-press the image and choose "Copy" or "Save Image" to save/copy it to your device.' : 'Right-click the image and choose "Copy Image" or "Save Image As...". On macOS, you can also drag it into other apps.'}</div>`;
          const w = window.open('', '_blank');
          if(w){
            w.document.write(html);
            w.document.title = 'Patti Note — tap/long-press to copy or save';
            w.document.close();
          }else{
            // popup blocked — fallback to download
            const a = document.createElement('a'); a.href = url; a.download = 'patti-note.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
          }
          alert('Opened image in a new tab/window. Use the browser menu (long-press or right-click) to copy/save the image.');
          // Do not revoke immediately to allow the new window to load the blob
          setTimeout(()=> URL.revokeObjectURL(url), 30000);
        }else if(isChrome){
          // Chrome: open the image in a new tab and provide quick-copy instructions
          const html = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
            <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0;padding:12px;font-family:system-ui,Segoe UI,Arial;background:#fff;color:#111}img{max-width:100%;height:auto;border:1px solid #ddd;box-shadow:0 4px 18px rgba(0,0,0,0.08)}.hint{margin-top:14px;padding:10px 14px;border-radius:8px;background:#f3f4f6;color:#111;max-width:680px;text-align:center}</style>
            <img src="${url}" alt="Patti Note"><div class="hint">Right-click the image and choose "Copy image" or press ${navigator.platform && navigator.platform.indexOf('Mac')>-1 ? '⌘+C' : 'Ctrl+C'} to copy it. You can then paste it into chat or documents.</div>`;
          const w = window.open('', '_blank');
          if(w){
            w.document.write(html);
            w.document.title = 'Patti Note — right-click or press copy';
            w.document.close();
          }else{
            // popup blocked — fallback to download
            const a = document.createElement('a'); a.href = url; a.download = 'patti-note.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
          }
          alert('Opened image in a new tab/window. Right-click the image or press copy to place it on your clipboard.');
          setTimeout(()=> URL.revokeObjectURL(url), 30000);
        }else{
          // Non-Safari: trigger a download as before
          const a = document.createElement('a');
          a.href = url;
          a.download = 'patti-note.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          alert('📁 Image downloaded as fallback since clipboard copy is not available.');
        }
      }catch(e){
        console.error('Even fallback download failed:', e);
        alert('❌ Both clipboard and download failed. Please try refreshing the page.');
      }
    }

    // Try to copy image using document.execCommand('copy') by inserting an <img> into a temporary contenteditable
    async function tryExecCommandCopy(blob){
      try{
        const dataUrl = await blobToDataURL(blob);
        // create image element
        const img = new Image();
        img.src = dataUrl;
        // wait for load (some browsers need the image to be loaded to copy)
        await new Promise((res, rej)=>{
          img.onload = res; img.onerror = rej; setTimeout(res, 500);
        });

        // create a temporary contenteditable container off-screen
        const container = document.createElement('div');
        container.contentEditable = 'true';
        container.style.position = 'fixed';
        container.style.left = '-99999px';
        container.style.top = '-99999px';
        container.style.opacity = '0';
        container.appendChild(img);
        document.body.appendChild(container);

        // select the image node
        const range = document.createRange();
        range.selectNodeContents(img);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        // execute copy
        const ok = document.execCommand('copy');

        // cleanup
        sel.removeAllRanges();
        document.body.removeChild(container);

        return !!ok;
      }catch(err){
        console.warn('execCommand copy error:', err);
        try{ /* best-effort cleanup */ }catch(e){}
        return false;
      }
    }

    function blobToDataURL(blob){
      return new Promise((res, rej)=>{
        const fr = new FileReader();
        fr.onload = ()=> res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(blob);
      });
    }
  });

  // capture initial values for all form controls so Reset restores them instead of reloading the page
  const formControls = Array.from(document.querySelectorAll('input, textarea, select'));
  const initialValues = {};
  formControls.forEach(el=> initialValues[el.id || el.name || el.dataset.key || ('el_' + Math.random().toString(36).slice(2))] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value);

  q('#resetBtn')?.addEventListener('click', ()=>{
    // restore captured values
    formControls.forEach(el=>{
      const key = el.id || el.name || el.dataset.key;
      if(!key) return;
      const val = initialValues[key];
      if(typeof val === 'undefined') return;
      if(el.type === 'checkbox' || el.type === 'radio') el.checked = val;
      else el.value = val;
      // trigger input/blur handlers where appropriate
      try{ el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }catch(e){}
    });
    // ensure UI reflects restored values
    try{ recalcAll(); }catch(e){}
  });

  // expose a small diagnostic widget to check clipboard capabilities
  async function updateClipboardStatus(){
    const el = q('#clipboardText');
    const dot = q('#clipboardDots');
    
    try{
      const isSecure = window.isSecureContext === true;
      const hasClip = !!(navigator.clipboard);
      const hasClipboardItem = !!window.ClipboardItem;
      const hasHtml2Canvas = !!window.html2canvas;
      
      let perm = 'unknown';
      try{ 
        if(navigator.permissions && navigator.permissions.query){ 
          const p = await navigator.permissions.query({name:'clipboard-write'}); 
          perm = p.state; 
        } 
      }catch(e){
        perm = 'unavailable';
      }
      
      const parts = [];
      parts.push(isSecure ? '🔒 secure' : '⚠️ insecure');
      parts.push(hasClip ? '📋 clipboard API' : '❌ no clipboard API');
      parts.push(hasClipboardItem ? '🖼️ ClipboardItem' : '❌ no ClipboardItem');
      // indicate if Chrome has advanced clipboardWrite support
      const isChrome = /Chrome/.test(navigator.userAgent || '') && !/Edge|OPR|Brave|Chromium/.test(navigator.userAgent || '');
      if(isChrome && hasClipboard){
        parts.push('⚙️ Chrome: may require permission prompt');
      }
      parts.push(hasHtml2Canvas ? '🎨 html2canvas' : '⚠️ no html2canvas');
      if(perm !== 'unknown') parts.push(`📝 perm:${perm}`);
      
      const txt = parts.join(' | ');
      if(el) el.textContent = txt;
      
  const isReady = hasClipboardItem && isSecure && hasClip;
      if(dot) {
        dot.textContent = isReady ? '✅' : '❌';
        dot.style.color = isReady ? '#1b7a1b' : '#b22222';
      }
      
      console.log('Clipboard status:', {isSecure, hasClip, hasClipboardItem, hasHtml2Canvas, perm});
      
    }catch(err){
      console.error('Error checking clipboard status:', err);
      if(el) el.textContent = 'Error checking clipboard status';
      if(dot) {
        dot.textContent = '❌';
        dot.style.color = '#b22222';
      }
    }
  }
  q('#clipboardCheck')?.addEventListener('click', updateClipboardStatus);
  // run once at startup
  updateClipboardStatus().catch(()=>{});
  // add a diagnostic copy test when the same button is clicked while holding Alt (or long-press)
  q('#clipboardCheck')?.addEventListener('dblclick', async ()=>{
    // dblclick will attempt an actual copy diagnostic so user can test without Export
    await runCopyDiagnostic();
  });

  // Also expose a programmatic diagnostic function
  async function runCopyDiagnostic(){
    const txt = q('#clipboardText');
    const dot = q('#clipboardDots');
    if(txt) txt.textContent = 'Running copy diagnostic...';
    if(dot) { dot.textContent = '…'; dot.style.color = '#666'; }
    try{
      const node = q('#note');
      // generate blob
      let blob;
      if(window.html2canvas){
        const canvas = await html2canvas(node, {backgroundColor:'#fff', scale: window.devicePixelRatio || 1});
        blob = await new Promise(res=> canvas.toBlob(res,'image/png'));
      }else{
        blob = await domtoBlob(node, 2);
      }
      if(!blob) throw new Error('Failed to create image blob');

      // try ClipboardItem
      if(navigator.clipboard && window.ClipboardItem){
        try{
          await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
          if(txt) txt.textContent = 'Diagnostic: copied via ClipboardItem';
          if(dot) { dot.textContent = '✅'; dot.style.color = '#1b7a1b'; }
          return {ok:true, method:'ClipboardItem'};
        }catch(e){
          console.warn('Diagnostic primary copy failed', e);
          // try execCommand fallback
          const ok = await tryExecCommandCopy(blob);
          if(ok){
            if(txt) txt.textContent = 'Diagnostic: copied via execCommand fallback';
            if(dot) { dot.textContent = '✅'; dot.style.color = '#1b7a1b'; }
            return {ok:true, method:'execCommand'};
          }
          // final fallback: download
          if(txt) txt.textContent = 'Diagnostic: copy failed, opened download fallback';
          if(dot) { dot.textContent = '❌'; dot.style.color = '#b22222'; }
          await (async ()=>{ const url = URL.createObjectURL(blob); window.open(url,'_blank'); const a = document.createElement('a'); a.href = url; a.download='patti-note.png'; a.click(); URL.revokeObjectURL(url); })();
          return {ok:false, method:'download'};
        }
      }else{
        // no ClipboardItem support, try execCommand directly
        const ok = await tryExecCommandCopy(blob);
        if(ok){
          if(txt) txt.textContent = 'Diagnostic: copied via execCommand fallback';
          if(dot) { dot.textContent = '✅'; dot.style.color = '#1b7a1b'; }
          return {ok:true, method:'execCommand'};
        }
        if(txt) txt.textContent = 'Diagnostic: copy not supported, opened download fallback';
        if(dot) { dot.textContent = '❌'; dot.style.color = '#b22222'; }
        const url = URL.createObjectURL(blob); window.open(url,'_blank'); const a = document.createElement('a'); a.href = url; a.download='patti-note.png'; a.click(); URL.revokeObjectURL(url);
        return {ok:false, method:'download'};
      }
    }catch(err){
      console.error('Copy diagnostic failed', err);
      if(q('#clipboardText')) q('#clipboardText').textContent = 'Diagnostic error: ' + (err && err.message ? err.message : String(err));
      if(q('#clipboardDots')) { q('#clipboardDots').textContent = '❌'; q('#clipboardDots').style.color = '#b22222'; }
      return {ok:false, error: err};
    }
  }
}

function removeDebugNodes(){
  // remove any elements that still contain the debug label text
  Array.from(document.querySelectorAll('*')).forEach(el=>{
    try{
      if(el.textContent && el.textContent.includes('DEBUG - Miller')) el.remove();
    }catch(e){}
  });
}

// small dom-to-blob using html2canvas-like approach but lightweight using foreignObject
async function domtoBlob(node, scaleMultiplier=1){
  // clone the node and replace form inputs with their current text values so serialization captures them
  const clone = node.cloneNode(true);
  // replace inputs, textareas and spans that may contain live values
  clone.querySelectorAll('input, textarea').forEach(inp=>{
    const val = inp.value || '';
    const txt = document.createTextNode(val);
    inp.parentNode.replaceChild(txt, inp);
  });
  // ensure any dedicated value spans are present as text
  clone.querySelectorAll('span').forEach(sp=>{
    // leave structural spans but ensure their textContent is preserved (they are preserved by clone)
  });

  const {width, height} = node.getBoundingClientRect();
  // collect inline CSS from document.styleSheets where same-origin
  let cssText = '';
  for(const sheet of Array.from(document.styleSheets)){
    try{
      const rules = sheet.cssRules || sheet.rules;
      for(const r of Array.from(rules)) cssText += r.cssText + '\n';
    }catch(e){
      // likely cross-origin stylesheet — skip it
    }
  }

  // Render SVG at devicePixelRatio to produce a higher-resolution raster with crisper lines.
  // allow caller to request extra scaling for higher-resolution exports
  const dpr = (window.devicePixelRatio || 1) * (scaleMultiplier || 1);
  const sw = Math.ceil(width * dpr);
  const sh = Math.ceil(height * dpr);
  // use viewBox to preserve CSS layout while scaling the output
  const svg = `<?xml version="1.0" encoding="utf-8"?>
  <svg xmlns='http://www.w3.org/2000/svg' width='${sw}' height='${sh}' viewBox='0 0 ${Math.ceil(width)} ${Math.ceil(height)}' preserveAspectRatio='xMinYMin meet'>
    <style>
      svg{shape-rendering:crispEdges;stroke-linecap:square;-webkit-font-smoothing:antialiased;}
      ${cssText}
    </style>
    <foreignObject width='100%' height='100%'>
      ${new XMLSerializer().serializeToString(clone)}
    </foreignObject>
  </svg>`;
  const svg64 = new Blob([svg], {type:'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(svg64);
  const img = new Image();
  img.width = sw; img.height = sh;
  img.src = url;
  await new Promise((res, rej)=>{ img.onload = res; img.onerror = rej; });
  const canvas = document.createElement('canvas'); canvas.width = sw; canvas.height = sh;
  const ctx = canvas.getContext('2d');
  // draw a white background and disable smoothing for crisp grid lines
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  if('imageSmoothingEnabled' in ctx) ctx.imageSmoothingEnabled = false;
  if('imageSmoothingEnabled' in ctx) ctx.imageSmoothingEnabled = false;
  if('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, sw, sh);
  URL.revokeObjectURL(url);
  return await new Promise(res=> canvas.toBlob(res,'image/png'));
}

// initial
// debug: log presence of key elements to help diagnose visibility issues
console.log('startup: miller_name=', !!q('#miller_name'), 'B1_value=', !!q('#B1_value'), 'note=', !!q('#note'), 'exportBtn=', !!q('#exportBtn'));
wire(); recalcAll();


