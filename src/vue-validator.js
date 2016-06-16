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

//模块输出
export default VueValidator;

//内置检查规则
import ruleSet from './ruleset.js';

//检查函数
import {checkAll, checkItem, checkRule} from './checker.js';

//注册自定义规则
VueValidator.addRule = function(ruleName, func) {
    ruleSet[ruleName] = func;
}


//==================================================================
//
// 注册 Vue.js directive
//
//==================================================================

VueValidator.install = function(Vue) {

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
        //item.input.classList[valid === true ? 'remove': 'add']('error');
        var cls = item.input.className;
        if (valid === true) {
            item.input.className = cls.replace('error', '');
        } else {
            item.input.className = cls + 'error';
        }
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
    for (ruleName in ruleSet) {
        if (!ruleSet.hasOwnProperty(ruleName)) {
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

