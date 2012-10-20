// copyright Sandro Magi 2012
// LICENSE: LGPL
var AspQ = function () {
    var queue = new Array();
    var inner = false;
    var async = true;
    function pb() {
        inner = true;
        while (queue.length > 0) {
            var x = queue[0];
            if ($get(x.el.id)) {
                __doPostBack(x.el['name'] ? x.el.name : x.el.id, x.args);
                break;
            }
            queue.shift();
        }
        inner = false;
    }
    function gform(x) {
        if (x['form']) return x.form;
        while (x && x.nodeName != 'FORM') x = x.parentNode;
        return x;
    }
    function init(sender, args) {
        var x = args.get_postBackElement();
        if (inner && x == queue[0].el) return;
        async = true;
        queue[queue.length - 1] = { el: x, args: gform(x).__EVENTARGUMENT.value };
        if (queue.length > 1) args.set_cancel(true);
    }
    function end(sender, args) {
        queue.shift();
        if (async && queue.length > 0) setTimeout(pb, 0);
    }
    return {
        init: function () {
            if (typeof Sys !== 'undefined') {
                var reqm = Sys.WebForms.PageRequestManager.getInstance();
                reqm.add_initializeRequest(init);
                reqm.add_endRequest(end);
            }
        },
        submit: function (form) {
            if (inner) return true;
            if (!async) return false;
            async = false;
            queue.push({ el: '', args: '' });
            return typeof Sys !== 'undefined' || queue.length <= 1;
        }
    };
} ();
if (window.attachEvent) { window.attachEvent('onload', AspQ.init); }
else if (window.addEventListener) { window.addEventListener('load', AspQ.init, false); }
else { window.addEventListener('load', AspQ.init, false); }
if (typeof Sys != 'undefined') {
    Sys.Application.notifyScriptLoaded();
}