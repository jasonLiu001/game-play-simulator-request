var app = new Vue({
    el: '#app',
    data: function () {
        return {};
    },
    methods: {
        initEcharts(domElement, planType, chartName) {
            // 指定图表的配置项和数据
            let option = {
                title: {
                    text: ''
                },
                tooltip: {},
                legend: {
                    data: ['Echarts']
                },
                xAxis: {
                    type: 'category',
                    data: []
                },
                yAxis: {
                    type: 'value'
                },
                series: []
            };

            let url = apiList.findInvestInfoList.replace('{0}', planType);

            axios.post(url).then((res) => {
                let data = res.data.data;
                let periods = [];
                let winMoneys = [];
                for (let i = data.length - 1; i >= 0; i--) {
                    let item = data[i];
                    periods.push(item.period);
                    winMoneys.push(item.winMoney);
                }
                option.xAxis.data = periods;
                option.series.push({
                    type: 'line',
                    data: winMoneys
                });

                // 基于准备好的dom，初始化echarts实例
                let myChart = echarts.init(document.getElementById(domElement));
                let chartOption = $.extend(true, {}, option, {title: {text: chartName}});
                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(chartOption);
            });
        }
    },
    created: function () {
        let self = this;
        //初始化主表格
        this.initEcharts('plan_01', 1, 'Plan_01');
        this.initEcharts('plan_02', 2, 'Plan_02');
        this.initEcharts('plan_03', 3, 'Plan_03');
    },
    mounted: function () {
        let self = this;

    }
});