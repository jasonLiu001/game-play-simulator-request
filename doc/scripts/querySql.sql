-- 查询特定期号的中奖情况
select r.period, r.missplan_bai_wei,r.sum_values,r.three_number_together,r.road012_01 from plan_result r
where r.period in('20180106-005', '20180106-010', '20180106-015', '20180106-020', '20180106-025', '20180105-030', '20180105-035', '20180105-040', '20180105-045', '20180105-050', '20180105-055', '20180105-060', '20180105-065', '20180105-070', '20180105-075', '20180105-080', '20180105-085', '20180105-090', '20180105-095', '20180105-100', '20180105-105', '20180105-110', '20180105-115', '20180105-120') order by r.period asc;

-- 查询特定期号投注号码及中奖情况
select p.period, p.missplan_bai_wei,p.sum_values,p.three_number_together,p.road012_01, pr.missplan_bai_wei,pr.sum_values,pr.three_number_together,pr.road012_01 from plan p
left join plan_result pr on pr.period=p.period
where p.period in(select r.period from plan_result r
where r.period in('20180107-005', '20180107-010', '20180107-015', '20180107-020', '20180107-025', '20180106-030', '20180106-035', '20180106-040', '20180106-045', '20180106-050', '20180106-055', '20180106-060', '20180106-065', '20180106-070', '20180106-075', '20180106-080', '20180106-085', '20180106-090', '20180106-095', '20180106-100', '20180106-105', '20180106-110', '20180106-115', '20180106-120') order by r.period asc)
 order by p.period asc;


