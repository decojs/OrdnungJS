define("ordnung/utils",[],function(){return{toArray:function(t){for(var n=[],e=t.length>>>0;e--;)n[e]=t[e];return n},extend:function(t,n){n=n||{},t=t||{};for(var e in n)t[e]=n[e];return t}}}),define("ordnung/qvc/ExecutableResult",["ordnung/utils"],function(t){function n(n){this.success=!1,this.valid=!1,this.result=null,this.exception=null,this.violations=[],t.extend(this,n)}return n}),define("ordnung/qvc/Constraint",[],function(){function t(t,n){this.name=t,this.attributes=n,this.message=n.message,this.init(t)}return t.prototype.init=function(t){require(["ordnung/qvc/constraints/"+t],function(t){var n=new t(this.attributes);this.validate=n.isValid.bind(n)}.bind(this))},t.prototype.validate=function(){return!0},t}),define("ordnung/qvc/Validator",["ordnung/qvc/Constraint","knockout"],function(t,n){function e(){this.constraints=[],this.isValid=n.observable(!0),this.message=n.observable("")}return e.prototype.setConstraints=function(n){this.constraints=n.map(function(n){return new t(n.name,n.attributes)})},e.prototype.reset=function(){this.isValid(!0),this.message("")},e.prototype.validate=function(t){0==this.constraints.length?this.reset():this.constraints.every(function(n){return n.validate(t)?!0:(this.isValid(!1),this.message(n.message),!1)}.bind(this))&&(this.isValid(!0),this.message(""))},e}),define("ordnung/qvc/koExtensions",["ordnung/qvc/Validator","knockout"],function(t,n){null!=n&&(n.bindingHandlers.validationMessageFor={init:function(t,e){var a=e(),r=a.validator;r&&n.applyBindingsToNode(t,{hidden:r.isValid,text:r.message},r)}},n.extenders.validation=function(n,e){return n.validator=new t(n,e),n.subscribe(function(t){n.validator.validate(t)}),n},n.bindingHandlers.command=n.bindingHandlers.query={init:function(t,e,a,r){n.applyBindingsToNode(t,{click:e()},r)}})}),define("ordnung/qvc/Validatable",["ordnung/utils","ordnung/qvc/Validator","knockout","ordnung/qvc/koExtensions"],function(t,n,e){function a(t,n){for(var r in t){var i=t[r];e.isObservable(i)&&(i.extend({validation:{}}),n.push(i)),i=e.utils.unwrapObservable(i),"object"==typeof i&&a(i,n)}}function r(t,n,a){return t.split(".").reduce(function(n,r){var i=n.path,s=e.utils.unwrapObservable(n.field);if(r in s)return{field:s[r],path:i+"."+r};throw new Error(a+": "+t+"\n"+r+" is not a member of "+i+"\n"+i+" = `"+e.toJSON(s)+"`")},{field:n,path:"parameters"}).field}function i(t,n,e){var a=r(n,t,"Error applying violation");if(!("string"==typeof e&&"validator"in a))throw new Error("Error applying violation\n"+n+" is not validatable\nit should be an observable");a.validator.isValid(!1),a.validator.message(e)}function s(t,n){t.validator.isValid(!1);var e=t.validator.message(),a=0==e.length?n:e+", "+n;t.validator.message(a)}function o(t,e,r){var i=this;this.validator=new n,this.validatableFields=[],this.validatableParameters=e,a(i.validatableParameters,i.validatableFields),r&&r.applyValidationConstraints(t,i)}return o.prototype.isValid=function(){return this.validatableFields.every(function(t){return t.validator&&t.validator.isValid()})&&this.validator.isValid()},o.prototype.applyViolations=function(t){t.forEach(function(t){var n=t.message,e=t.fieldName;e.length>0?i(this.validatableParameters,e,n):s(this,n)}.bind(this))},o.prototype.applyConstraints=function(t){var n=this.validatableParameters;t.forEach(function(t){var a=t.name,i=t.constraints,s=r(a,n,"Error applying constraints to field");if(!(e.isObservable(s)&&"validator"in s))throw new Error("Error applying constraints to field: "+a+"\n"+"It is not an observable or is not extended with a validator. \n"+a+"=`"+e.toJSON(s)+"`");s.validator.setConstraints(i)})},o.prototype.validate=function(){this.validator.validate(!0),this.validator.isValid()&&this.validatableFields.forEach(function(t){var n=t.validator;n&&n.validate(t())})},o.prototype.clearValidationMessages=function(){this.validator.reset(),this.validatableFields.forEach(function(t){var n=t.validator;n&&n.reset()})},o}),define("ordnung/qvc/Executable",["ordnung/qvc/ExecutableResult","ordnung/qvc/Validatable","ordnung/utils","knockout"],function(t,n,e,a){function r(r,i,s,o,u){var c=this;this.name,this.type,this.isBusy=a.observable(!1),this.hasError=a.observable(!1),this.result=new t,this.parameters={},this.callbacks={beforeExecute:function(){},canExecute:function(){return!0},error:function(){},success:function(){},result:function(){},complete:function(){}},this.execute=function(){c.onBeforeExecute()!==!1&&u.execute(c)},this.onBeforeExecute=function(){return c.isBusy()?!1:(c.hasError(!1),c.callbacks.beforeExecute(),c.validate(),c.isValid()?c.callbacks.canExecute()===!1?!1:(c.isBusy(!0),!0):!1)},this.onError=function(){c.hasError(!0),"violations"in c.result&&c.applyViolations(c.result.violations),c.callbacks.error(c.result)},this.onSuccess=function(){c.hasError(!1),c.clearValidationMessages(),c.callbacks.success(c.result),c.callbacks.result(c.result.result)},this.onComplete=function(){c.hasError()||(c.callbacks.complete(c.result),c.clearValidationMessages()),c.isBusy(!1)},c.name=r,c.type=i,e.extend(c.parameters,s),e.extend(c.callbacks,o),e.extend(c,new n(c.name,c.parameters,u.constraintResolver))}return r.Command="command",r.Query="query",r}),define("ordnung/ajax",[],function(){function t(t){var n=[];for(var e in t){var a=t[e];n.push(e+"="+encodeURIComponent(a))}return n.join("&")}function n(t,n,e){return t+(t.match(/\?/)?t.match(/&$/)?"":"&":"?")+encodeURIComponent(n)+"="+encodeURIComponent(e)}function e(t,n){return t+(t.match(/\/$/)?"":"/")+n}function a(e,a,r,i){var s=new XMLHttpRequest,o="POST"===r,u=null;return a&&(o?u=t(a):e+="?"+t(a)),o&&(e=n(e,"cacheKey",Math.floor(1e4*Math.random()))),s.open(o?"POST":"GET",e,!0),o&&u&&(s.setRequestHeader("Content-type","application/x-www-form-urlencoded"),s.setRequestHeader("Content-length",u.length),s.setRequestHeader("Connection","close")),s.onreadystatechange=function(){4==s.readyState&&i(s)},s.send(u),s}return a.addParamToUrl=n,a.addToPath=e,a}),define("ordnung/qvc/ConstraintResolver",[],function(){function t(t,n){for(var e=0;e<n.length;e++)if(n[e].name==t)return n[e];return!1}function n(n,e){var a=t(n,this.constraints);a&&(a.validatables.forEach(function(t){t.applyConstraints(e)}),a.fields=e,a.state="loaded")}function e(t){this.qvc=t,this.constraints=[]}return e.prototype.applyValidationConstraints=function(e,a){var r=t(e,this.constraints);0==r?(this.constraints.push({name:e,state:"loading",validatables:[a]}),this.qvc.loadConstraints(e,n.bind(this))):"loading"===r.state?r.validatables.push(a):a.applyConstraints(r.fields)},e}),define("ordnung/qvc",["ordnung/qvc/Executable","ordnung/qvc/ExecutableResult","ordnung/utils","ordnung/ajax","ordnung/qvc/ConstraintResolver","knockout","ordnung/qvc/koExtensions"],function(t,n,e,a,r,i){function s(){var t=this;this.constraintResolver=new r(t),this.execute=function(e){var r=i.toJS(e.parameters),s={parameters:JSON.stringify(r),csrfToken:t.config.csrf},o=a.addToPath(t.config.baseUrl,e.type+"/"+e.name);a(o,s,"POST",function(t){200===t.status?(e.result=new n(JSON.parse(t.responseText||"{}")),e.result.success===!0?e.onSuccess():e.onError()):(e.result=new n({exception:{message:t.responseText,cause:t}}),e.onError()),e.onComplete()})},this.loadConstraints=function(n,e){var r=a.addToPath(t.config.baseUrl,"constraints/"+n);a(r,null,"GET",function(t){if(200===t.status){try{var a=JSON.parse(t.responseText||'{"parameters":[]}');0=="parameters"in a&&(a.parameters=[])}catch(r){var a={parameters:[]}}e(n,a.parameters)}})},this.config={baseUrl:"/",csrf:""}}function o(n,e,a,r){if(null==n||0==n.length)throw new Error(e+" is missing name\nA "+e+" must have a name!\nusage: createCommand('name', [parameters, callbacks])");var s=new t(n,e,a||{},r||{},u),o=s.execute.bind(s);return o.isValid=i.computed(function(){return s.isValid()}),o.isBusy=i.computed(function(){return s.isBusy()}),o.hasError=i.computed(function(){return s.hasError()}),o.success=function(t){return s.callbacks.success=t,o},o.error=function(t){return s.callbacks.error=t,o},o.beforeExecute=function(t){return s.callbacks.beforeExecute=t,o},o.canExecute=function(t){return s.callbacks.canExecute=t,o},o.result=function(){return 1==arguments.length?(s.callbacks.result=arguments[0],o):s.result.result},o.complete=function(t){return s.callbacks.complete=t,o},o.clearValidationMessages=s.clearValidationMessages.bind(s),o}var u=new s;return{createCommand:function(n,e,a){return o(n,t.Command,e,a)},createQuery:function(n,e,a){return o(n,t.Query,e,a)},config:function(t){e.extend(u.config,t)}}}),define("ordnung/loader",["ordnung/utils","knockout"],function(t,n){return function(e){t.toArray((e||document.body).querySelectorAll("*[data-viewmodel]")).forEach(function(t){var e=t.getAttribute("data-viewmodel"),a=t.getAttribute("data-initObject");a&&0==a.indexOf("{")&&(a=JSON.parse(a)),require([e],function(e){var r=new e(a);n.applyBindings(r,t)})})}}),define("ordnung/proclaimWhen",[],function(){function t(t,n,e){n.subscribers.forEach(function(t){t.apply(t,e)})}function n(t,n,e){n.subscribers.push(e)}function e(t,n,e){var a=n.subscribers.indexOf(e);n.subscribers.splice(a,1)}function a(a,r){r.subscribers=[];var i=function(){1==arguments.length&&"function"==typeof arguments[0]?n(a,r,arguments[0]):t(a,r,arguments)};return i.dont=function(t){e(a,r,t)},i}function r(t){for(var n in t)t[n]=a(n,t[n]);return t}return{extend:r}});
//# sourceMappingURL=ordnung.js.map