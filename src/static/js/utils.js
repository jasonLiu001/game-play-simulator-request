var utilsMixin = {
    data() {//这里的data写成方法，不是属性，要特别注意
        return {
            planType: '',
            chartDefaultOption: {//图表的公共配置
                title: {
                    text: ''
                },
                tooltip: {//显示提示层
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        snap: true,//鼠标移动自动吸附数据点
                        label: {
                            backgroundColor: '#283b56'
                        }
                    },
                    formatter: function (params) {//添加点击事件 需要自定义tooltip
                        let html = '';
                        if (params.length > 0) {
                            let hrefUrl = "../invest/investTotalDetail.html?period=" + params[0].axisValue + "&planType=" + this.planType;
                            html += '<div onclick="javascript:window.open(\'' + hrefUrl + '\')">';
                            html += params[0].axisValue + '<br/>' + params[0].marker + params[0].data + '<br/>';
                            html += '</div>';
                        }
                        return html;
                    },
                    confine: true,//限制在图表内
                    enterable: true//鼠标可以进入提示层点击
                },
                legend: {
                    top: 'bottom',
                    data: ['利润']
                },
                xAxis: {
                    type: 'category',
                    data: []
                },
                yAxis: {
                    type: 'value'
                },
                series: []
            }
        };
    },
    methods: {
        getUrlParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        },
        copyToClipboard(str) {
            const el = document.createElement('textarea');  // Create a <textarea> element
            el.value = str;                                 // Set its value to the string that you want copied
            el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
            el.style.position = 'absolute';
            el.style.left = '-9999px';                      // Move outside the screen to make it invisible
            document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
            const selected =
                document.getSelection().rangeCount > 0        // Check if there is any content selected previously
                    ? document.getSelection().getRangeAt(0)     // Store selection if found
                    : false;                                    // Mark as false to know no selection existed before
            el.select();                                    // Select the <textarea> content
            document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
            document.body.removeChild(el);                  // Remove the <textarea> element
            if (selected) {                                 // If a selection existed before copying
                document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
                document.getSelection().addRange(selected);   // Restore the original selection
            }
        },
        /**
         *
         * 产生1000注原始号码
         */
        getTotalNumberArray() {
            let a = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                c = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            let totalArray = [];
            for (let i = 0; i < a.length; i++) {
                for (let j = 0; j < b.length; j++) {
                    for (let k = 0; k < c.length; k++) {
                        totalArray.push(a[i] + '' + b[j] + '' + c[k]);
                    }
                }
            }
            return totalArray;
        },
        /**
         *
         * 更新图表显示
         */
        updateInvestInfoCharts(url, planType, myChart) {
            this.planType = planType;
            myChart.showLoading();
            axios.post(url).then((res) => {
                let data = res.data.data;
                let periods = [];
                let winMoneys = [];
                for (let i = data.length - 1; i >= 0; i--) {
                    let item = data[i];
                    periods.push(item.period);
                    winMoneys.push(item.winMoney);
                }

                //复制一个新option
                let chartOption = $.extend(true, {}, this.chartDefaultOption);
                chartOption.xAxis.data = periods;
                chartOption.series.push({
                    type: 'line',
                    data: winMoneys
                });
                //更新图表显示
                myChart.setOption(chartOption, true);
                myChart.hideLoading();
            });
        },
        /**
         *
         * 初始投注图表显示
         */
        initInvestInfoCharts(url, domElement, dataTableName, planType, chartName, successCallback) {
            this.planType = planType;
            // 基于准备好的dom，初始化echarts实例
            axios.post(url).then((res) => {
                let data = res.data.data;
                let periods = [];
                let winMoneys = [];
                for (let i = data.length - 1; i >= 0; i--) {
                    let item = data[i];
                    periods.push(item.period);
                    winMoneys.push(item.winMoney);
                }


                let myChart = echarts.init(document.getElementById(domElement), planType === 2 ? 'dark' : 'light');
                let chartOption = $.extend(true, {}, this.chartDefaultOption, {title: {text: chartName}});
                chartOption.xAxis.data = periods;
                chartOption.series.push({
                    type: 'line',
                    data: winMoneys
                });
                myChart.showLoading();
                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(chartOption);
                myChart.hideLoading();
                if (successCallback && typeof successCallback === 'function') successCallback(myChart);
            });
        }
    }
};