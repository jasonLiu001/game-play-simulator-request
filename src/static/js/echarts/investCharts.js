var app = new Vue({
    el: '#app',
    data() {
        return {};
    },
    mixins: [utilsMixin],
    methods: {},
    created() {
        //初始化主表格
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', 1), 'plan_01', 'Plan_01');
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', 2), 'plan_02', 'Plan_02');
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', 3), 'plan_03', 'Plan_03');
    },
    mounted() {
        let self = this;

    }
});