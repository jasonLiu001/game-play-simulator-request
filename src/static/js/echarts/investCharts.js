var app = new Vue({
    el: '#app',
    data() {
        return {};
    },
    mixins: [utilsMixin],
    methods: {},
    created() {
        //初始化图表
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', 1), 'plan_01', 'Invest_01');
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', 2), 'plan_02', 'Invest_02');
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', 3), 'plan_03', 'Invest_03');
    },
    mounted() {
        let self = this;

    }
});