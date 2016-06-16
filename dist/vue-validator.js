(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.VueValidator = factory());
}(this, function () { 'use strict';

    /**
     * 获取变量的字符串值
     */
    function toString(value) {
        return value === undefined || value === null
          ? ''
          : value.toString().trim();
    }

    const ruleset = {

        /**
         * 必填(选)验证
         */
        required: function(value, input) {
            value = toString(value);   // value需要转换成字符串，下面用来计算length，不然数字或者0都会是invalid
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
            value = toString(value);   // value需要转换成字符串，下面用来计算length，不然数字或者0都会是invalid
            var valid = value.length >= parseInt(param);
            return {
                valid: valid,
                msg: (valid ? '' : `请最少填写${param}个字`)
            };
        },

        /**
         * 最大长度验证， 主要针对 IE9 下 textarea 的 maxlength 无效的情况
         * @param param {String} 最多输入多少个字
         */
        maxlength: function(value, input, param) {
            value = toString(value);   // value需要转换成字符串，下面用来计算length，不然数字或者0都会是invalid
            var valid = value.length <= parseInt(param);
            return {
                valid: valid,
                msg: (valid ? '' : `请最多填写${param}个字`)
            };
        },
        /**
         * 邮箱格式
         */
        emailType: function(value, input) {
            value = toString(value);   // value需要转换成字符串，为空则直接返回
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
            value = toString(value);   // value需要转换成字符串，为空则直接返回
            var pattern = /^1[3|4|5|7|8]\d{9}$/,
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
            value = toString(value);   // value需要转换成字符串，为空则直接返回
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
            let valid = false,
                msg = '请输入数字';
            if (isNaN(value)) return { valid, msg };
            var min = parseFloat(input.getAttribute('min'));
            var max = parseFloat(input.getAttribute('max'));
            min = isNaN(min) ? -Infinity : min;
            max = isNaN(max) ? Infinity : max;
            msg = value < min ? `输入值最小为${min}` :
                  value > max ? `输入值最大为${max}` : '';
            return {
                valid: !msg,
                msg: msg
            };
        },

        /**
         * 整数格式
         */
        integerType: function(value, input) {
            if (!/^\d*$/.test(toString(value))) {
                return {
                    valid: false,
                    msg: '请输入整数'
                }
            }
            return ruleset.numberType(value, input);
        }
    };

    /**
     * 对所有表单项进行一次检查
     */
    function checkAll(vm, items, NS) {

        var promise,        //包含异步检查的表单项检查结果
            valid = true,   //默认返回
            //逐个检查
            results = items.map(function(item) {
                return checkItem(vm, item, vm[item.model], NS);
            });

        for (var i = 0; i < results.length; i++) {
            if (results[i] instanceof Promise) {
                promise = results[i];
                continue;   //异步检查结果后面再说
            }
            if (results[i].valid === false) {
                valid = false;
                items[i].input.focus();
                break;
            }
        }

        if (valid && promise) { //同步结果通过，且需要等待异步
            return promise.then(function(result) {
                return result.valid;
            });
        }
        return valid;
    }

    /**
     * 检查指定表单是否符合规范并返回检查结果
     */
    function checkItem(vm, item, value, NS) {

        var ruleName,           //规则名，比如 required, minlength
            promise,            //异步验证结果
            ruleResult,         //存放单个规则的验证结果
            input = item.input, //表单项
            result = {          //检查结果
                valid: true
            },
            //将验证的结果同步到 viewmodel 中
            markResult = function (result) {
                vm[NS][item.model].valid = result.valid;
                vm[NS][item.model].msg = result.msg;
            };

        //对于不可见表单项，默认不做检查
        if (!input.offsetHeight && input.getAttribute('force-valid') === null) {
            return result;
        }

        //检查每项规则
        for (ruleName in item.rules) {
            if (!toString(value) && ruleName !== 'required') {
                ruleResult = result; // 对于非required验证，跳过空值
                continue;
            }
            ruleResult = checkRule(ruleName, value, input, item.rules[ruleName]);
            if (ruleResult instanceof Promise) {    //异步检查规则返回 Promise
                promise = ruleResult;
                continue;   //继续进行同步的检查，完成所有后再处理
            }
            result = ruleResult;
            if (!result.valid) {    //同步检查不通过，直接返回错误，结束检查
                break;
            }
        }
        if (result.valid && promise) { //浏览器端同步验证通过，且需要异步验证时
            result = promise.then(function(asyncResult) {
                markResult(asyncResult);
                return asyncResult;
            });
        } else {  //无需等待异步验证
            markResult(result);
        }
        return result;
    }

    /**
     * 检查当前值是否符合某项规范
     * @return {Object} 检查结果。字段如下：
     *      valid: 布尔型，是否符合规范
     *      msg: 错误提示，如果有
     */
    function checkRule(ruleName, value, input, param) {
        if (typeof ruleset[ruleName] !== 'function') {
            throw '验证规则 ' + ruleName + ' 不存在！';
        }
        return ruleset[ruleName](value, input, param);
    }

    /**
     * Vue.js 表单验证组件
     */


    //==================================================================
    //
    // 表单验证规则集，每条规则是一个函数
    //
    // 函数参数分别是：
    //     value {String} 用户填写或选择的值
    //     input {Node} 相关联的 input 元素
    //     param {String} 该规则对应的参数，例如最少输入的字数
    //
    // 函数返回值是一个对象，包含两个属性：
    //     valid {Bool} 是否符合规则
    //     msg {String} 不符合规则时的错误消息
    //
    // 如果验证过程是异步的，可以返回一个 Promise,
    // 该 Promise 被 resolve 的值是上面格式的对象
    //
    //==================================================================

    var VueValidator = {};

    //注册自定义规则
    VueValidator.addRule = function(ruleName, func) {
        ruleset[ruleName] = func;
    }


    //==================================================================
    //
    // 注册 Vue.js directive
    //
    //==================================================================

    VueValidator.install = function() {

        Vue.directive('validator', {

            /**
             * 初始化验证规则
             */
            bind: function() {

                var vm = this.vm,           //directive所属viewmodel
                    form = this.el,         //directive所在的表单
                    NS = this.expression,   //validator 实例的 Namespace
                    modelMap = {};          //model -> item 的对应

                //查找需要验证的输入框以及对应的 model
                var items = vm._directives.filter(function(d) {
                    //找到 form 内绑定了数据的表单元素
                    return  d.name === 'model' &&
                            ['INPUT', 'SELECT', 'TEXTAREA'].indexOf(d.el.tagName) > -1 &&
                            form.contains(d.el);
                }).map(function(d) {
                    return {
                        model: d.expression,
                        input: d.el
                    };
                });

                items.forEach(function(item) {
                    //建立规则
                    item.rules = getRules(item);
                    //处理 radio 和 checkbox
                    var type = item.input.type,
                        model = item.model;
                    if (type !== 'radio' && type !== 'checkbox') {
                        return;
                    }
                    if (modelMap[model]) { //这次处理的item和以前的有重复
                        modelMap[model].input = item.input;
                        item.duplicated = true;
                    } else {
                        modelMap[model] = item;
                    }
                });

                //过滤掉 radio 和 checkbox 重复的 item
                items = items.filter(function(item) {
                    return !item.duplicated;
                });


                //建立检查结果对象
                vm.$set(NS, {});

                items.forEach(function(item) {
                    //初始化
                    initItem(item, vm, NS);
                });

                //获取整个表单的状态
                Object.defineProperty(vm[NS], '$valid', {
                    get: function() {
                        return checkAll(vm, items, NS);
                    }
                });

            },

            /**
             * 移出事件绑定
             */
            unbind: function() {
            }
        });
    }


    /**
     * 对一个表单项进行初始化
     */
    function initItem(item, vm, NS) {

        var el = document.createElement('em');

        //监控model变化并验证
        vm.$watch(item.model, function(value) {
            checkItem(vm, item, value, NS);
        });

        //建立错误提示容器和指令
        vm.$set(NS + '.' + item.model, {
            valid: undefined,
            msg: ''
        });
        el.innerHTML = '{{' + NS + '.' + item.model + '.msg}}';
        item.input.parentNode.appendChild(el);
        vm.$compile(el);

        //表单元素的错误样式
        /** TODO: 使用 compile 的方法处理样式，中文输入时有 bug，改用 watch 的方式
        item.input.setAttribute(':class', "{'error': !" + NS + "." + item.model + ".valid}");
        vm.$compile(item.input);
        */
        vm.$watch(NS + '.' + item.model + '.valid', function(valid) {
            item.input.classList[valid === true ? 'remove': 'add']('error');
        });
    }


    /**
     * 从一个 item 获取规则
     * 可以从 input 元素属性获取
     */
    function getRules(item) {
        var rules = {},
            ruleName,
            ruleParam,
            inputType,
            input = item.input,
            model = item.model;
        for (ruleName in ruleset) {
            if (!ruleset.hasOwnProperty(ruleName)) {
                return;
            }
            inputType = input.getAttribute('data-type') || input.type;
            if (/(\w+)Type$/.test(ruleName)
                && (inputType + 'Type') === ruleName
            ) { //type验证
                rules[ruleName] = true;
                continue;
            }
            ruleParam = input.getAttribute(ruleName);
            if (ruleParam !== null) {
                rules[ruleName] = ruleParam || true;
            }
        }
        return rules;
    }

    return VueValidator;

}));