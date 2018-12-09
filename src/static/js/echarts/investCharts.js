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
        let self = this;
        //日期控件初始化
        $('#datepicker').datepicker();

        //初始化图表
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', 1), 'plan_01', 'invest', 1, 'Invest_01');
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', 2), 'plan_02', 'invest', 2, 'Invest_02');
        this.initInvestInfoCharts(apiList.findInvestInfoList.replace('{0}', 3), 'plan_03', 'invest', 3, 'Invest_03');
    },
    mounted() {
        let self = this;

    }
});