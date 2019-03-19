var app = new Vue({
    el: '#app',
    data: function () {
        return {
            pageIndex: 0,
            pageSize: 40,
            isShowAlert: false,
            alertMessage: '',
            list: []
        }
    },
    methods: {
        test() {
            console.log('ol');
        },
        loadMore: function (callback, dropLoader) {
            this.pageIndex++;
            this.renderPageData(callback, dropLoader);
        },
        redirectToDetail(period, investTotalItem, evt) {
            let url = "/pages/invest/investTotalDetail.html?period=" + period + "&planType=" + investTotalItem.planType;
            window.open(url);
        },
        renderPageData(callback, dropLoader) {
            let url = apiList.getInvestList + "?tableName=invest_total&pageIndex=" + this.pageIndex + "&pageSize=" + this.pageSize;

            axios.get(url).then((res) => {
                if (!res.data.data) {
                    this.alertMessage = "服务器返回数据格式错误";
                    this.isShowAlert = true;
                    return;
                }

                for (let item of res.data.data) {
                    this.list.push(item);
                }
                if (typeof callback === 'function') {
                    callback();
                }
                if (res.data.data.length === 0) {
                    //无数据
                    if (dropLoader && dropLoader.noData) {
                        dropLoader.lock();// 锁定
                        dropLoader.noData();  // 无数据
                    }
                }
            }).catch((err) => {
                console.log(err);
                if (typeof callback === 'function') {
                    callback();
                }
            });
        }
    },
    created: function () {
        let self = this;
        //注册加载更多初始化
        $('#investList').dropload({
            scrollArea: window,
            loadDownFn: function (me) {
                self.loadMore(function () {
                    // 每次数据插入，必须重置
                    me.resetload();
                }, me);
            }
        });
    },
    mounted: function () {
        let self = this;

    }
});
