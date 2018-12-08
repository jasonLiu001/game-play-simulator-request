var app = new Vue({
    el: '#app',
    data() {
        return {};
    },
    mixins: [utilsMixin],
    methods: {},
    created() {
        //初始化图表
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 1), 'plan_01', 'InvestTotal_01');
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 2), 'plan_02', 'InvestTotal_02');
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 3), 'plan_03', 'InvestTotal_03');
    },
    mounted() {
        let self = this;
    }
});