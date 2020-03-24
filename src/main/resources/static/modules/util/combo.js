/**
 * combo - css fed - weijy
 */

/**
    // options
    var options = {
        id: "",                     // input
        key: {                      // key
            idKey: "id",            // idKey
            textKey: "text"         // textKey
        },
        multi: false,               // single select or multi select
        readonly: "",               // readonly
        placeholder: "",            // placeholder
        event: {},                  // events obj
        panelWidth: "",             // panelWidth
        panelMinWidth: "",          // panelMinWidth
        panelMaxWidth: "",          // panelMaxWidth
        panelHeight: "",            // panelHeight
        panelMinHeight: "",         // panelMinHeight
        panelMaxHeight: ""          // panelMaxHeight
    }

    // events
    var events = {
        onShowPanel: null,          // fire when drop down panel show
        onHidePanel: null,          // fire when drop down panel hide
        onChange: null,             // fire when the value is Changed and the drop down panel is hide
        onRemove: null,             // fire when remove one item
        onClear: null               // fire when clear all item
    }

    // methods
    var methods = {
        showPanel: null,            // show the drop down panel
        hidePanel: null,            // hide the drop down panel
        getPanel: null,             // return the drop down panel jqObj
        //readonly: null,             // readonly mode
        //destroy: null,              // destroy
        clear: null,                // clear the value
        //reset: null,                // reset the value
        setValue: null,             // set value
        getValue: null              // return value
    }

 */
define(["jquery"], function(){

    function init(options) {
        if (!options.id) {
            console.log("Combo: the id prop is required");
            return ;
        }

        var combo = new Combo(options);

        cache[options.id] = combo;

        return combo;
    }

    // combo obj cache
    var cache = {};
    // event const
    var Constants = {
        EVENT_MOUSEUP: "mouseup",
        EVENT_FOCUS: "focus",
        EVENT_CLICK: "click"
    };

    // get combo from cache
    init.getCombo = function(id) {
        return cache[id];
    };

    // get class
    init.getClass = function() {
        return Combo;
    };

    function Combo(options) {
        var _this = this;

        var defaultOpts = {
            id: "",                     // input
            key: {                      // key
                idKey: "id",            // idKey
                textKey: "name"         // textKey
            },
            multi: false,               // single select or multi select
            readonly: false,            // readonly
            value: [],                  // init value
            event: {},                  // event obj
            placeholder: "",            // placeholder
            panelWidth: "",             // panelWidth
            panelMinWidth: "",          // panelMinWidth
            panelMaxWidth: "",          // panelMaxWidth
            panelHeight: "",            // panelHeight
            panelMinHeight: "100",      // panelMinHeight
            panelMaxHeight: "260"       // panelMaxHeight
        };

        _this.options = $.extend(true, defaultOpts, options);

        Combo.render.call(_this);
    }

    // set constructor
    Combo.prototype.constructor = Combo;

    Combo.render = function() {
        var _this = this,
            options = _this.options;

        // _vars
        var vars = _this._vars = {};

        // $input
        var $input = vars.$input = $("#" + options.id);

        // readonly
        var readonly = vars.readonly = options.readonly || $input.is("input:disabled, input[readonly]");

        // component id
        var cid = vars.cid = "combo_" + options.id;

        // template
        if (!$input.parent().is(".cs-combo-wrapper")) {
            // $wrap
            $input.addClass("cs-combo-input").wrap('<div class="cs-combo-wrapper" id="' + cid + '"></div>');
            var $wrap = vars.$wrap = $input.parent();

            // $content
            if (options.multi) {
                $wrap.addClass("multi");
                vars.$content = $('<div class="cs-combo-content"></div>').appendTo($wrap);
            }

            // $clear
            if (readonly) {
                $wrap.addClass("readonly");
            } else {
                vars.$clear = $('<div class="cs-combo-clear"><i class="fa fa-trash-o"></i></div>').appendTo($wrap);
            }

            // $placeholder
            if (options.placeholder) {
                vars.$placeholder = $('<div class="cs-combo-placeholder"></div>').appendTo($wrap);
            }

            // $panel
            vars.$panel = $('<div class="cs-combo-panel" data-for="' + cid + '"></div>').appendTo($(document.body));
        } else {
            vars.$wrap = $input.parent();
            vars.$content = vars.$wrap.find(".cs-combo-content");
            vars.$clear = vars.$wrap.find(".cs-combo-clear");
            vars.$placeholder = vars.$wrap.find(".cs-combo-placeholder");
            vars.$panel = $(document.body).find(".cs-combo-panel[data-for=" + cid + "]");
        }

        // $placeholder
        if (vars.$placeholder) {
        	vars.$placeholder.html(options.placeholder);
        	vars.$placeholder.css("line-height", vars.$placeholder.height() + "px");
        }

        // $panel
        options.panelWidth ? vars.$panel.css("width", parseInt(options.panelWidth) + "px") : false;
        options.panelMinWidth ? vars.$panel.css("min-width", parseInt(options.panelMinWidth) + "px") : false;
        options.panelMaxWidth ? vars.$panel.css("max-width", parseInt(options.panelMaxWidth) + "px") : false;
        options.panelHeight ? vars.$panel.css("height", parseInt(options.panelHeight) + "px") : false;
        options.panelMinHeight ? vars.$panel.css("min-height", parseInt(options.panelMinHeight) + "px") : false;
        options.panelMaxHeight ? vars.$panel.css("max-height", parseInt(options.panelMaxHeight) + "px") : false;
        Combo.panelZIndex.call(_this);

        // init value
        Combo.initValue.call(_this);

        // bind event
        Combo.bindEvent.call(_this);
    };

    Combo.initValue = function() {
        var _this = this,
            options = _this.options,
            vars = _this._vars;

        var value = vars.value = [].concat(options.value);
        vars.lastValue = [].concat(options.value);

        /*
        if (value && value.length > 0) {
            Combo.setValue.call(_this, value);
        }
        */
    };

    Combo.bindEvent = function() {
        var _this = this,
            options = _this.options,
            vars = _this._vars,
            readonly = vars.readonly,
            $wrap = vars.$wrap,
            $input = vars.$input,
            $content = vars.$content,
            $clear = vars.$clear,
            $placeholder = vars.$placeholder;
        
        if (!readonly) {
        	 $input.on(Constants.EVENT_MOUSEUP, function(event) {
                 Combo.togglePanel.call(_this);
             });
        }
        $input.on(Constants.EVENT_FOCUS, function(event) {
            $input.blur();
        });
        
        if ($content) {
    		 $content.on(Constants.EVENT_MOUSEUP, ".remove", function(event) {
	            event.stopPropagation();
	            
	            if (!readonly)
	            	Combo.removeValue.call(_this, $(this).closest(".cs-combo-content-item").attr("data-id"));
	        });
        	$content.on(Constants.EVENT_MOUSEUP, function() {
        		$input[Constants.EVENT_MOUSEUP]();
        	});
        }

        $placeholder && $placeholder.on(Constants.EVENT_MOUSEUP, function(event) {
            $input[Constants.EVENT_MOUSEUP]();

            event.preventDefault();
            return false;
        });

        $clear && $clear.on(Constants.EVENT_MOUSEUP, function(event) {
           Combo.clear.call(_this);
        });

        $wrap.on("showPanel", function(e) {
            typeof options.event.onShowPanel == "function" && options.event.onShowPanel();
        }).on("hidePanel", function(e) {
            typeof options.event.onHidePanel == "function" && options.event.onHidePanel();
        }).on("onChange", function(e) {
            typeof options.event.onChange == "function" && options.event.onChange(vars.value, vars.lastValue);
        }).on("isDataChanged", function(e) {
            if (Combo.isDataChanged.call(_this)) {
                $wrap.trigger("onChange");
                // reset value
                vars.lastValue = [].concat(vars.value);
            }
        }).on("onRemove", function(e, value) {
            typeof options.event.onRemove == "function" && options.event.onRemove(value);
        }).on("onClear", function(e) {
            typeof options.event.onClear == "function" && options.event.onClear();
        });

        // Combo.readonly.call(_this, readonly);
    };

    Combo.bindDocumentEvent = function() {
        var _this = this,
            cid = _this._vars.cid,
            $wrap = _this._vars.$wrap,
            $panel = _this._vars.$panel;

        $(document).on(Constants.EVENT_MOUSEUP + "." + cid, function(event){
            if(!($wrap.is(event.target) || $wrap.has(event.target).length)
                && !($panel.is(event.target) || $panel.has(event.target).length)){
                Combo.hidePanel.call(_this);
            }
        });
    };

    Combo.unbindDocumentEvent = function() {
        var _this = this,
            cid = _this._vars.cid;

        $(document).off(Constants.EVENT_MOUSEUP + "." + cid);
    };

    Combo.bindWindowResizeEvent = function() {
        var _this = this,
            cid = _this._vars.cid;

        $(window).on("resize" + "." + cid, function(){
            Combo.panelPlaceAt.call(_this);
        });
    };

    Combo.unbindWindowResizeEvent = function(){
        var _this = this,
            cid = _this._vars.cid;

        $(window).off("resize" + "." + cid);
    };

    Combo.bindWindowScrollEvent = function() {
        var _this = this,
            cid = _this._vars.cid;

        var t = null;
        $(document).on(
            'DOMMouseScroll.' + cid + ' mousewheel.' + cid + ' scroll.' + cid,
            function(){
                window.clearTimeout( t );
                t = window.setTimeout( function(){
                    Combo.panelPlaceAt.call(_this);
                }, 300 );
            }
        );
    };

    Combo.unbindWindowScrollEvent = function(){
        var _this = this,
            cid = _this._vars.cid;

        $(document).off('DOMMouseScroll.' + cid + ' mousewheel.' + cid + ' scroll.' + cid);
    };

    Combo.togglePanel = function() {
        var _this = this,
            $panel = _this._vars.$panel;

        $panel.is(":visible") ? Combo.hidePanel.call(_this) : Combo.showPanel.call(_this);
    };

    Combo.showPanel = Combo.prototype.showPanel = function() {
        var _this = this,
            vars = _this._vars,
            $wrap = _this._vars.$wrap,
            $panel = _this._vars.$panel;

        Combo.panelPlaceAt.call(_this);
        $panel.show();

        $wrap.trigger("showPanel");

        Combo.bindDocumentEvent.call(_this);
        Combo.bindWindowResizeEvent.call(_this);
        Combo.bindWindowScrollEvent.call(_this);

        // set lastValue
        vars.lastValue = [].concat(vars.value);
    };

    Combo.hidePanel = Combo.prototype.hidePanel = function() {
        var _this = this,
            vars = _this._vars,
            $wrap = _this._vars.$wrap,
            $panel = _this._vars.$panel;

        $panel.hide();

        $wrap.trigger("hidePanel");

        Combo.unbindDocumentEvent.call(_this);
        Combo.unbindWindowResizeEvent.call(_this);
        Combo.unbindWindowScrollEvent.call(_this);

        $wrap.trigger("isDataChanged");
    };

    Combo.readonly = Combo.prototype.readonly = function(readonly) {
        var _this = this;

        // readonly = typeof readonly == "undefined" ? true : false;
    };

    Combo.panelPlaceAt = function() {
        var _this = this,
            options = _this.options,
            $panel = _this._vars.$panel,
            $input = _this._vars.$input;

        var position = $input.offset();
        var left = position.left;
        var top = position.top + $input.outerHeight() - 2; // -2
        $panel.css({
            "left": left,
            "top": top
        });

        // width auto
        options.panelWidth ? false : $panel.css("width", $input.outerWidth() + "px");
    };

    Combo.panelZIndex = function() {
        var _this = this,
            $panel = _this._vars.$panel;

        var index_highest = 0;
        $('div').each(function () {
            var index_current = parseInt($(this).css('zIndex'), 10);
            if (index_current > index_highest) {
                index_highest = index_current;
            }
        });
        $panel.css("z-index", index_highest + 10);
    };

    Combo.prototype.getPanel = function() {
        var _this = this,
            vars = _this._vars;

        return vars.$panel;
    };

    Combo.prototype.destroy = function() {
        var _this = this;

    };

    Combo.clear = Combo.prototype.clear = function() {
        var _this = this,
            $wrap = _this._vars.$wrap;

        Combo.setValue.call(_this, []);
        $wrap.trigger("onClear");
    };

    /*
    Combo.prototype.reset = function() {
        var _this = this;

        Combo.initValue.call(_this);
    }
    */

    Combo.setValue = Combo.prototype.setValue = function(value) {
        var _this = this,
            options = _this.options,
            vars = _this._vars,
            $panel = vars.$panel,
            $wrap = vars.$wrap;

        vars.value = value || [];

        Combo.fillContent.call(_this);

        if ($panel.is(":hidden")) {
            $wrap.trigger("isDataChanged")
        }
    };

    Combo.fillContent = function() {
        var _this = this,
            options = _this.options,
            key = options.key,
            vars = _this._vars,
            value = vars.value,
            $content = vars.$content,
            $wrap = vars.$wrap,
            $input = vars.$input;

        value.length > 0 ? $wrap.addClass("hasValue") : $wrap.removeClass("hasValue");

        options.multi ? $content.empty() : false;

        var textArr = [];
        if (value && value.length > 0) {
            var valueActual;

            if (options.multi) {
                valueActual = [].concat(value);
            } else {
                valueActual = [].concat(value[0]); // get the first one
            }

            for (var i = 0; i < valueActual.length; i++) {
                var v = valueActual[i];

                textArr.push(v[key.textKey]);

                if (options.multi) {
                    $content.append('<a class="cs-combo-content-item" data-id="' + v[key.idKey] + '">' + (v[key.textKey] || "") + '<span class="remove">x</span></a>');
                }
            }
        }

        $input.val(textArr.join(","));
    };

    Combo.removeValue = function(id) {
        var _this = this,
            key = _this.options.key,
            value = _this._vars.value,
            $wrap = _this._vars.$wrap;

        var valueCopy = [].concat(value);

        var target;

        for (var i = 0; i < valueCopy.length; i++) {
            if (id == valueCopy[i][key.idKey]) {
                target = valueCopy[i];
                valueCopy.splice(i, 1);
            }
        }

        Combo.setValue.call(_this, valueCopy);

        $wrap.trigger("onRemove", [target]);
    };

    Combo.prototype.getValue = function() {
        var _this = this,
            vars = _this._vars;

        return vars.value;
    };

    Combo.isDataChanged = function() {
        var _this = this,
            key = _this.options.key,
            vars = _this._vars,
            o = vars.lastValue,
            n = vars.value;

        if (o.length != n.length) return true;

        var mapO = {},
            mapN = {};

        for (var i = 0; i < o.length; i++) {
            mapO[o[i][key.idKey]] = o[i];
            mapN[n[i][key.idKey]] = n[i];
        }

        for (var i in mapO) {
            if (typeof mapN[i] == "undefined") return true;
        }

        return false;
    };

    return init;
});