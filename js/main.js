(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Barre de navigation et progression de lecture
  var nav=document.getElementById('nav'),bar=document.getElementById('progress');
  var steps=document.getElementById('steps');
  function onScroll(){
    var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
    nav.classList.toggle('scrolled',y>20);
    bar.style.transform='scaleX('+(h>0?y/h:0)+')';
    if(steps){
      var r=steps.getBoundingClientRect(),mid=innerHeight*.6;
      var p=Math.min(1,Math.max(0,(mid-r.top)/r.height));
      steps.style.setProperty('--p',p);
      steps.querySelectorAll('li').forEach(function(li){li.classList.toggle('on',li.getBoundingClientRect().top<mid)});
    }
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Apparition au défilement, en cascade dans un même groupe
  var items=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    items.forEach(function(el){
      var sib=[].filter.call(el.parentElement.children,function(c){return c.classList.contains('reveal')});
      el.style.setProperty('--d',(sib.indexOf(el)*0.08)+'s');
      io.observe(el);
    });
  }else{items.forEach(function(el){el.classList.add('in')})}

  // Démo d'IA dans l'accueil
  var demos=[
    {role:'Service à la clientèle',gain:'25 min',
     q:"Voici le courriel d'un client mécontent. Aide-moi à lui répondre poliment et à lui offrir un rabais de 10 %.",
     a:"Bonjour M. Tremblay, merci de nous avoir écrit. Nous sommes désolés du retard de votre commande. Pour nous excuser, nous vous offrons 10 % sur votre prochain achat…"},
    {role:'Administration',gain:'20 min',
     q:"Transforme mes notes de réunion en compte rendu clair, avec les décisions et qui fait quoi.",
     a:"Compte rendu du 14 novembre. Décisions : 1) nouvel horaire d'été dès juin. 2) achat de deux portables. Suivis : Julie appelle le fournisseur, Marc prépare le budget…"},
    {role:'Comptabilité',gain:'15 min',
     q:"Dans Excel, comment additionner la colonne C seulement quand la colonne B dit « Payé »?",
     a:"Utilisez cette formule : =SOMME.SI(B:B;\"Payé\";C:C). Elle additionne les montants de la colonne C pour chaque ligne où la colonne B contient « Payé »."}
  ];
  var demo=document.getElementById('demo');
  if(demo){
    var qEl=document.getElementById('demoPrompt'),aBox=document.getElementById('demoAi'),aEl=document.getElementById('demoAnswer');
    var roleEl=document.getElementById('demoRole'),gainEl=document.getElementById('demoGain');
    var i=0,timer;
    function show(d){roleEl.textContent=d.role;gainEl.textContent=d.gain}
    function wait(ms,fn){timer=setTimeout(fn,ms)}
    function play(){
      var d=demos[i];show(d);
      demo.classList.remove('typed');qEl.textContent='';aEl.textContent='';aBox.hidden=true;
      var k=0;
      (function typeQ(){
        if(k<=d.q.length){qEl.textContent=d.q.slice(0,k);k+=2;return wait(22,typeQ)}
        demo.classList.add('typed');
        wait(500,function(){
          aBox.hidden=false;var words=d.a.split(' '),w=0;
          (function typeA(){
            if(w<=words.length){aEl.textContent=words.slice(0,w).join(' ');w++;return wait(55,typeA)}
            wait(3800,function(){i=(i+1)%demos.length;play()});
          })();
        });
      })();
    }
    if(reduce){var d=demos[0];show(d);qEl.textContent=d.q;aEl.textContent=d.a;aBox.hidden=false;demo.classList.add('typed')}
    else{
      // Ne pas animer quand l'accueil n'est pas visible
      var running=false;
      new IntersectionObserver(function(es){
        var vis=es[0].isIntersecting;
        if(vis&&!running){running=true;play()}
        else if(!vis&&running){running=false;clearTimeout(timer)}
      }).observe(demo);
    }
  }

  // Avant / après
  var cmp=[
    {t:"Rédiger le compte rendu de la réunion d'équipe à partir de notes en vrac.",b:30,a:5},
    {t:"Répondre à un client mécontent avec tact, sans y passer la matinée.",b:30,a:5},
    {t:"Trouver la bonne formule Excel pour un rapport mensuel.",b:20,a:3}
  ];
  var tabs=document.querySelectorAll('#compare [role=tab]');
  tabs.forEach(function(t){t.addEventListener('click',function(){
    tabs.forEach(function(x){x.setAttribute('aria-selected',x===t)});
    var c=cmp[+t.dataset.i];
    document.getElementById('cmpTask').textContent=c.t;
    document.getElementById('cmpBefore').textContent=c.b+' min';
    document.getElementById('cmpAfter').textContent=c.a+' min';
    document.getElementById('barAfter').style.setProperty('--w',Math.round(c.a/c.b*100)+'%');
  })});

  // Calculateur de subvention
  var n=document.getElementById('n'),nOut=document.getElementById('nOut');
  var price=2000,aid=0.5;
  function fmt(v){return Math.round(v).toLocaleString('fr-CA').replace(/ | /g,' ')+' $'}
  function calc(){
    nOut.textContent=n.value;
    var net=price*(1-aid);
    document.getElementById('net').textContent=fmt(net);
    document.getElementById('per').textContent=fmt(net/+n.value);
  }
  function seg(id,cb){
    var box=document.getElementById(id);
    box.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;
      box.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
      cb(b);calc();
    });
  }
  seg('fmt',function(b){price=+b.dataset.p});
  seg('aid',function(b){aid=+b.dataset.a});
  n.addEventListener('input',calc);
  calc();

  document.getElementById('f').addEventListener('submit',function(e){e.preventDefault();document.getElementById('sent').hidden=false});
})();
