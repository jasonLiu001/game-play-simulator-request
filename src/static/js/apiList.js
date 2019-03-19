var servrContextPath = "";
var apiList = {
    getInvestList: "/invest/getInvestList",
    getInvestInfo: "/invest/getInvestInfo",
    findInvestInfoList: "/invest/getInvestList?tableName=invest&pageIndex=1&pageSize={0}&planType={1}&startDateTime={2}&endDateTime={3}",
    findInvestTotalInfoList: "/invest/getInvestList?tableName=invest_total&pageIndex=1&pageSize={0}&planType={1}&startDateTime={2}&endDateTime={3}",
    getTotalCorrectAndWrongCount: servrContextPath + "/lottery/getTotalCorrectAndWrongCount?startTimeStr={0}&endTimeStr={1}"
};
