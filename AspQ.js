var AspQ = function () {
    var queue = new Array();
    var inner = false;
    var async = true;
    function pb() { inner = true; __doPostBack(queue[0].id, queue[0].args); inner = false; }
    function gform(id) {
        var x = $get(id);
        if (x['form']) return x.form;
        while (x && x.nodeName != 'FORM') x = x.parentNode;
        return x;
    }
    function init(sender, args) {
        async = true;
        var id = args.get_postBackElement().id;
        queue[queue.length - 1] = { id: id, args: gform(id).__EVENTARGUMENT.value };
        if (queue.length > 1) args.set_cancel(true);
    }
    function end(sender, args) {
        queue.shift();
        if (async) setTimeout(pb, 0);
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
            queue.push({ id: '', args: '' });
            return typeof Sys !== 'undefined' || queue.length <= 1;
        }
    };
} ();