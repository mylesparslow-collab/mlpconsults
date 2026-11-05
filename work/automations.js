/* Customer-side messaging for the sample sites: text the business, and rate a visit. */
(function () {
  var NAMES = {
    bellwood: "Bellwood Family Dental", boutique: "Fig & Fennimore", cedarline: "Cedarline Kitchen",
    coffee: "Kestrel Hill Coffee Roasters", crestline: "Crestline Design-Build", halden: "Halden & Rye Bakery",
    hollis: "Hollis Flower House", "little-orbit": "Little Orbit Tea", pilates: "Springline Reformer Studio",
    quietwell: "Quietwell Aesthetics", salon: "Ostrander Hair Studio", solace: "Solace Studio Dental"
  };
  var slug = location.pathname.split("/").filter(Boolean).pop();
  var name = NAMES[slug]; if (!name) return;
  var SHORT = { boutique: "Fig & Fennimore", coffee: "Kestrel Hill", "little-orbit": "Little Orbit", halden: "Halden & Rye", hollis: "Hollis", salon: "Ostrander", pilates: "Springline", crestline: "Crestline", solace: "Solace", bellwood: "Bellwood", cedarline: "Cedarline", quietwell: "Quietwell" };
  var first = SHORT[slug] || name;

  function rgb(c) { var m = (c || "").match(/rgba?\(([^)]+)\)/); if (!m) return null; var p = m[1].split(",").map(parseFloat); return p[3] === 0 ? null : p; }
  function lum(p) { return (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]) / 255; }
  var bs = getComputedStyle(document.body);
  var bg = rgb(bs.backgroundColor) || [255, 255, 255];
  var ink = rgb(bs.color) || [20, 20, 20];
  var accent = null;
  var cands = document.querySelectorAll("a[class*=btn],button[class*=btn],.btn,.cta,button");
  for (var i = 0; i < cands.length && !accent; i++) { var c = rgb(getComputedStyle(cands[i]).backgroundColor); if (c && Math.abs(lum(c) - lum(bg)) > 0.25) accent = c; }
  accent = accent || ink;
  var on = lum(accent) > 0.6 ? "#111" : "#fff";
  var css = (c) => "rgb(" + c.slice(0, 3).join(",") + ")";
  var dark = lum(bg) < 0.4;
  var panel = dark ? "#1b1b1b" : "#fff", line = dark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.14)", fg = dark ? "#f2f2f2" : "#161616", mute = dark ? "#a8a8a8" : "#666";

  var st = document.createElement("style");
  st.textContent =
    ".ax-chip{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;gap:0;border-radius:999px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.22);font:600 14px/1 system-ui,-apple-system,Segoe UI,sans-serif}" +
    ".ax-chip button{border:0;cursor:pointer;padding:13px 16px;background:" + css(accent) + ";color:" + on + ";font:inherit}" +
    ".ax-chip button+button{border-left:1px solid rgba(127,127,127,.4)}" +
    ".ax-sheet{position:fixed;left:16px;bottom:72px;z-index:2147483001;width:min(360px,calc(100vw - 32px));max-height:min(520px,calc(100vh - 100px));display:none;flex-direction:column;background:" + panel + ";color:" + fg + ";border:1px solid " + line + ";border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.3);font:15px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;overflow:hidden}" +
    ".ax-sheet.open{display:flex}" +
    ".ax-h{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid " + line + "}" +
    ".ax-h b{font-size:15px}.ax-h span{display:block;font-size:12px;color:" + mute + ";font-weight:400}" +
    ".ax-x{background:none;border:0;color:" + mute + ";font-size:22px;cursor:pointer;line-height:1}" +
    ".ax-b{padding:14px 16px;overflow:auto;display:flex;flex-direction:column;gap:8px;flex:1}" +
    ".ax-m{max-width:86%;padding:9px 12px;border-radius:14px;font-size:14.5px}" +
    ".ax-m.me{align-self:flex-end;background:" + css(accent) + ";color:" + on + ";border-bottom-right-radius:4px}" +
    ".ax-m.biz{align-self:flex-start;background:" + (dark ? "#2a2a2a" : "#f0efec") + ";border-bottom-left-radius:4px}" +
    ".ax-m.t{font-size:12px;color:" + mute + ";background:none;padding:0 4px}" +
    ".ax-f{display:flex;gap:8px;padding:12px 16px;border-top:1px solid " + line + "}" +
    ".ax-f input,.ax-f textarea{flex:1;font:inherit;font-size:14.5px;padding:10px 12px;border:1px solid " + line + ";border-radius:10px;background:transparent;color:inherit;min-width:0}" +
    ".ax-f button,.ax-go{border:0;cursor:pointer;background:" + css(accent) + ";color:" + on + ";font:600 14px system-ui;padding:10px 14px;border-radius:10px}" +
    ".ax-stars{display:flex;gap:6px;justify-content:center;padding:6px 0}" +
    ".ax-stars button{background:none;border:0;font-size:34px;cursor:pointer;color:" + line + ";padding:0;line-height:1}" +
    ".ax-stars button.on{color:" + css(accent) + "}" +
    "@media(max-width:560px){.ax-chip{left:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px))}.ax-sheet{left:10px;bottom:calc(64px + env(safe-area-inset-bottom,0px))}}";
  document.head.appendChild(st);

  var sheet = document.createElement("div"); sheet.className = "ax-sheet"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", "Message " + name);
  var chip = document.createElement("div"); chip.className = "ax-chip";
  chip.innerHTML = '<button data-t="text">Text us</button><button data-t="rate">Rate your visit</button>';
  document.body.appendChild(sheet); document.body.appendChild(chip);

  function head(title, sub) { return '<div class="ax-h"><div><b>' + title + '</b><span>' + sub + '</span></div><button class="ax-x" aria-label="Close">×</button></div>'; }
  function open(tab) { sheet.classList.add("open"); (tab === "rate" ? rate : text)(); sheet.querySelector(".ax-x").onclick = close; }
  function close() { sheet.classList.remove("open"); }
  chip.onclick = function (e) { var t = e.target.getAttribute && e.target.getAttribute("data-t"); if (!t) return; if (sheet.classList.contains("open") && sheet.getAttribute("data-t") === t) return close(); sheet.setAttribute("data-t", t); open(t); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function text() {
    sheet.innerHTML = head("Text " + first, "We usually reply within a minute") +
      '<div class="ax-b" id="axb"><div class="ax-m biz">Hi, this is ' + esc(name) + '. How can we help?</div></div>' +
      '<form class="ax-f"><input id="axi" placeholder="Type a message" autocomplete="off" aria-label="Message"><button>Send</button></form>';
    var b = sheet.querySelector("#axb"), f = sheet.querySelector("form"), step = 0, asked = false;
    f.onsubmit = function (e) {
      e.preventDefault(); var i = sheet.querySelector("#axi"), v = i.value.trim(); if (!v) return; i.value = "";
      b.insertAdjacentHTML("beforeend", '<div class="ax-m me">' + esc(v) + "</div>"); b.scrollTop = 1e6; step++;
      var reply = step === 1
        ? "Thanks, got your message. Two quick questions so the right person can help: what day works best, and is this your first time with us? You can also reply with a phone number if you'd rather get a call."
        : step === 2 ? "Perfect, that's noted. A real person at " + name + " will confirm shortly. Nothing is booked until they do." : "Noted. We'll be in touch shortly.";
      setTimeout(function () { b.insertAdjacentHTML("beforeend", '<div class="ax-m biz">' + esc(reply) + '</div><div class="ax-m t">' + esc(first) + " · just now</div>"); b.scrollTop = 1e6; }, 700);
    };
    setTimeout(function () { var i = sheet.querySelector("#axi"); if (i && innerWidth > 700) i.focus(); }, 50);
  }
  function rate() {
    sheet.innerHTML = head("How was your visit?", esc(name)) + '<div class="ax-b" id="axb"><div class="ax-stars" role="group" aria-label="Rating">' +
      [1, 2, 3, 4, 5].map(function (n) { return '<button data-n="' + n + '" aria-label="' + n + ' star' + (n > 1 ? "s" : "") + '">★</button>'; }).join("") + '</div><div id="axr" class="ax-m biz" style="align-self:stretch;max-width:none">Tap a star. It takes ten seconds.</div></div>';
    var stars = sheet.querySelectorAll(".ax-stars button"), out = sheet.querySelector("#axr");
    stars.forEach(function (s) {
      s.onclick = function () {
        var n = +s.getAttribute("data-n"); stars.forEach(function (x) { x.classList.toggle("on", +x.getAttribute("data-n") <= n); });
        if (n >= 4) out.textContent = "Thank you, that means a lot to a small business. We'll text you a link tomorrow in case you'd like to share it on Google.";
        else {
          out.innerHTML = 'We\'re sorry we missed the mark. Tell us what happened and the owner will read it personally before anything else.<div class="ax-f" style="padding:10px 0 0;border:0"><textarea rows="2" aria-label="What happened" placeholder="What happened?"></textarea><button class="ax-go">Send</button></div>';
          out.querySelector(".ax-go").onclick = function () { out.textContent = "Thank you. This goes straight to the owner, who will reach out personally."; };
        }
      };
    });
  }
})();
