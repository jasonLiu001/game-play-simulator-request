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

## 已尝试的方案

#### 方案一 【否定】---杀奇偶+定胆

1. 杀奇偶--倒杀奇偶
2. 上期的开奖号码为下期的胆码

#### 方案二 【否定】----断组+杀最大遗漏+跟杀号计划5期

方法一：

1. 上期的开奖号码作为一个组，如上期开奖号码为： 289
2. 按顺序（小-大）写出其他号：0134567
3. 把0134567按前3后4分开就是断的另两个组
4. 下期断一组：013-289-4567
5. 分组A：013289  分组B：2894567  分组C：0134567

方法二：

合尾分析断组，用上期开奖号码的合尾直接进行分解

0,5尾：019-456-2378

1,6尾：012-567-3489

2,7尾：123-678-0459

3,8尾：234-789-0156

4,9尾：089-345-1267



断组的几种形式：

1. 2-2-2 断组

2. 2-2-3 断组

3. 3-3-3 断组

#### 方案三【否定】遇到特殊形态投注

1. 杀号：前2期号码是连号，如20期开3，下期21期开4，那么杀连号5（3-4-5）
2. 杀号：上期开啥，下期杀啥

#### 方案四【验证中】遇到特殊形态投注
1. 杀号：当出现“偶偶奇”形态时，开始投注，杀“奇奇偶”+“偶偶奇”
2. 杀号：用杀“奇奇偶+偶偶奇+三连+豹子”的结果做大底

