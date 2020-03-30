/**
 * combotree - css fed - weijy
 *
 * dependencies
 * combo ztree
 */

/**
    // options
    var options = {
        combo: {},                      // combo options
        ztree: {},                      // ztree options
        data: [],                       // local data for ztree
        data: {                         // the remote data config
            url: "",                    // the request url
            param: {},                  // the request param
            success: null,              // load data success
            error: null                 // load data error
        },
        //dataFilter: "",                 // define how to filter the data
        formatter: null,                  // define how to render the data
        value: "",                      // init value ("" ,)
        value: [""]                     // init value ([""])
        value: [{}],                    // init value ([{}]);
        search: {
            enable: false,              // enable the search or not
            //placeholder: "",            // placeholder
            fields: []                  // define what fields to search
        }
    }

    // events
    var events = {
        onSelect: null,                 // fire when user select a item
        onUnSelect: null,               // fire when user unSelect a item
        onLoadSuccess: null             // load remote data success
    }

    // methods
    var methods = {
        getCombo: null,                 // return the combo obj
        getZtree: null,                 // return the ztree obj
        //getData: null,                  // return the ztree data
        setData: null,                  // load local data for ztree
        loadData: null,                 // load remote data for ztreer
        clear: null,                    // clear the value
        //reset: null,                    // reset the value
        setValue: null                  // set value
    }
 */
define(["PDUtilDir/combo", "jquery", "ZTree", "ZTreeExhide", "css!ZTreeCss"], function(Combo){

    function init(options) {
        var combotree = new Combotree(options);

        cache[options.id] = combotree;

        return combotree;
    }

    // combo obj cache
    var cache = {};
    // event const
    var Constants = {
        EVENT_MOUSEUP: "mouseup",
        EVENT_KEYUP: "keyup",
        EVENT_FOCUS: "focus",
        EVENT_CLICK: "click"
    };

    init.getCombotree = function(id) {
        return cache[id];
    };

    function Combotree(options) {
        var _this = this,
            vars = _this._vars = {};

        var defaultOpts = {
            combo: {},                              // combo options
            ztree: {                                // ztree options
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                check: {
                    chkboxType: {
                    	'Y': '',
                    	'N': ''
                    }    // 默认不关联父子节点
                },
                callback: {}
            },
            data: [],                               // local data for ztree
            dataFilter: "",                         // define how to filter the data
            formatter: "",                          // define how to render the data
            search: {
                enable: false,                      // enable the search or not
                placeholder: "搜索",                // search input placeholder
                fields: []                         // define what fields to search
            }
        };

        _this.options = $.extend(true, defaultOpts, options);

        // 备份用户设置的callback
        try {
	        var onCheckFun = _this.options.ztree.callback.onCheck;  
	        var onClickFun = _this.options.ztree.callback.onClick;
	        var onAsyncSuccessFun = _this.options.ztree.callback.onAsyncSuccess;
	        var onRemoveFun = _this.options.combo.event.onRemove;
	        var onClearFun = _this.options.combo.event.onClear;
	        var onHidePanelFun = _this.options.combo.event.onHidePanel;
        } catch(e) {}

        _this.options = $.extend(true, _this.options, {
            combo: {
                event: {
                    onRemove: function(value) {
                        Combotree.onRemove.call(_this, value);
                        // 执行用户设置的onRemove
                        typeof onRemoveFun == "function" && onRemoveFun(value);
                    },
                    onClear: function() {
                        Combotree.onClear.call(_this);
                        // 执行用户设置的onClear
                        typeof onClearFun == "function" && onClearFun();
                    },
                    onHidePanel: function() {
                        Combotree.onHidePanel.call(_this);
                        // 执行用户设置的onHidePanel
                        typeof onHidePanelFun == "function" && onHidePanelFun();
                    }
                }
            },
            ztree: {
                check: {
                    enable: _this.options.combo.multi // check由multi属性决定，不由用户设置的check决定
                },
                callback: {
                    onCheck : function (event, treeId, treeNode) {
                    	//每次清空值，并重新渲染所有check的节点
                    	var checkedNodes = vars.treeObj.getCheckedNodes(true);
                    	Combotree.onClear.call(_this);
                        //Combotree.checkNode.call(_this, treeNode, treeNode.checked);
                    	Combotree.checkNode.call(_this, checkedNodes, true);
                        
                        // 执行用户设置的onCheck
                        typeof onCheckFun == "function" && onCheckFun(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode, clickFlag) {
                    	if(vars.multi){ // 多选
                    		vars.treeObj.checkNode(treeNode, !treeNode.checked, true, true);
                    	}else{ // 单选
                    		if (false == treeNode.nocheck && false == treeNode.chkDisabled) { // 如果设置了nocheck或者chkDisabled，那么不进行选择
                    			_this.setValue(treeNode[vars.idKey]);
                    		}
                    		vars.combo.hidePanel();
                    	}
                        // 执行用户设置的onClick
                        typeof onClickFun == "function" && onClickFun(event, treeId, treeNode, clickFlag);
                    },
                    onAsyncSuccess: function(event, treeId, treeNode, msg) {
                        Combotree.research.call(_this);
                        // 执行用户设置的onAsyncSuccess
                        typeof onAsyncSuccessFun == "function" && onAsyncSuccessFun(event, treeId, treeNode, msg);
                    }
                }
            }
        });

        // key
        vars.idKey = _this.options.combo.key.idKey;
        vars.textKey = _this.options.combo.key.textKey;
        
        // multi
        vars.multi = _this.options.combo.multi;
        
        Combotree.render.call(_this);
    }

    Combotree.render = function() {
        var _this = this,
            options = _this.options,
            options_combo = options.combo,
            vars = _this._vars;

        // combo
        var combo = vars.combo = Combo(options_combo);
        // combo $panel
        var $panel = combo.getPanel();

        // $combotree
        var $combotree = $('<div class="cs-combotree"></div>').appendTo($panel);

        // search
        if (options.search && options.search.enable) {
            vars.$search = $('<input class="form-control cs-combotree-search" />').appendTo($combotree);
        }

        // ztree id
        var treeid = vars.treeid = "ztree_" + options_combo.id;

        // $ztree
        vars.$ztree = $('<div id="' + treeid + '" class="ztree"></div>').appendTo($combotree);

        // render tree
        Combotree.renderZtree.call(_this);
    }

    Combotree.renderZtree = function() {
        var _this = this,
            options = _this.options,
            data = options.data,
            vars = _this._vars;

        // async
        vars.async = false;
        try {
            vars.async = options.async.enable;
        } catch(e) {}

        // afterRender
        function afterRenderZtree() {
            Combotree.bindEvent.call(_this);

            if (options.value && options.value.length > 0)
                Combotree.setValue.call(_this, options.value);
        }

        if (typeof data == "undefined" || $.isArray(data)) {
            data = data || [];
            Combotree.setData.call(_this, data);
            afterRenderZtree();
        } else if (typeof data == "object") {
            Combotree.loadData.call(_this, data).done(function() {
                afterRenderZtree();
            });
        }

    }

    Combotree.setData = Combotree.prototype.setData = function(data, callback) {
        var _this = this,
            vars = _this._vars,
            $ztree = vars.$ztree,
            treeid = vars.treeid,
            options_tree = _this.options.ztree;

        data = vars.data = [].concat(data);

        // destroy
        $.fn.zTree.destroy(treeid);

        // formatter
        Combotree.format.call(_this);

        // init
        vars.treeObj = $.fn.zTree.init($ztree, options_tree, data);
    }

    Combotree.format = function() {
        var _this = this,
            options = _this.options,
            options_tree = options.ztree,
            vars = _this._vars,
            data = vars.data;

        var formatter = options.formatter;

        if (typeof formatter == "function" && data && data.length > 0) {
            if (options_tree.data.simpleData.enable) {
                for (var i=0; i<data.length; i++) {
                    formatter(data[i]);
                }
            } else {
                var childKey = "children";
                try {
                    childKey = options_tree.data.key.children;
                } catch(e) {}

                function f(value) {
                    formatter(value);

                    var children = value[childKey];
                    if (children && children.length > 0) {
                        for (var i=0; i<children.length; i++) {
                            f(children[i]);
                        }
                    }
                }

                for (var i=0; i<data.length; i++) {
                    f(data[i]);
                }
            }
        }
    }


    Combotree.loadData = Combotree.prototype.loadData = function(data) {
        var _this = this,
            vars = _this._vars;

        var remote = vars.remote = $.extend({
            url: "",                    // the request url
            param: {},                  // the request param
            success: null,              // load data success
            error: null                 // load data error
        }, data);

        var deferred =
            $.ajax({
                url: remote.url,
                param: remote.param,
                success: function(data) {
                    // 执行开发人员自定义回调
                    typeof remote.success == "function" && remote.success(data);
                    
                    // setData
                    Combotree.setData.call(_this, data);
                },
                error: function() {
                    typeof remote.error == "function" && remote.error();
                }
            });

        return deferred;
    }

    /*
    Combotree.getData = Combotree.prototype.getData = function() {
        var _this = this,
            vars = _this._vars;

        return vars.data;
    }
    */

    Combotree.setValue = Combotree.prototype.setValue = function(value) {
        var _this = this,
            vars = _this._vars,
            treeObj = vars.treeObj,
            idKey = vars.idKey;

        value = value || [];
        // value
        vars.value = [];

        // string
        if (typeof value == "string") {
            value = value.split(",");
        }

        if ($.isArray(value)) {
            if (value.length > 0) {
                if (typeof value[0] == "string") {
                    // 将[""]转化成[{}]
                    for (var i=0; i<value.length; i++) {
                        var v = {};
                        v[idKey] = value[i];
                        value[i] = v;
                    }
                } else if (typeof value[0] == "object") {
                }

                vars.value = value;

                // 通过查找ztree的node完善value（将ztree的treeNode给相应的value值）
                if (treeObj) {
                    var map = {};
                    for (var i=0; i<value.length; i++) {
                        var v = value[i];
                        map[v[idKey]] = true;
                    }
                    // node filter
                    var nodes = treeObj.getNodesByFilter(function(node){
                        return map[node[idKey]];
                    });
                    // update value
                    if (nodes && nodes.length > 0)
                        Combotree.updateValue.call(_this, nodes, true);
                }
            }

            //渲染value之前应当取消勾选的树节点
            Combotree.uncheckAllNodes.call(_this);
            // render value
            Combotree.renderValue.call(_this);
        } else {
            console.log("conbotree setValue error!");
        }
    }

    Combotree.getValue = Combotree.prototype.getValue = function() {
        var _this = this;
    }

//    Combotree.checkNode = function(node, status) {
//        var _this = this;
//        
//        // set selectData
//        Combotree.updateValue.call(_this, node, status);
//        // render value
//        Combotree.renderValue.call(_this);
//    }
    
    //取消勾选所有树节点
    Combotree.uncheckAllNodes = function(){
    	var _this = this,
    		vars = _this._vars;
    	
    	vars.treeObj.checkAllNodes(false);
    }
    
    //重写checkNode
    Combotree.checkNode = function(nodes, status){
    	var _this = this;
    	//for(var i=0; i<nodes.length; i++){
    	//	var node = nodes[i];
    		// set selectData
            //Combotree.updateValue.call(_this, node, status);
    		Combotree.updateValue.call(_this, nodes, status);   
    	//}
    	// render value
        Combotree.renderValue.call(_this, status);
    }

    //更新value数组
    Combotree.updateValue = function(obj, status) {
        var _this = this,
            vars = _this._vars,
            value = vars.value || [],
            idKey = vars.idKey;

        var map = {};
        for (var i=0; i<value.length; i++) {
            var v = value[i];
            map[v[idKey]] = {
                index: i,
                value: v
            }
        }

        // to []
        var objArr = [].concat(obj);

        if(status){
            var length = value.length;
            
            for (var i=0; i<objArr.length; i++) {
                var obj = objArr[i];
                
                if (obj.hasOwnProperty(idKey)) {
                	var index = length + i;
                	//为了使value框内元素按照获取所勾选的节点顺序显示，注释掉下面if代码
//                	if (map[obj[idKey]]) { // contain key
//                		index = map[obj[idKey]].index;
//                	}
                    map[obj[idKey]] = {
                        index: index,
                        value: obj
                    };
                }
            }
        }else{
            for (var i=0; i<objArr.length; i++) {
                var obj = objArr[i];
                delete map[obj[idKey]];
            }
        }

        var temp = [];
        
        for (var key in map) {
            temp.push(map[key]);
        };
        
        temp.sort(function(a, b) {
            //return a.index > b.index;
        	return a.index - b.index;
        });
        
        vars.value = [];
        for (var i=0; i<temp.length; i++) {
            vars.value.push(temp[i].value);
        }
    }

    //渲染value，调用combo的setValue，并勾选value对应的树节点
    Combotree.renderValue = function(status) {
        var _this = this,
            vars = _this._vars,
            value = vars.value,
            combo = vars.combo,
            treeObj = vars.treeObj;

        // combo setValue
        combo.setValue(value);

        // tree checkNode
        if (treeObj) {
        	//为了实现自动勾选下级节点功能，注释掉下一行代码
            //treeObj.checkAllNodes(false);
            for (var i=0; i<value.length; i++) {
                //treeObj.checkNode(value[i], true);
            	treeObj.checkNode(value[i], status);
            }
        }
    }

    Combotree.clearValue = function() {
        var _this = this,
            vars = _this._vars,
            value = vars.value;

        vars.value = [];
    }

    Combotree.getTree = Combotree.prototype.getTree = function() {
        return this._vars.treeObj;
    }

    Combotree.getCombo = Combotree.prototype.getCombo = function() {
        return this._vars.combo;
    }

    Combotree.clear = Combotree.prototype.clear = function() {
        var _this = this,
            vars = _this._vars,
            combo = vars.combo;

        Combotree.clearValue.call(_this);
        Combotree.renderValue.call(_this);
        Combotree.uncheckAllNodes.call(_this);
    }

    Combotree.onRemove = function(value) {
        var _this = this;

        Combotree.updateValue.call(_this, value, false);
        Combotree.uncheckAllNodes.call(_this);
        Combotree.renderValue.call(_this);
    }

    Combotree.onClear = function() {
        var _this = this;

        Combotree.clearValue.call(_this);
        Combotree.renderValue.call(_this);
        Combotree.uncheckAllNodes.call(_this);
    }

    Combotree.onHidePanel = function() {
        var _this = this,
            options = _this.options;

        if (options.search && options.search.enable) {
            Combotree.cancelSearch.call(_this);
        }
    }

    Combotree.bindEvent = function() {
        var _this = this,
            options = _this.options,
            vars = _this._vars,
            $search = vars.$search;

        // 搜索事件
        if (options.search && options.search.enable) {
            var timeout = null;

            $search.on(Constants.EVENT_KEYUP, function() {
                if (timeout) window.clearTimeout(timeout);
                timeout = window.setTimeout(function() {
                   Combotree.search.call(_this);
                }, 400);
            });
        }
    }

    Combotree.search = function() {
        var _this = this,
            vars = _this._vars,
            $search = vars.$search;

        var content = $.trim($search.val());

        if (content) {
            vars.searching = true;
            var nodes = Combotree.searchTreeNode.call(_this, content);
            Combotree.setTreeVisible.call(_this, false);
            if (nodes && nodes.length > 0) {
                for (var i=0; i<nodes.length; i++) {
                    Combotree.setNodeVisible.call(_this, nodes[i]);
                }
            }
        } else {
            Combotree.cancelSearch.call(_this);
        }
    }

    Combotree.cancelSearch = function() {
        var _this = this,
            vars = _this._vars,
            $search = vars.$search;

        vars.searching = false;

        $search.val('');

        Combotree.setTreeVisible.call(_this, true);
    }

    Combotree.research = function() {
        var _this = this,
            vars = _this._vars;

        if (vars.searching) {
            Combotree.search.call(_this);
        }
    }

    Combotree.searchTreeNode = function(content) {
        var _this = this,
            options = _this.options,
            vars = _this._vars,
            treeObj = vars.treeObj,
            idKey = vars.idKey,
            textKey = vars.textKey;

        var fields = options.search.fields;
        if (fields.length == 0) {
            fields.push(textKey);
        }

        var nodes = [];
        for (var i=0; i<fields.length; i++) {
            nodes = nodes.concat(treeObj.getNodesByParamFuzzy(fields[i], content));
        }

        var map = {};
        for (var i=0; i<nodes.length; i++) {
            var node = nodes[i];
            map[node[idKey]] = node;
        }

        var result = [];
        for (var key in map) {
            result.push(map[key]);
        }

        return result;
    }

    Combotree.setNodeVisible = function(node){
        var _this = this,
            vars = _this._vars,
            treeObj = vars.treeObj,
            $ztree = vars.$ztree;

        // parent visible and expand
        var parentNode = node.getParentNode();
        if(parentNode){ // find parent node
            treeObj.expandNode(parentNode, true);
            treeObj.showNode(node); // show node
            Combotree.setNodeVisible.call(_this, parentNode); // show parent node
        } else {
        	treeObj.showNode(node); // show node
        }
    }

    Combotree.setTreeVisible = function(status) {
        var _this = this,
            vars = _this._vars,
            treeObj = vars.treeObj,
            $ztree = vars.$ztree;
        
        
        var allNodes = treeObj.transformToArray(treeObj.getNodes());
        if (status) {
            //$ztree.removeClass("hideNode");
            treeObj.showNodes(allNodes);
        } else {
        	//$ztree.addClass("hideNode");
        	treeObj.hideNodes(allNodes);
            // reset all treeNode
            //$ztree.find("li.showNode").removeClass("showNode");
        }
        
    }

    return init;
});