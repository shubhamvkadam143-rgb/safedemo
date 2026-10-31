const $ = (id) => document.getElementById(id);
const showStatus = (id, message, type = '') => { const el=$(id); el.className=`status ${type}`; el.textContent=message; };

$('sendOtp').addEventListener('click', async () => {
  const phone=$('otpPhone').value.trim();
  try {
    const r=await fetch('/api/demo/otp/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});
    const data=await r.json();
    if(!r.ok) throw new Error(data.message || 'Could not generate OTP');
    $('otpReveal').classList.remove('hidden');
    $('otpReveal').textContent=`DEMO OTP: ${data.demoOTP}`;
    showStatus('otpStatus','Demo OTP generated. No text message was sent.','success');
  } catch(e){showStatus('otpStatus',e.message,'error');}
});

$('verifyOtp').addEventListener('click', async () => {
  try {
    const r=await fetch('/api/demo/otp/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:$('otpPhone').value.trim(),otp:$('otpCode').value.trim()})});
    const data=await r.json();
    if(!r.ok) throw new Error(data.message || 'Verification failed');
    showStatus('otpStatus',data.message,'success');
  } catch(e){showStatus('otpStatus',e.message,'error');}
});

$('sos').addEventListener('click', () => {
  const contacts=$('contacts').value.split(/[\n,]+/).map(x=>x.trim()).filter(Boolean);
  if(!contacts.length){showStatus('sosStatus','Add at least one emergency contact.','error');return;}
  if(!confirm('Create a DEMO SOS alert? No real SMS will be sent.')) return;
  if(!navigator.geolocation){showStatus('sosStatus','This browser does not support location.','error');return;}
  $('locationState').textContent='Requesting your location permission…';
  navigator.geolocation.getCurrentPosition(async pos=>{
    const {latitude,longitude}=pos.coords;
    $('locationState').textContent=`Location captured: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    try{
      const r=await fetch('/api/demo/sos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contacts,latitude,longitude,note:$('note').value.trim()})});
      const data=await r.json();
      if(!r.ok) throw new Error(data.message || 'Could not create demo alert');
      showStatus('sosStatus',`${data.message} Created ${data.records.length} demo record(s).`,'success');
      loadHistory();
    }catch(e){showStatus('sosStatus',e.message,'error');}
  },err=>{ $('locationState').textContent='Location permission was not granted.'; showStatus('sosStatus','Location is required for this demo alert. Allow location access and try again.','error'); },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
});

async function loadHistory(){
  try{
    const r=await fetch('/api/demo/history'); const data=await r.json();
    if(!data.history.length){$('history').innerHTML='<p class="muted">No demo alerts created yet.</p>';return;}
    $('history').innerHTML=data.history.map(item=>`<div class="history-item"><strong>DEMO ONLY · NOT SENT</strong><div>To: ${escapeHtml(item.phone)} · ${new Date(item.createdAt).toLocaleString()}</div><p>${escapeHtml(item.message)}</p><a href="${item.mapLink}" target="_blank" rel="noopener">Open location map</a></div>`).join('');
  }catch{$('history').textContent='Could not load history.';}
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
$('refresh').addEventListener('click',loadHistory);
loadHistory();
