/* MLP Consulting v3 inner pages: the scene rests in one formation behind the page. */
(function () {
  'use strict';
  var root = document.documentElement;
  var noGl = function () { root.classList.add('no-gl'); window.__scene = null; };
  var canvas = document.getElementById('scene');
  if (/[?&]scene=off\b/.test(location.search) || !canvas) { noGl(); return; }
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  (async function () {
    var scene = null;
    try {
      var mod = await import('/v3/assets/scene.js');
      var sites = JSON.parse(document.getElementById('sites-data').textContent);
      var slips = ['A call at 5:40 rings out', 'A quote goes out', 'Nobody checks back', 'An invoice passes its due date', 'A job or visit is finished', 'A call goes unanswered', 'Monday morning', 'Requests for the back room', 'A missed appointment', 'No-shows', 'New inquiry', 'Quote follow-up, day 2', 'Payment reminder', 'Review request', 'Missed-call text back', 'Weekly owner summary'];
      scene = await mod.createScene(canvas, { sites: sites, slips: slips, reducedMotion: reduced });
      if (scene) {
        scene.setFormation(parseInt(document.body.getAttribute('data-formation'), 10) || 0);
        window.__scene = scene;
        window.addEventListener('resize', function () { try { scene.resize(); } catch (e) {} });
        scene.resize();
      }
    } catch (e) { scene = null; }
    if (!scene) noGl();
  })();
})();
