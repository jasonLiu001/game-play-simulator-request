var app = new Vue({
    el: '#app',
    data: function () {
    },
    methods: {},
    created: function () {
        var self = this;
        var contextPath = "/service";
        var apiList = {
            findInvestInfoList: contextPath + "/lottery/findInvestInfoList?pageIndex=1&pageSize=20&planType=1"
        };

        // 指定图表的配置项和数据
        var option = {
            title: {
                text: 'Plan_01'
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

        $.post(apiList.findInvestInfoList, function (res) {
            var data = res.data;
            var periods = [];
            var winMoneys = [];
            for (var i = data.length - 1; i >= 0; i--) {
                var item = data[i];
                periods.push(item.period);
                winMoneys.push(item.winMoney);
            }
            option.xAxis.data = periods;
            option.series.push({
                type: 'line',
                data: winMoneys
            });

            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('main'));

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);

            // 基于准备好的dom，初始化echarts实例
            var myChart1 = echarts.init(document.getElementById('main1'));

            // 使用刚指定的配置项和数据显示图表。
            myChart1.setOption(option);

            // 基于准备好的dom，初始化echarts实例
            var myChart2 = echarts.init(document.getElementById('main2'));

            // 使用刚指定的配置项和数据显示图表。
            myChart2.setOption(option);

            // 基于准备好的dom，初始化echarts实例
            var myChart3 = echarts.init(document.getElementById('main3'));

            // 使用刚指定的配置项和数据显示图表。
            myChart3.setOption(option);

        });
    },
    mounted: function () {
        let self = this;

    }
});