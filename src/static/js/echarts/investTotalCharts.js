var app = new Vue({
    el: '#app',
    data() {
        return {
            createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            pageSize: 20
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
            console.log(this.createTime);
            //当前选择的日期
            console.log(this.pageSize);
        }
    },
    created() {
        //日期控件初始化
        $('#datepicker').datepicker();

        //初始化图表
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 1), 'plan_01', 'invest_total', 1, 'InvestTotal_01');
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 2), 'plan_02', 'invest_total', 2, 'InvestTotal_02');
        this.initInvestInfoCharts(apiList.findInvestTotalInfoList.replace('{0}', 3), 'plan_03', 'invest_total', 3, 'InvestTotal_03');
    },
    mounted() {
        let self = this;
    }
});