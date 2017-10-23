添加新的计划步骤
============

1. 在表中添加和计划对应的新字段

   * 定义表字段名称：在`PlanTableBase.ts`中添加新的字段名
   * 创建表：在`DBService.ts`中的`createLotteryTable`方法中添加对应的新字段到`sql`

2. 定义和表对应的实体属性

   + 在`PlanInfoBase.ts`中添加和上面字段名一致的新属性
   + 通过搜索`PlanInfoBase.ts`中某个属性，找到引用的方法，随之修改添加新属性
   + `LotteryDbService.ts`中的`saveOrUpdatePlanInfo、saveOrUpdatePlanInvestNumberInfo、saveOrUpdatePlanResultInfo`这几个方法中都要添加新的表字段和实体属性，对应的注释中的`sql`语句也一并添加便于以后维护

3. 新增的杀号计划，杀号计划的返回值需要统一

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