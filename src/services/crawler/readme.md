数据爬虫目录
=========

1. `award`目录爬取开奖号码
2. `analysis` 奖号分析目录，包括最大遗漏，杀号等

## 数据获取地址

xml格式

1. `http://kaijiang.500.com/static/public/ssc/xml/qihaoxml/20181001.xml?_A=SRZANHID1538363085068`【有历史数据，有缓存，数据全】

JSON格式

1. `http://026012.com/index.php/index/index`

网页格式

1. `https://www.km28.com/lottery-gp/cqssc.html`[最优]
2. `https://fx.cp2y.com/cqssckj/`【2】
3. `https://kaijiang.aicai.com/cqssc/`【3】

## 包含数据请求

```javascript
//360网站
http://chart.cp.360.cn/kaijiang/ssccq 

url: "/zst/qkj/?lotId=" + n.pageSpace.lotType + "&issue=" + e + "&r=" + Math.random(),

lotId:255401

issue:170608107  --本期的期号

r:

http://chart.cp.360.cn/zst/qkj/?lotId=255401&issue=170608107&r=80909373505058
```

```
//彩八仙  
http://www.caibaxian.com/open.aspx?callback=jsonp1498483410584
```

```
//500历史开奖号码信息  返回的是xml数据，比较全，包括历史数据
http://kaijiang.500.com/static/public/ssc/xml/qihaoxml/20170626.xml?_A=WAMJYNBZ1498452938501

var guidHead = 'ABCDEFGHIJKMNLOPQRSTUVWXYZ'.split('').sort(new Function('return Math.random()>0.5?-1:1')).join('').substr(12, 8),
	guid = +new Date;
	F.getGuid=function (el){
		el = el||{};
		return el.guid ? el.guid: (el.guid = guidHead + (++guid));
	};
```