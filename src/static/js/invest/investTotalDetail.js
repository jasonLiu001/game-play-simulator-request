var app = new Vue({
        el: '#app',
        mixins: [utilsMixin],
        data() {
            return {
                period: '',
                planType: 1,
                pageIndex: 1,
                pageSize: 20,
                isShowAlert: false,
                alertMessage: '',
                investTotalItem: {}
            }
        },
        methods: {
            copyInvestNumbers(investTotalItem, evt) {
                this.copyToClipboard(investTotalItem.investNumbers);
                this.alertMessage = '正向号码复制成功';
                this.isShowAlert = true;
            },
            copyReverseInvestNumbers(investTotalItem, evt) {
                let totalNumbers = this.getTotalNumberArray();
                let resultsNumbers = [];
                totalNumbers.forEach((item, index) => {
                    if (investTotalItem.investNumbers.indexOf(item) === -1) {
                        resultsNumbers.push(item);
                    }
                });

                this.copyToClipboard(resultsNumbers.join(','));
                this.alertMessage = '反向号码复制成功';
                this.isShowAlert = true;
            },
            renderPageData() {
                let url = apiList.getInvestInfo + "?tableName=invest_total&period=" + this.period + "&planType=" + this.planType;

                axios.get(url).then((res) => {
                    if (!res.data.data) {
                        this.alertMessage = "服务器返回数据格式错误";
                        this.isShowAlert = true;
                        return;
                    }
                    this.investTotalItem = res.data.data;
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        created() {
            this.period = this.getUrlParameterByName('period');
            this.planType = this.getUrlParameterByName('planType');
            this.renderPageData();
        }
    })
;
