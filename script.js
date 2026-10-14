// Request-a-demo form.
// 1) If both WhatsApp number and email are given, the request is saved via LaunchRiot's existing lead endpoint
//    (https://launchriot.online/api/leads, the same one the live "setup brief" form uses; it requires email + phone + industry).
// 2) Otherwise, or if that endpoint is unavailable, it falls back to WhatsApp click-to-chat (number from the live site)
//    or a pre-filled email to hello@launchriot.online. No paid services.
(function(){
  var WA = "971586444285";
  var LEAD_API = "https://launchriot.online/api/leads";
  var MAIL = "hello@launchriot.online";
  var f = document.getElementById("demo-form"); if(!f) return;
  var err = document.getElementById("form-err"), btn = document.getElementById("submit-btn");
  var done = document.getElementById("form-done"), doneMsg = document.getElementById("done-msg"), acts = document.getElementById("done-actions");
  function v(n){ return (f.elements[n].value || "").trim(); }
  function message(d){
    var t = "Hi LaunchRiot, I’d like to request a demo.\n\nName: " + d.fullName + "\nBusiness: " + d.companyName + "\nIndustry: " + d.industry;
    if(d.phone) t += "\nWhatsApp: " + d.phone;
    if(d.email) t += "\nEmail: " + d.email;
    if(d.notes) t += "\n\n" + d.notes;
    return t;
  }
  function waLink(d){ return "https://wa.me/" + WA + "?text=" + encodeURIComponent(message(d)); }
  function mailLink(d){ return "mailto:" + MAIL + "?subject=" + encodeURIComponent("Demo request: " + d.companyName) + "&body=" + encodeURIComponent(message(d)); }
  function showDone(text, d, offer){
    f.querySelectorAll("label,.f2,.hint,#submit-btn").forEach(function(e){ e.style.display="none"; });
    doneMsg.textContent = text; acts.innerHTML = "";
    if(offer){
      var a = document.createElement("a"); a.className="btn btn-wa btn-sm"; a.href=waLink(d); a.target="_blank"; a.rel="noopener"; a.textContent="Send on WhatsApp"; acts.appendChild(a);
      var m = document.createElement("a"); m.className="btn btn-ghost btn-sm"; m.href=mailLink(d); m.textContent="Send by email"; acts.appendChild(m);
    }
    done.hidden = false;
  }
  f.addEventListener("submit", function(e){
    e.preventDefault(); err.textContent = "";
    if(v("website_hp")) return;
    var d = {fullName:v("fullName"), companyName:v("companyName"), industry:v("industry"), phone:v("phone"), email:v("email"), notes:v("notes")};
    if(!d.fullName) return err.textContent = "Add your name.";
    if(!d.companyName) return err.textContent = "Add your business name.";
    if(!d.industry) return err.textContent = "Add your industry.";
    if(!d.phone && !d.email) return err.textContent = "Add a WhatsApp number or an email so we can reply.";
    if(d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return err.textContent = "Enter a valid email address.";
    if(d.phone && d.phone.replace(/\D/g,"").length < 7) return err.textContent = "Enter a valid WhatsApp number, including country code.";

    if(d.phone && d.email){
      btn.disabled = true;
      var payload = {setupType:"both", fullName:d.fullName, companyName:d.companyName, email:d.email, phone:d.phone, industry:d.industry,
        systemsUsed:[], setupNeeds:[], currentAiTools:[], notes:"[Demo request via site v2] " + (d.notes || "")};
      fetch(LEAD_API, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)})
        .then(function(r){ if(!r.ok) throw new Error(r.status); showDone("We’ll review it and reply on WhatsApp or email.", d, false); })
        .catch(function(){ showDone("We couldn’t save it automatically. Send it to us in one tap:", d, true); })
        .finally(function(){ btn.disabled = false; });
    } else if(d.phone){
      window.open(waLink(d), "_blank", "noopener");
      showDone("WhatsApp should open with your request ready to send. If it didn’t, use a button below.", d, true);
    } else {
      window.location.href = mailLink(d);
      showDone("Your email app should open with your request ready to send. If it didn’t, use a button below.", d, true);
    }
  });
})();
