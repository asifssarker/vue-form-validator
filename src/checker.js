/**
 * 按照规则对指定表单项及填写值进行检查
 */

import ruleSet from './ruleset';
import {toString} from './util'

export {checkAll, checkItem, checkRule};

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
    if (typeof ruleSet[ruleName] !== 'function') {
        throw '验证规则 ' + ruleName + ' 不存在！';
    }
    return ruleSet[ruleName](value, input, param);
}

