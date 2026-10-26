(function(){
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
