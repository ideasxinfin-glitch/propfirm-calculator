const assert=require('node:assert/strict'),{defaults,simulate,validate}=require('./engine.js');let n=0;function test(name,f){f();console.log('PASS '+name);n++;}
const b={...defaults,runs:500};
test('semilla reproducible',()=>assert.deepEqual(simulate(b),simulate(b)));
test('retiros descuentan saldo, aplican reparto y costes exactos',()=>{const r=simulate({...b,runs:10,days:1,minDays:1,target:10,dd:100,plan:[{goal:10,risk:10}],dailyChance:100,fundedDays:4,every:1,buffer:10,amount:10,split:80,cost:5,activation:2});assert.deepEqual(r.prob,[1,1,1,1]);assert.equal(r.cash,24);assert.equal(r.ev,17);assert.equal(r.roi,17/7);});
test('DLL detiene el día en vez de cancelar la cuenta',()=>{const c={...b,runs:1,days:3,target:10000,dd:500,plan:[{goal:1000,risk:1000}],dailyChance:0.000001,dll:100,dllEnabled:true};let r=simulate(c);assert.deepEqual(r.paths[0][0].values,[0,-100,-200,-300]);assert.equal(r.timeout,1);r=simulate({...c,dllEnabled:false});assert.deepEqual(r.paths[0][0].values,[0,-1000]);assert.equal(r.timeout,0);});
test('límite móvil se bloquea al saldo inicial',()=>{const r=simulate({...b,runs:1,target:5000,days:4,minDays:1,dd:1000,plan:[{goal:1000,risk:1000}],dailyChance:100,mode:'eod'});assert.deepEqual(r.paths[0][0].floors,[-1000,0,0,0,0]);});
test('referencia justa: estático se aproxima a 40%',()=>{const r=simulate({...defaults,runs:10000});assert.ok(Math.abs(r.prob[0]-.4)<.025,r.prob[0]);});
test('probabilidades acumuladas y condicionales coherentes',()=>{const r=simulate(b);for(let i=1;i<4;i++){assert.ok(r.prob[i]<=r.prob[i-1]);if(r.conditional[i]!==null)assert.ok(Math.abs(r.prob[i-1]*r.conditional[i]-r.prob[i])<1e-12);}});
test('cuentas copiadas no diversifican',()=>{const r=simulate({...b,accounts:3,correlation:100});assert.equal(r.any,r.prob[1]);assert.equal(r.all,r.prob[0]);});
test('trailing restringe aprobación y approximation intraday es explícita',()=>{const s=simulate(b),e=simulate({...b,mode:'eod'}),i=simulate({...b,mode:'intraday'});assert.ok(e.prob[0]<=s.prob[0]);assert.deepEqual(e.prob,i.prob);});
test('rechaza entradas y carga excesiva',()=>{for(const delta of [{plan:[]},{plan:[{goal:0,risk:100}]},{days:0},{runs:NaN},{accounts:1.5},{split:101},{accounts:10,runs:50000}])assert.throws(()=>validate({...defaults,...delta}));});
test('ROI sin costes no definido',()=>assert.equal(simulate({...b,cost:0}).roi,null));
console.log(n+' pruebas completadas');
