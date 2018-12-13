var app = new Vue({
    el: '#app',
    data() {
        return {
            dataUrl: '',//接口数据url
            yAxisDataType: '',//y轴数据类型
            chartType: '',//图表类型
            startTime: moment().format('YYYY-MM-DD') + ' 10:00',
            endTime: moment().add(1, 'days').format('YYYY-MM-DD') + ' 02:00',
            pageSize: 20,
            plan01_chart: null,
            plan02_chart: null,
            plan03_chart: null
        };
    },
    mixins: [utilsMixin],
    methods: {
        btnQueryClickHandler(event) {
            let self = this;
            //开始日期
            let startTime_datePicker = $('#starttime_datepicker').data('datepicker');
            //结束时间
            let endTime_datePicker = $('#endtime_datepicker').data('datepicker');
            let startDateArray = startTime_datePicker.selectedDates;
            let endDateArray = endTime_datePicker.selectedDates;
            if (startDateArray.length > 0) {
                this.startTime = moment(startDateArray[0]).format('YYYY-MM-DD HH:mm');
            }
            if (endDateArray.length > 0) {
                this.endTime = moment(endDateArray[0]).format('YYYY-MM-DD HH:mm');
            }

            //根据图表类型显示数据
            switch (this.chartType) {
                case self.chartViewType.line://初始化线性图表
                    self.updateLineCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.startTime).replace('{3}', this.endTime), 1, this.yAxisDataType, this.plan01_chart);
                    self.updateLineCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 2).replace('{2}', this.startTime).replace('{3}', this.endTime), 2, this.yAxisDataType, this.plan02_chart);
                    self.updateLineCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 3).replace('{2}', this.startTime).replace('{3}', this.endTime), 3, this.yAxisDataType, this.plan03_chart);
                    break;
                case self.chartViewType.pillar://初始化柱状图表
                    self.updatePillarCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.startTime).replace('{3}', this.endTime), 1, this.yAxisDataType, this.plan01_chart);
                    self.updatePillarCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 2).replace('{2}', this.startTime).replace('{3}', this.endTime), 2, this.yAxisDataType, this.plan02_chart);
                    self.updatePillarCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 3).replace('{2}', this.startTime).replace('{3}', this.endTime), 3, this.yAxisDataType, this.plan03_chart);
                    break;
            }
        }
    },
    created() {
        let self = this;

        //开始日期初始化
        $('#starttime_datepicker').datepicker();
        //结束日期初始化
        $('#endtime_datepicker').datepicker();
        //调用api接口名称
        let apiName = this.getUrlParameterByName('apiName');
        //y轴显示的数据类型
        this.yAxisDataType = this.getUrlParameterByName('yAxisDataType');
        //图表类型
        this.chartType = this.getUrlParameterByName('chartType');
        switch (apiName) {
            case 'findInvestInfoList':
                this.dataUrl = apiList.findInvestInfoList;
                break;
            case 'findInvestTotalInfoList':
                this.dataUrl = apiList.findInvestTotalInfoList;
                break;
        }

        //根据图表类型显示数据
        switch (this.chartType) {
            case self.chartViewType.line://初始化线性图表
                self.initLineCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_01', 'invest', 1, 'Invest_01', this.yAxisDataType, (myChart) => {
                    self.plan01_chart = myChart;
                });
                self.initLineCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 2).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_02', 'invest', 2, 'Invest_02', this.yAxisDataType, (myChart) => {
                    self.plan02_chart = myChart;
                });
                self.initLineCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 3).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_03', 'invest', 3, 'Invest_03', this.yAxisDataType, (myChart) => {
                    self.plan03_chart = myChart;
                });
                break;
            case self.chartViewType.pillar://初始化柱状图表
                self.initPillarCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_01', 'invest', 1, 'Invest_01', this.yAxisDataType, (myChart) => {
                    self.plan01_chart = myChart;
                });
                self.initPillarCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 2).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_02', 'invest', 2, 'Invest_02', this.yAxisDataType, (myChart) => {
                    self.plan02_chart = myChart;
                });
                self.initPillarCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 3).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_03', 'invest', 3, 'Invest_03', this.yAxisDataType, (myChart) => {
                    self.plan03_chart = myChart;
                });
                break;
        }
    },
    mounted() {
        let self = this;

    }
});
