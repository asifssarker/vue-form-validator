export default {

    /**
     * 必填(选)验证
     */
    required: function(value, input) {
        value = value.toString() || '';
        var valid = !!value.length,
            isCheckable = input.tagName === 'SELECT' ||
                          ['radio', 'checkbox'].indexOf(input.type) > -1;
        return {
            valid: valid,
            msg: valid ? '' : (isCheckable ? '请选择' : '请填写此项')
        };
    },

    /**
     * 最小长度验证
     * @param param {String} 最少输入多少个字
     */
    minlength: function(value, input, param) {
        value = value || '';
        var valid = value.length >= parseInt(param);
        return {
            valid: valid,
            msg: (valid ? '' : '请最少填写' + param + '个字')
        };
    },

    /**
     * 邮箱格式
     */
    emailType: function(value, input) {
        var pattern =  /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
            valid = pattern.test(value);
        return {
            valid: valid,
            msg: (valid ? '' : '邮箱格式不正确')
        };
    },

    /**
     * 数字格式
     */
    numberType: function(value, input) {
        return {
            valid: false,
            msg: '数字验证规则未实现'
        };
    },

};
