程序修改步骤
============
### 添加新计划

1. 在表中添加和计划对应的新字段

   * 定义表字段名称：在`PlanTableBase.ts`中添加新的字段名
   * 创建表：在`DBService.ts`中的`createLotteryTable`方法中添加对应的新字段到`sql`

2. 定义和表对应的实体属性

   + 在`PlanInfoBase.ts`中添加和上面字段名一致的新属性
   + 通过搜索`PlanInfoBase.ts`中某个属性，找到引用的方法，随之修改添加新属性
   + `LotteryDbService.ts`中的`saveOrUpdatePlanInfo、saveOrUpdatePlanInvestNumberInfo、saveOrUpdatePlanResultInfo`这几个方法中都要添加新的表字段和实体属性，对应的注释中的`sql`语句也一并添加便于以后维护

3. 新增的杀号计划

   + 在`rules`文件夹下添加新的杀号计划，返回值参照其他计划，注意返回百十个和返回单个对象的不同

   + 在`NumberService.ts`文件中添加对新计划的结果保存功能

     ```typescript
     .........  //保存杀号计划内容
     planInfo.jiou_type = promiseAllResult[0].killNumber;
                     planInfo.killplan_bai_wei = promiseAllResult[1].baiWei.killNumber;
                     planInfo.killplan_shi_wei = promiseAllResult[1].shiWei.killNumber;
                     planInfo.killplan_ge_wei = promiseAllResult[1].geWei.killNumber;
                     planInfo.road012_01 = promiseAllResult[2].killNumber;
                     planInfo.missplan_bai_wei = promiseAllResult[3].baiWei.killNumber;
                     planInfo.missplan_shi_wei = promiseAllResult[3].shiWei.killNumber;
                     planInfo.missplan_ge_wei = promiseAllResult[3].geWei.killNumber;
                     planInfo.brokengroup_01_334 = promiseAllResult[4].killNumber;


     ............   //保存杀号计划的最终字符
                     planInvestNumbersInfo.jiou_type = promiseAllResult[0].killNumberResult.join(',');//注意这个不同，没有baiWei.
                     planInvestNumbersInfo.killplan_bai_wei = promiseAllResult[1].baiWei.killNumberResult.join(',');//注意这个不同，多了baiWei.
                     planInvestNumbersInfo.killplan_shi_wei = promiseAllResult[1].shiWei.killNumberResult.join(',');
                     planInvestNumbersInfo.killplan_ge_wei = promiseAllResult[1].geWei.killNumberResult.join(',');
                     planInvestNumbersInfo.road012_01 = promiseAllResult[2].killNumberResult.join(',');
                     planInvestNumbersInfo.missplan_bai_wei = promiseAllResult[3].baiWei.killNumberResult.join(',');
                     planInvestNumbersInfo.missplan_shi_wei = promiseAllResult[3].shiWei.killNumberResult.join(',');
                     planInvestNumbersInfo.missplan_ge_wei = promiseAllResult[3].geWei.killNumberResult.join(',');
                     planInvestNumbersInfo.brokengroup_01_334 = promiseAllResult[4].killNumberResult.join(',');
     ```

     ​

4. 给每个杀号计划添加开奖逻辑处理

   * 在`InvestBase.ts`类中的`updatePlanResult`方法中添加开奖结果处理逻辑，如：奇偶类型

   ```typescript
           //奇偶类型
           let jiOuTypeArray = planInvestNumbersInfo.jiou_type == null ? [] : planInvestNumbersInfo.jiou_type.split(',');
           for (let item of jiOuTypeArray) {
               if (prizeNumber == item) {
                   planResultInfo.jiou_type = 1;
                   break;
               }
           }
   ```
### 添加新的配置项
1. 在ORMService.ts中添加对应的配置key
2. RuntimeConfig.ts中添加对应的key
3. 在AppServices.ts中初始化新建的key
4. 数据库中提前手工添加对应的key和value
