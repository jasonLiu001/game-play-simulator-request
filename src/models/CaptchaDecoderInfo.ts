//超级鹰解密验证码参数
export class CaptchaDecoderInfo {
    user: string;//登录用户名
    pass: string;//登录密码
    softid: string; //软件ID 可在用户中心生成
    codetype: string;//验证码类型 http://www.chaojiying.com/price.html 选择
    userfile: string;//抓取回来的码证码图片文件
}