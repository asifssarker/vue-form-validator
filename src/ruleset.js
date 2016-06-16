
function strTrim (value) {
    return value ? ((''+value) || '').trim() : "";
}

export default {

    /**
     * 必填(选)验证
     */
    required: function(value, input) {
        value = strTrim(value);   // value需要转换成字符串，下面用来计算length，不然数字或者0都会是invalid
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
        value = strTrim(value);   // value需要转换成字符串，下面用来计算length，不然数字或者0都会是invalid
        if(!value) {
            return {
                valid: true,
                msg: ''
            }
        }
        var valid = value.length >= parseInt(param);
        return {
            valid: valid,
            msg: (valid ? '' : '请最少填写' + param + '个字')
        };
    },

    /**
     * 最大长度验证， 主要针对 IE9 下 textarea 的 maxlength 无效的情况
     * @param param {String} 最多输入多少个字
     */
    maxlength: function(value, input, param) {
        value = strTrim(value);   // value需要转换成字符串，下面用来计算length，不然数字或者0都会是invalid
        if(!value) {
            return {
                valid: true,
                msg: ''
            }
        }
        var valid = value.length <= parseInt(param);
        return {
            valid: valid,
            msg: (valid ? '' : '请最多填写' + param + '个字')
        };
    },
    /**
     * 邮箱格式
     */
    emailType: function(value, input) {
        value = strTrim(value);   // value需要转换成字符串，为空则直接返回
        if(!value) {
            return {
                valid: true,
                msg: ''
            }
        }
        var pattern =  /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
            valid = pattern.test(value);
        return {
            valid: valid,
            msg: (valid ? '' : '邮箱格式不正确')
        };
    },

    /**
     * 手机格式
     */
    phoneType: function(value, input) {
        value = strTrim(value);   // value需要转换成字符串，为空则直接返回
        if(!value) {
            return {
                valid: true,
                msg: ''
            }
        }
        var pattern = /^1[3|4|5|8]\d{9}$/,
            valid = pattern.test(value);
        return {
            valid: valid,
            msg: (valid ? '' : '手机格式不正确')
        };
    },

    /**
     * 固定电话格式
     */
    telType: function(value, input) {
        value = strTrim(value);   // value需要转换成字符串，为空则直接返回
        if(!value) {
            return {
                valid: true,
                msg: ''
            }
        }
        var pattern = /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/,
            valid = pattern.test(value);
        return {
            valid: valid,
            msg: (valid ? '' : '固定电话格式不正确')
        };
    },

    /**
     * 数字格式
     */
    numberType: function(value, input) {
        if(isNaN(value)){
            return {
                valid: false,
                msg: '请输入数字'
            }
        }
        var min = parseFloat(input.getAttribute('min'));
        var max = parseFloat(input.getAttribute('max'));
        min = isNaN(min) ? -Infinity : min;
        max = isNaN(max) ? Infinity : max;
        var valid = value >= min && value <= max;
        var msg = value < min ? '输入值最小为 ' + min : (value > max ? '输入值最大为 ' + max : '');
        return {
            valid: valid,
            msg: (valid ? '' : msg)
        };
    },

    /**
     * 整数格式
     */
    integerType: function(value, input) {
        if(!/^\d*$/.test(strTrim(value))){
            return {
                valid: false,
                msg: '请输入整数'
            }
        }
        var min = parseInt(input.getAttribute('min'));
        var max = parseInt(input.getAttribute('max'));
        min = isNaN(min) ? -Infinity : min;
        max = isNaN(max) ? Infinity : max;
        var valid = value >= min && value <= max;
        var msg = value < min ? '输入值最小为 ' + min : (value > max ? '输入值最大为 ' + max : '');
        return {
            valid: valid,
            msg: (valid ? '' : msg)
        };
    },
    /**
     * 不为空字符串
     */
    stringType: function(value, input) {
        var valid = !/^\s*$/.test(value)
        var msg = '请输入有效的字符' 
        return {
            valid: valid,
            msg: (valid ? '' : msg)
        };
    }
};
