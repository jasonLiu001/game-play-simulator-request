添加新的计划步骤
============

1. 在表中添加和计划对应的新字段

   * 定义表字段名称：在`PlanTableBase.ts`中添加新的字段名
   * 创建表：在`DBService.ts`中的`createLotteryTable`方法中添加对应的新字段到`sql`

2. 定义和表对应的实体属性

   + 在`PlanInfoBase.ts`中添加和上面字段名一致的新属性
   + 通过搜索`PlanInfoBase.ts`中某个属性，找到引用的方法，随之修改添加新属性
   + `LotteryDbService.ts`中的`saveOrUpdatePlanInfo、saveOrUpdatePlanInvestNumberInfo、saveOrUpdatePlanResultInfo`这几个方法中都要添加新的表字段和实体属性，对应的注释中的`sql`语句也一并添加便于以后维护

3. 新增的杀号计划，需要添加保存杀号记录

   * 参照：`JiOuType.ts`中代码的最后部分，在返回杀号结果前保存杀号号码到数据库，类似下面的保存逻辑：

   ```typescript
           //保存排除的类型
           return LotteryDbService.getPlanInfo(TimeService.getCurrentPeriodNumber(new Date()))
               .then((planInfo: PlanInfo) => {
                   planInfo.jiou_type = killJiouType_01 + '|' + killJiouType_02;
                   return LotteryDbService.saveOrUpdatePlanInfo(planInfo);//保存排除的奇偶类型
               })
               .then((planInfo: PlanInfo) => {
                   return LotteryDbService.getPlanInvestNumberesInfo(planInfo.period);
               })
               .then((planInvestNumbersInfo: PlanInvestNumbersInfo) => {
                   planInvestNumbersInfo.jiou_type = restNumberArray.join(',');
                   return LotteryDbService.saveOrUpdatePlanInvestNumbersInfo(planInvestNumbersInfo);
               })
               .then(() => {
                   return restNumberArray;
               });
   ```

4. 给每个杀号计划添加开奖逻辑处理

   * 在`AbstractInvestBase.ts`类中的`updatePlanResult`方法中添加开奖结果处理逻辑，如：奇偶类型

   ```typescript
           //奇偶类型
           let jiOuTypeArray = planInvestNumbersInfo.jiou_type == null ? [] : planInvestNumbersInfo.jiou_type.split(',');
           for (let j = 0; j < jiOuTypeArray.length; j++) {
               let item = jiOuTypeArray[j];
               if (prizeNumber == item) {
                   planResultInfo.jiou_type = 1;
                   break;
               }
           }
   ```

   ​