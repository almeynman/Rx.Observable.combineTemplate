'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var combineTemplate = function combineTemplate() {
  var _Rx$Observable;

  var template = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var streams = [];
  var funcs = [];
  var current = function current(ctxStack) {
    return ctxStack[ctxStack.length - 1];
  };
  var setValue = function setValue(ctxStack, key, value) {
    return current(ctxStack)[key] = value;
  };
  var applyStreamValue = function applyStreamValue(key, index) {
    return function (ctxStack, values) {
      return setValue(ctxStack, key, values[index]);
    };
  };
  var mkContext = function mkContext(value) {
    return Array.isArray(value) ? [] : {};
  };
  var pushContext = function pushContext(key, value) {
    return function (ctxStack) {
      var newContext = mkContext(value);
      setValue(ctxStack, key, newContext);
      return ctxStack.push(newContext);
    };
  };
  var constantValue = function constantValue(key, value) {
    return function (ctxStack) {
      return setValue(ctxStack, key, value);
    };
  };
  var compile = function compile(value, key) {
    if (value && value.subscribe && value.publish) {
      streams.push(value);
      return funcs.push(applyStreamValue(key, streams.length - 1));
    } else if (value && (value.constructor === Object || value.constructor === Array)) {
      var popContext = function popContext(ctxStack) {
        return ctxStack.pop();
      };
      funcs.push(pushContext(key, value));
      compileTemplate(value);
      return funcs.push(popContext);
    } else {
      return funcs.push(constantValue(key, value));
    }
  };
  var compileTemplate = function compileTemplate(template) {
    if (Array.isArray(template)) {
      template.forEach(compile);
    } else {
      Object.keys(template).forEach(function (key) {
        return compile(template[key], key);
      });
    }
  };
  var combinator = function combinator() {
    for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
      values[_key] = arguments[_key];
    }

    var rootContext = mkContext(template);
    var ctxStack = [rootContext];
    for (var i = 0, f; i < funcs.length; i++) {
      f = funcs[i];
      f(ctxStack, values);
    }
    return rootContext;
  };

  compileTemplate(template);
  return (_Rx$Observable = _rx2.default.Observable).combineLatest.apply(_Rx$Observable, streams.concat([combinator]));
};

exports.default = combineTemplate;
