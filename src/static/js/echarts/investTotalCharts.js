var app = new Vue({
    el: '#app',
    data() {
        return {
            createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            pageSize: 20,
            plan01_chart: null,
            plan02_chart: null,
            plan03_chart: null
        };
    },
    mixins: [utilsMixin],
    methods: {
        btnQueryClickHandler(event) {
            //日期
            let picker = $('#datepicker').data('datepicker');
            let selectedDateArray = picker.selectedDates;
            if (selectedDateArray.length >= 0) {
                this.createTime = moment(selectedDateArray[0]).format('YYYY-MM-DD HH:mm:ss');
            }
            this.updateInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', this.pageSize).replace('{1}', 1), this.plan01_chart);
            this.updateInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', this.pageSize).replace('{1}', 2), this.plan02_chart);
            this.updateInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', this.pageSize).replace('{1}', 3), this.plan03_chart);
        }
    },
    created() {
        let self = this;
        //日期控件初始化
        $('#datepicker').datepicker();

        //初始化图表
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 120).replace('{1}', 1), 'plan_01', 'invest_total', 1, 'InvestTotal_01', (myChart) => {
            self.plan01_chart = myChart;
        });
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 120).replace('{1}', 2), 'plan_02', 'invest_total', 2, 'InvestTotal_02', (myChart) => {
            self.plan02_chart = myChart;
        });
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 120).replace('{1}', 3), 'plan_03', 'invest_total', 3, 'InvestTotal_03', (myChart) => {
            self.plan03_chart = myChart;
        });
    },
    mounted() {
        let self = this;
    }
});