## 改变投注号码步骤

1. `NumberService.ts`中`generateInvestNumber`方法根据实际需要产生投注号码
2. `NumberService.ts` 中`isLastPrizeNumberValid`方法修改过滤规则
3. `AbstractInvestBase.ts`中`checkPlanResultHistory`方法修改过滤规则，上期中奖则投注规则修改
4. 【可选】如果用到杀奇偶类型，需要修改`偶偶奇`时的投注规则，目前奇偶都是同时杀两个号码

## 需要在配置文件中修改当前选定的投注方案
1. 设置currentSelectedInvestPlanType为选择的投注方案
```javascript
    {
        //....
        //当前选择的投注方案类型
        currentSelectedInvestPlanType: 1
        //....
    }
```
2. 如果增加新的投注号码方案，需要在investPlan中添加对应的投注方案
```javascript
    //投注方案
    public static investPlan: any = {
        one: {
            investNumbers: '',
            accountBalance: CONFIG_CONST.originAccoutBalance
        },
        two: {
            investNumbers: '',
            accountBalance: CONFIG_CONST.originAccoutBalance
        }
    };
```