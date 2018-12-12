var app = new Vue({
    el: '#app',
    data() {
        return {
            createTime: moment().format('YYYY-MM-DD'),
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
                this.createTime = moment(selectedDateArray[0]).format('YYYY-MM-DD');
            }
            this.updateInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.createTime), 1, this.plan01_chart);
            this.updateInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', this.pageSize).replace('{1}', 2).replace('{2}', this.createTime), 2, this.plan02_chart);
            this.updateInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', this.pageSize).replace('{1}', 3).replace('{2}', this.createTime), 3, this.plan03_chart);
        }
    },
    created() {
        let self = this;
        //日期控件初始化
        $('#datepicker').datepicker();

        //初始化图表
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.createTime), 'plan_01', 'invest', 1, 'Invest_01', (myChart) => {
            self.plan01_chart = myChart;
        });
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', this.pageSize).replace('{1}', 2).replace('{2}', this.createTime), 'plan_02', 'invest', 2, 'Invest_02', (myChart) => {
            self.plan02_chart = myChart;
        });
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', this.pageSize).replace('{1}', 3).replace('{2}', this.createTime), 'plan_03', 'invest', 3, 'Invest_03', (myChart) => {
            self.plan03_chart = myChart;
        });
    },
    mounted() {
        let self = this;

    }
});
