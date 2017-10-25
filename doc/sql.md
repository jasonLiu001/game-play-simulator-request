## 投注及中奖信息sql

```sql
select a.period,a.openNumber,
i.investNumberCount,i.winMoney,i.investNumbers,i.isWin,
p.jiou_type,p.killplan_bai_wei,p.killplan_shi_wei,p.killplan_ge_wei,
n.jiou_type,n.killplan_bai_wei,n.killplan_shi_wei,n.killplan_shi_wei,
r.jiou_type,r.killplan_bai_wei,r.killplan_shi_wei,r.killplan_ge_wei 
from invest i
left join award a on i.period=a.period
left join plan p on i.period=p.period
left join plan_invest_numbers n on i.period=n.period
left join plan_result r on i.period=r.period 
```



