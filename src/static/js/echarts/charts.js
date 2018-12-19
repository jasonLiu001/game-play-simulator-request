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
            plan03_chart: null,
            chart_defalut_width: ''//默认图表宽度
        };
    },
    mixins: [utilsMixin],
    methods: {
        btnQueryClickHandler(event) {
            let self = this;
            if (this.startTime === '') {
                this.startTime = moment().format('YYYY-MM-DD') + ' 10:00'
            } else {
                this.startTime = moment(this.startTime).format('YYYY-MM-DD HH:mm')
            }
            if (this.endTime === '') {
                this.endTime = moment().add(1, 'days').format('YYYY-MM-DD') + ' 02:00'
            } else {
                this.endTime = moment(this.endTime).format('YYYY-MM-DD HH:mm')
            }

            //如果是手机端 需要根据数据记录量 自动调整图表宽度
            if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
                switch (this.pageSize) {
                    case '20':
                        this.plan01_chart.resize({width: this.chart_defalut_width + 'px'});
                        this.plan02_chart.resize({width: this.chart_defalut_width + 'px'});
                        this.plan03_chart.resize({width: this.chart_defalut_width + 'px'});
                        break;
                    case '50':
                        this.plan01_chart.resize({width: '600px'});
                        this.plan02_chart.resize({width: '600px'});
                        this.plan03_chart.resize({width: '600px'});
                        break;
                    case '90':
                        this.plan01_chart.resize({width: '900px'});
                        this.plan02_chart.resize({width: '900px'});
                        this.plan03_chart.resize({width: '900px'});
                        break;
                    case '120':
                        this.plan01_chart.resize({width: '1100px'});
                        this.plan02_chart.resize({width: '1100px'});
                        this.plan03_chart.resize({width: '1100px'});
                        break;
                }
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
            case 'getTotalCorrectAndWrongCount':
                this.dataUrl = apiList.getTotalCorrectAndWrongCount;
                break;
        }

        //根据图表类型显示数据
        switch (this.chartType) {
            case self.chartViewType.line://初始化线性图表
                self.initLineCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_01', 'invest', 1, 'Invest_01', this.yAxisDataType, (myChart) => {
                    self.plan01_chart = myChart;
                    this.chart_defalut_width = myChart.getWidth();//保存chart第一次初始化宽度
                });
                self.initLineCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 2).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_02', 'invest', 2, 'Invest_02', this.yAxisDataType, (myChart) => {
                    self.plan02_chart = myChart;
                });
                self.initLineCharts(this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 3).replace('{2}', this.startTime).replace('{3}', this.endTime), 'plan_03', 'invest', 3, 'Invest_03', this.yAxisDataType, (myChart) => {
                    self.plan03_chart = myChart;
                });
                break;
            case self.chartViewType.pillar://初始化柱状图表
                let url;
                if (apiName === 'getTotalCorrectAndWrongCount') {
                    url = this.dataUrl.replace('{0}', this.startTime).replace('{1}', this.endTime);
                    // self.initPillarCharts(url, 'plan_01', 'invest', 1, 'Invest_01', this.yAxisDataType, (myChart) => {
                    //     self.plan01_chart = myChart;
                    // });
                } else {
                    url = this.dataUrl.replace('{0}', this.pageSize).replace('{1}', 1).replace('{2}', this.startTime).replace('{3}', this.endTime);
                }
                break;
        }
    },
    mounted() {
        let self = this;

    }
});
