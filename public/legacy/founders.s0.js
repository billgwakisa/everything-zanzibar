
(function(){
  "use strict";
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('year').textContent = new Date().getFullYear();

  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function(){ nav.classList.toggle('scrolled', window.scrollY > 40); }, {passive:true});

  document.getElementById('burger').addEventListener('click', function(){ document.body.classList.toggle('menu-open'); });
  document.querySelectorAll('#navLinks a').forEach(function(a){ a.addEventListener('click', function(){ document.body.classList.remove('menu-open'); }); });

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.14});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  var fine = window.matchMedia('(pointer:fine)').matches;
  if(fine && !reduce){
    document.body.classList.add('has-cursor');
    var dot = document.getElementById('cursorDot'), ring = document.getElementById('cursorRing');
    var mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
    window.addEventListener('mousemove', function(ev){ mx = ev.clientX; my = ev.clientY; dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)'; });
    (function loop(){ rx += (mx-rx)*0.16; ry += (my-ry)*0.16; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function(e){ if(e.target.closest('a,button,[data-cursor],.f-card')) ring.classList.add('grow'); });
    document.addEventListener('mouseout', function(e){ if(e.target.closest('a,button,[data-cursor],.f-card')) ring.classList.remove('grow'); });
  }
})();
