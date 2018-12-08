var app = new Vue({
    el: '#app',
    data() {
        return {};
    },
    mixins: [utilsMixin],
    methods: {},
    created() {
        //初始化图表
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 1), 'plan_01', 'invest_total', 1, 'InvestTotal_01');
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 2), 'plan_02', 'invest_total', 2, 'InvestTotal_02');
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 3), 'plan_03', 'invest_total', 3, 'InvestTotal_03');
    },
    mounted() {
        let self = this;
    }
});