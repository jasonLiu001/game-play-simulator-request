var app = new Vue({
    el: '#app',
    data() {
        return {
            startTime: moment().format('YYYY-MM-DD') + ' 09:50',
            endTime: moment().add(1, 'days').format('YYYY-MM-DD') + ' 02:00',
            requestResult: ""
        };
    },
    mixins: [utilsMixin],
    methods: {
        getTotalCorrectAndWrongCount() {
            let self = this;
            if (this.startTime === '') {
                this.startTime = moment().format('YYYY-MM-DD') + ' 09:50'
            } else {
                this.startTime = moment(this.startTime).format('YYYY-MM-DD HH:mm')
            }
            if (this.endTime === '') {
                this.endTime = moment().add(1, 'days').format('YYYY-MM-DD') + ' 02:00'
            } else {
                this.endTime = moment(this.endTime).format('YYYY-MM-DD HH:mm')
            }

            let dataUrl = apiList.getTotalCorrectAndWrongCount.replace("{0}", this.startTime).replace("{1}", this.endTime);
            axios.post(dataUrl).then((res) => {
                if (!res.data.data) { //无数据
                    self.requestResult = "无数据返回";
                    return;
                }

                self.requestResult = res.data.data;
            });
        }
    },
    created() {

    }
});
