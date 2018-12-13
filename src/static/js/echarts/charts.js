var app = new Vue({
    el: '#app',
    data() {
        return {
            dataUrl: '',//接口数据url
            startTime: moment().format('YYYY-MM-DD'),
            endTime: moment().format('YYYY-MM-DD'),
            pageSize: 20,
            plan01_chart: null,
            plan02_chart: null,
            plan03_chart: null
        };
    },
    mixins: [utilsMixin],
    methods: {
        btnQueryClickHandler(event) {
            //开始日期
            let startTime_datePicker = $('#starttime_datepicker').data('datepicker');
            //结束时间
            let endTime_datePicker = $('#endtime_datepicker').data('datepicker');
            let startDateArray = startTime_datePicker.selectedDates;
            let endDateArray = endTime_datePicker.selectedDates;
            if (startDateArray.length >= 0) {
                this.startTime = moment(startDateArray[0]).format('YYYY-MM-DD');
            }
            if (endDateArray.length >= 0) {
                this.endTime = moment(endDateArray[0]).format('YYYY-MM-DD');
            }
            this.updateInvestInfoCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.startTime).replace('{3}', this.endTime), 1, this.plan01_chart);
            this.updateInvestInfoCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 2).replace('{2}', this.startTime).replace('{3}', this.endTime), 2, this.plan02_chart);
            this.updateInvestInfoCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 3).replace('{2}', this.startTime).replace('{3}', this.endTime), 3, this.plan03_chart);
        }
    },
    created() {
        let self = this;

        //开始日期初始化
        $('#starttime_datepicker').datepicker();
        //结束日期初始化
        $('#endtime_datepicker').datepicker();

        let apiName = this.getUrlParameterByName('apiName');
        switch (apiName) {
            case 'findInvestInfoList':
                this.dataUrl = apiList.findInvestInfoList;
                break;
            case 'findInvestTotalInfoList':
                this.dataUrl = apiList.findInvestTotalInfoList;
                break;
        }

        //初始化图表
        this.initInvestInfoCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_01', 'invest', 1, 'Invest_01', (myChart) => {
            self.plan01_chart = myChart;
        });
        this.initInvestInfoCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 2).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_02', 'invest', 2, 'Invest_02', (myChart) => {
            self.plan02_chart = myChart;
        });
        this.initInvestInfoCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 3).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_03', 'invest', 3, 'Invest_03', (myChart) => {
            self.plan03_chart = myChart;
        });
    },
    mounted() {
        let self = this;

    }
});
