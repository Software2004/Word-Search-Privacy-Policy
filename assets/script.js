
(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Topbar show/hide */
  var topbar = document.getElementById('topbar');
  var hero = document.querySelector('.hero');
  var topbarObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      topbar.classList.toggle('is-visible', !entry.isIntersecting);
    });
  }, { rootMargin: '-10% 0px 0px 0px' });
  if (hero) topbarObserver.observe(hero);

  /* Keep the mobile waypoint pills below the fixed topbar instead of hidden behind it.
     The topbar is always full height in layout (it only translates off-screen), so the
     mobile nav's sticky offset must match it or the two sticky/fixed bars overlap. */
  function syncTopbarHeight(){
    if (topbar) document.documentElement.style.setProperty('--topbar-h', topbar.offsetHeight + 'px');
  }
  syncTopbarHeight();
  window.addEventListener('resize', syncTopbarHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncTopbarHeight);

  /* Section reveal */
  var sections = document.querySelectorAll('section[id]');
  var revealObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  sections.forEach(function(s){
    if (reduceMotion) { s.classList.add('is-visible'); }
    else { revealObserver.observe(s); }
  });

  /* Scrollspy: highlight active waypoint in both nav rails */
  var navItems = document.querySelectorAll('#routeNav li, #mobileRouteNav li');
  var mobileRouteNav = document.getElementById('mobileRouteNav');
  function centerActiveChip(link){
    /* Scroll only the chip strip's own horizontal scrollbar. `scrollIntoView()` used
       to be called on this link instead — its browser-native algorithm decides which
       ancestor scroll containers to move, and can end up nudging the page's vertical
       scroll too (the chip strip is `position:sticky` right under a fixed topbar, which
       makes its "visible" bounds ambiguous to that algorithm). That fought the page
       scroll during a continuous trackpad gesture and produced a freeze-then-jump feel.
       Scrolling this element's scrollLeft directly can never touch window scroll. */
    if (!mobileRouteNav || !link) return;
    var target = link.offsetLeft + link.offsetWidth / 2 - mobileRouteNav.clientWidth / 2;
    target = Math.max(0, Math.min(target, mobileRouteNav.scrollWidth - mobileRouteNav.clientWidth));
    mobileRouteNav.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function setActive(id){
    navItems.forEach(function(li){
      li.classList.toggle('active', li.getAttribute('data-target') === id);
    });
    var activeMobile = document.querySelector('#mobileRouteNav li.active a');
    if (activeMobile) centerActiveChip(activeMobile);
  }
  var spyObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
  sections.forEach(function(s){ spyObserver.observe(s); });
  
  // Set initial active state
  setActive('intro');

  /* Progress dot along the desktop route line */
  var progress = document.getElementById('routeProgress');
  var nav = document.getElementById('routeNav');
  function updateProgress(){
    if (!progress || !nav || window.innerWidth <= 880) return;
    var main = document.getElementById('main');
    var rect = main.getBoundingClientRect();
    var total = main.offsetHeight - window.innerHeight * 0.5;
    var scrolled = -rect.top;
    var fraction = Math.min(1, Math.max(0, scrolled / total));
    var navHeight = nav.offsetHeight;
    progress.style.height = (fraction * navHeight) + 'px';
  }
  var ticking = false;
  window.addEventListener('scroll', function(){
    if (!ticking){
      window.requestAnimationFrame(function(){ updateProgress(); ticking = false; });
      ticking = true;
    }
  });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* Smooth-scroll only for waypoint/anchor link clicks, not for ordinary wheel or
     trackpad scrolling. `scroll-behavior:smooth` used to be set sitewide on <html>,
     which made every native scroll tick start its own smooth animation — rapid wheel
     input then fights those overlapping animations and scrolling visibly stalls/sticks.
     Toggling it on only for the duration of a link-triggered jump keeps that animation
     for navigation while leaving normal scrolling instant and responsive. */
  if (!reduceMotion){
    var root = document.documentElement;
    document.querySelectorAll('a[href^="#"]').forEach(function(link){
      link.addEventListener('click', function(){
        root.style.scrollBehavior = 'smooth';
        var reset = function(){ root.style.scrollBehavior = ''; };
        if ('onscrollend' in window){
          window.addEventListener('scrollend', reset, { once: true });
        } else {
          setTimeout(reset, 700);
        }
      });
    });
  }
})();