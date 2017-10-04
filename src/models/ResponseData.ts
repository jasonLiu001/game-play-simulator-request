/**
 *
 * @summary 超级鹰 服务器返回数据格式 *
 * 返回样例:{"err_no":0,"err_str":"OK","pic_id":"1662228516102","pic_str":"8vka","md5":"35d5c7f6f53223fbdc5b72783db0c2c0"}
 * */
export class ResponseData {
    err_no?:number;//(数值) 返回代码
    err_str?:string;//(字符串) 中文描述的返回信息
    pic_id?:string;//(字符串) 图片标识号，推荐用int64或字符串来存储，最大值为9223372036854775807
    pic_str?:string;//(字符串) 识别出的结果
    md5?:string;//(字符串) md5校验值,用来校验此条数据返回是否真实有效 点击这里查看md5校验算法
}