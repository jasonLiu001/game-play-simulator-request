Vue.component('alert-component', {
    props: {
        isShow: {
            type: Boolean,
            required: true
        },
        message: {
            type: String,
            required: true
        }
    },
    data() {
        return {}
    },
    template: `<div v-if="isShow" class="alert alert-danger" role="alert">{{message}}</div>`
});