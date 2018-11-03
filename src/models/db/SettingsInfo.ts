/**
 *
 * 参数设置表
 */
export class SettingsInfo {
    /**
     *
     * 参数项名称
     */
    key: string;

    /**
     *
     * 参数项值
     */
    value: string;

    /**
     *
     * 参数项说明
     */
    desc: string;

    /**
     *
     * 排序
     */
    orderId: string;
}

/**
 *
 * 设置更新模型  只有在更新设置项时 ，使用这个类型
 */
export class UpdateSettingsInfo {
    /**
     *
     * 参数项名称
     */
    key: string;

    /**
     *
     * 参数项值
     */
    value: string;
}

/**
 *
 * 模拟投注参数实体
 * 这里设置这个对象的原因是因为saveOrUpdate_UpdateSettingsInfo方法的参数需要传递一个UpdateSettingsInfo对象才能利用Sequelize中的方法
 */
export const update_isRealInvest_to_mock: UpdateSettingsInfo = {
    key: 'isRealInvest',
    value: '0'
};

/**
 *
 * 真实投注参数实体
 * 这里设置这个对象的原因是因为saveOrUpdate_UpdateSettingsInfo方法的参数需要传递一个UpdateSettingsInfo对象才能利用Sequelize中的方法
 */
export const update_isRealInvest_to_real: UpdateSettingsInfo = {
    key: 'isRealInvest',
    value: '1'
};