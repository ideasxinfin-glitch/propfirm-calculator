(function(root){
'use strict';
const defaults={balance:50000,target:3000,dd:2500,mode:'eod',dll:1200,cost:150,activation:0,win:52,rr:1.5,risk:200,commission:4,trades:4,days:60,fundedDays:90,minDays:5,payoutEvery:10,payoutMin:500,payoutCap:2000,buffer:500,split:90,accounts:3,correlation:0,runs:3000,seed:42};
function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function validate(c){for(const k of Object.keys(defaults)){if(k==='mode')continue;if(!Number.isFinite(c[k]))throw Error('Valor inválido: '+k);}for(const k of ['balance','target','dd','risk','rr','trades','days','fundedDays','payoutEvery','runs','accounts'])if(c[k]<=0)throw Error(k+' debe ser mayor que cero');for(const k of ['dll','cost','activation','commission','minDays','payoutMin','payoutCap','buffer'])if(c[k]<0)throw Error(k+' no puede ser negativo');for(const k of ['win','split','correlation'])if(c[k]<0||c[k]>100)throw Error(k+' debe estar entre 0 y 100');for(const k of ['trades','days','fundedDays','minDays','payoutEvery','runs','accounts','seed'])if(!Number.isInteger(c[k]))throw Error(k+' debe ser entero');if(c.runs>20000||c.accounts>20||c.days>365||c.fundedDays>365||c.trades>20)throw Error('Máximo: 20.000 simulaciones, 20 cuentas, 365 días y 20 trades/día');if(!['static','eod','intraday'].includes(c.mode))throw Error('Drawdown inválido');if(c.dd>=c.balance)throw Error('Drawdown debe ser menor al saldo');}
function simulate(input){const c={...defaults,...input};validate(c);if(c.runs*c.accounts*(c.days+c.fundedDays)*c.trades>30000000)throw Error('Escenario demasiado grande: reduce simulaciones, cuentas o días (máximo 30 millones de trades potenciales).');let passed=0,paid=0,pay2=0,timeouts=0,totalCash=0,portfolioAny=0,portfolioAll=0;let profits=[],paths=[],passDays=[],reasons={dd:0,dll:0};
for(let run=0;run<c.runs;run++){
 let any=0,all=0,net=0;
 for(let acc=0;acc<c.accounts;acc++){
  let eq=0,peak=0,floor=-c.dd,phase='eval',cash=0,nPay=0,evalDays=0,fundStart=0,alive=true,path=[0];
  // Common random numbers per calendar trade; mixture gives Bernoulli outcome correlation rho.
  const own=rng(c.seed+Math.imul(run+1,1000003)+Math.imul(acc+1,9176));
  const common=rng(c.seed+Math.imul(run+1,1000003)+771);
  const mix=rng(c.seed+Math.imul(run+1,1000003)+Math.imul(acc+1,331)+992);
  for(let day=1;day<=c.days+c.fundedDays&&alive;day++){
   let dayStart=eq;const funded=phase==='funded';
   for(let trade=0;trade<c.trades;trade++){
    const shared=common(),individual=own();const u=mix()<Math.sqrt(c.correlation/100)?shared:individual;
    eq+=u<c.win/100?c.risk*c.rr-c.commission:-c.risk-c.commission;
    if(c.mode==='intraday'){peak=Math.max(peak,eq);floor=peak-c.dd;}
    if(eq<=floor){alive=false;reasons.dd++;break;}
    if(c.dll>0&&eq-dayStart<=-c.dll){alive=false;reasons.dll++;break;}
    if(!funded&&eq>=c.target&&day>=c.minDays)break;
   }
   if(acc===0&&run<32)path.push(eq);
   if(!alive)break;
   if(c.mode==='eod'){peak=Math.max(peak,eq);floor=peak-c.dd;}
   if(!funded){evalDays=day;if(eq>=c.target&&day>=c.minDays){passed++;all++;phase='funded';fundStart=day;eq=0;peak=0;floor=-c.dd;}else if(day>=c.days){timeouts++;break;}}
   else {const fd=day-fundStart;if(fd%c.payoutEvery===0){const available=Math.max(0,Math.min(eq-c.buffer,eq-floor-c.buffer,c.payoutCap));if(available>=c.payoutMin&&available>0){cash+=available*c.split/100;eq-=available;nPay++;}}if(fd>=c.fundedDays)break;}
  }
  if(nPay){paid++;any++;}if(nPay>=2)pay2++;if(phase==='funded')passDays.push(evalDays);
  totalCash+=cash;net+=cash-c.cost-(phase==='funded'?c.activation:0);
  if(acc===0&&run<32)paths.push(path);
 }
 if(any)portfolioAny++;if(all===c.accounts)portfolioAll++;profits.push(net);
}
const n=c.runs*c.accounts,pass=passed/n,payout=paid/n,costs=n*c.cost+passed*c.activation,ev=(totalCash-costs)/c.runs;
profits.sort((a,b)=>a-b);return{config:c,pass,payout,conditional:passed?paid/passed:null,second:pay2/n,passSE:Math.sqrt(pass*(1-pass)/c.runs),ev,roi:costs?(totalCash-costs)/costs:null,cash:totalCash/c.runs,portfolioAny:portfolioAny/c.runs,portfolioAll:portfolioAll/c.runs,timeout:timeouts/n,median:profits[Math.floor(profits.length*.5)],p05:profits[Math.floor(profits.length*.05)],p95:profits[Math.floor(profits.length*.95)],meanDays:passDays.length?passDays.reduce((a,b)=>a+b,0)/passDays.length:null,paths,profits,reasons,passed,paid};}
const api={defaults,rng,simulate,validate};if(typeof module!=='undefined')module.exports=api;else root.PropEngine=api;
})(globalThis);
