// copyright Sandro Magi 2012
// LICENSE: LGPL
var AspQ = function () {
    var queue = new Array();    // the event queue
    var inner = false;          // tracks whether we're currently processing queued event
    var sync = false;           // tracks whether we've encountered a sync event
    function pb() {
        inner = true;
        while (queue.length > 0) {
            // async updates may cause some elements to disappear, in
            // which case the events on them should be skipped
            var x = queue[0];
            if ($get(x.el.id)) {
                __doPostBack(x.el['name'] ? x.el.name : x.el.id, x.args);
                break;
            }
            queue.shift();
        }
        inner = false;
    }
    // find the form of an element x
    function gform(x) {
        if (x['form']) return x.form;
        while (x && x.nodeName != 'FORM') x = x.parentNode;
        return x;
    }
    function init(sender, args) {
        // if we're processing an inner request, don't operate on queue
        if (inner) return;
        // we're processing a new async request, so update the last entry in the queue
        var x = args.get_postBackElement();
        sync = false;  // mark request as async
        var q = queue[queue.length - 1]; q.el = x; q.args = gform(x).__EVENTARGUMENT.value;
        if (queue.length > 1) args.set_cancel(true);
    }
    function end(sender, args) {
        queue.shift();
        // schedule the next event to fire in a subsequent turn of the event loop
        // but only if we haven't yet seen a sync event
        if (!sync && queue.length > 0) setTimeout(pb, 0);
    }
    return {
        init: function () {
            if (typeof Sys !== 'undefined') {
                var reqm = Sys.WebForms.PageRequestManager.getInstance();
                reqm.add_initializeRequest(init);
                reqm.add_endRequest(end);
            }
        },
        submit: function (x) {
            if (inner) return true;   // inner events should always proceed
            if (sync) return false;  // if we encounter a sync event, ignore all subsequent events
            sync = true;              // pessimistically assume sync event (will be reset by init if async)
            queue.push({ el: '', args: '' });
            // should always return true if Sys is defined because init() needs to fire
            return typeof Sys !== 'undefined' || queue.length <= 1;
        }
    };
} ();
if (window.attachEvent) { window.attachEvent('onload', AspQ.init); }
else { window.addEventListener('load', AspQ.init, false); }
if (typeof Sys != 'undefined') {
    Sys.Application.notifyScriptLoaded();
}