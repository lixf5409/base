/**
 * inputSelect - css fed - weijy
 */
/**
 // options
 var options = {
    id: id,        								    // element ID
    multi: true,  									// 单选还是多选
    simpleData: true,                               // 是否使用简单数据模型,
    key : {                                         // key
        id : "id",                                  // idKey
        name : "name",                              // nameKey
        data : "data"                               // childrenKey
    },
    data: "",                                       // remote data url
    data: [],                                       // local data
    initData:[],	                                // 初始化数据的id集合
    searchAble: true,                               // 是否搜索
    position: "bottom",                             // panel的位置，默认"bottom"，可选值有"top"
	panelHeight: "",								// panel的高度（在position = top时必填）
    onlyLeaf: false,                                // 是否只选择叶子节点[单选时有效]
    placeholder:"",                                 // 当没有任何选项时的文字提示
    callback : function(data,arrObj){},             // 当所选数据改变时触发data:所有选中数据id的数组,arrObj:所有选中数据对象的数组
    setting: {}                                     // ztree的setting
 }
 **/
define(["jquery", /*"JQuery.resize",*/ "ZTree","ZTreeExhide","css!ZTreeCss"],function($){

    // 程序入口/返回结果
    function init(config){
        // 创建实例
        var input = new Input(config);
        // 将实例放入缓存，提供全局获取该实例
        cache[config.id] = input;

        return input;
    }

    // 缓存对象
    var cache = {},
    // 设置在input上触发下拉面板的事件
        selectEvent = "mouseup";

    // 全局获取inputSelect对象（id为config里面的id）
    init.getInput = function(id){
        return cache[id];
    };

    // 清除缓存,可指定id或清空所有缓存
    init.dropCache = function (id) {
        if(typeof id == "string" && id){
            delete cache[id];
        }else{
            cache={};
        }
    };

    // InputSelect类
    function Input(config){
        var _this = this;

        // 定义$input
        var $input = _this.$input = $("#" + config.id);

        // 判断是否为readonly
        _this.readonly = $input.is("input:disabled, input[readonly]");

        // 判断html是否初始化过
        if(!$input.parent().is(".inputWrapper")){
            $input
                .addClass("inputSelect")
                .wrap('<div class="inputWrapper" id="inputWrapper_' + config.id + '"></div>');
        }

        // $inputWrapper
        _this.$wrap = $input.parent();

        // multi
        config.multi ? $input.addClass("multi") : false;

        // hack,兼容旧版本onSelect函数API
        !config.callback ? function(){config.callback=config.onSelect; delete config.onSelect}() : false;

        // defaultConfig
        _this.config = $.extend(true, {
            multi : false,
            searchAble : false,
            initData : [], //初始化已经选择的值
            setting:{ }, // ztree
            position: "bottom",
            key:{ // ztree的key
                id:"id",
                name:"name",
                children:"data"
            }
        }, config);

        // 初始化ztree的setting
        // 优先级：默认配置-》用户配置-》inputSelect相关配置
        // 默认配置
        var defaultSetting = {
            check : {
                chkboxType : {"Y":"","N":""} // 默认不关联父子节点
            },
            data : {
                key : {
                    name : _this.config.key.name,
                    children : _this.config.key.children || _this.config.key.data //key.data兼容旧版本
                },
                simpleData: {}
            },
            callback: {
                onCheck: null,
                onClick: null
            }
        };

        // 默认配置simpleData
        if(!!_this.config.simpleData){
            defaultSetting.data.simpleData = {
                enable : true,
                idKey : _this.config.key.id,
                pIdKey : _this.config.key.pid,
                rootPId : _this.config.key.rootId
            };
        }

        // 先将用户设置覆盖默认的
        _this.config.setting = $.extend(true, defaultSetting, _this.config.setting);

        // key
        _this.keyId = _this.config.key.id || _this.config.setting.data.simpleData.idKey;
        _this.keyName = _this.config.setting.data.key.name;

        // 备份用户设置的callback
        var onCheckFun = _this.config.setting.callback.onCheck;
        var onClickFun = _this.config.setting.callback.onClick;

        // 再将inputSelect的相关最后覆盖
        _this.config.setting = $.extend(true, _this.config.setting, {
            check: {
                enable: _this.config.multi // check由multi属性决定，不由用户设置的check决定
            },
            callback : {
                onCheck : function (event, treeId, treeNode) {
                    var nodes = _this.treeObj.getCheckedNodes();
                    _this.selectedData = {};
                    Input.setSelectedData.call(_this, nodes, true);
                    //Input.setSelectedData.call(_this, treeNode, treeNode.getCheckStatus().checked);
                    Input.fillInput.call(_this);

                    // 执行用户设置的onCheck
                    typeof onCheckFun == "function" && onCheckFun(event, treeId, treeNode);
                },
                onClick : function (event, treeId, treeNode, clickFlag) {
                    if(!_this.config.multi){//单选
                        if (_this.config.onlyLeaf && treeNode.isParent) return; // 指定只能选择叶子节点时
                        // reset selectedData
                        _this.selectedData = {};
                        Input.setSelectedData.call(_this, treeNode, true);
                        Input.fillInput.call(_this);
                        Input.hidePanel.call(_this);
                    }else{ //多选
                        _this.treeObj.checkNode(treeNode);
                        _this.selectedData = {};
                        var nodes = _this.treeObj.getCheckedNodes();
                        Input.setSelectedData.call(_this, nodes, true);
                        //Input.setSelectedData.call(_this, treeNode, treeNode.getCheckStatus().checked);
                        Input.fillInput.call(_this);
                    }

                    // 执行用户设置的onClick
                    typeof onClickFun == "function" && onClickFun(event, treeId, treeNode, clickFlag);
                }
            }
        });

        Input.initPanel.call(_this);
        Input.bindEvent.call(_this);
    }

    Input.initPanel = function() {
        var _this = this;

        // 改成absolute布局
        _this.$panel = $('<div class="inputPanel"></div>');
        _this.config.panelHeight ? _this.$panel.css("height", parseInt(_this.config.panelHeight) + "px") : false;
        $(document.body).append(_this.$panel);
        Input.panelZIndex.call(_this);
        /*
        // data panel
        _this.$panel = $('<div class="inputPanel"></div>');
        _this.$wrap.append(_this.$panel);
        */
        // search input
        if (_this.config.searchAble) {
            _this.search = $('<input type="text" class="panelSearch form-control">');
            _this.$panel.append(_this.search);
        }
        // content(multi)
        if (_this.config.multi) {
            _this.$content = $("<div class='inputContent'></div>");
            _this.$wrap.append(_this.$content);
        }
        // trash
        if (!_this.readonly) {
            _this.$wrap.append("<div class='clearAllValue'><i class='fa fa-trash-o'></i></div>")
        }
        // placeholder
        if (_this.config.placeholder) {
            _this.$placeholder = $("<div class='inputPlaceholder'></div>");
            _this.$placeholder.html(_this.config.placeholder);
            _this.$wrap.append(_this.$placeholder);
            // dynamic line-height
            _this.$placeholder.css("line-height", _this.$placeholder.height() + "px");
        }

        // data
        Input.initPanelData.call(_this);
    }

    Input.bindEvent = function() {
        var _this = this;

        // 输入框点击事件
        _this.$input.on(selectEvent, function(event){
            if(Input.isReadonly.call(_this)){
                return false;
            }
            Input.togglePanel.call(_this);
        }).on("focus", function(){
            $(this).blur();
        });

        // 多选标签面板事件
        _this.config.multi ? _this.$content.on("click", ".remove", function (event) {
            if (!Input.isReadonly.call(_this)) {
                event.stopPropagation();

                var id = $(this).parent().attr("id");
                var tid = _this.selectedData[id].tid;
                var node = _this.treeObj.getNodeByTId(tid);

                // checkNode
                _this.treeObj.checkNode(node, false);
                // selectedData
                Input.setSelectedData.call(_this, node, false);
                // fill input
                Input.fillInput.call(_this);
                // remove dom
                $(this).parent().remove();
                //如果是关闭状态就触发callback
                if(_this.$panel.is(":hidden")){
                    _this.$input.trigger("dataChanged");
                }
            }
        }).on("click", function (event) {
            // trigger input click
            _this.$input[selectEvent]();
        }) : false;

        // clear
        _this.$wrap.find(".clearAllValue").on("click", function(){
            if (!Input.isReadonly.call(_this)) {
                if (_this.config.multi) {
                    _this.$content.empty();
                }
                _this.treeObj.checkAllNodes(false);
                _this.selectedData = {};
                Input.fillInput.call(_this);

                //如果是关闭状态就触发callback
                if(_this.$panel.is(":hidden")){
                    _this.$input.trigger("dataChanged");
                }
            }
        });

        // dataChanged
        _this.$input.on("dataChanged", function() {
            var dataArr = _this.getCurrentData();
            _this.config.callback && _this.config.callback(dataArr.idArr, dataArr);
        });

        // 搜索事件
        if(_this.config.searchAble){
            var timeout=null,
                lastContent=null;

            _this.$panel.children(".panelSearch").on("keyup", function(event){
                var content = $.trim($(this).val());
                if (content == lastContent) return false;
                lastContent = content;

                if(timeout){
                    window.clearTimeout(timeout);
                }
                timeout = window.setTimeout(function(){
                    if(!lastContent){
                        Input.setTreeVisible.call(_this, true);
                    }else{
                        Input.setTreeVisible.call(_this, false);
                        Input.searchPanelData.call(_this, lastContent);
                    }
                },400);
            })
        }
    }

    Input.panelPlaceAt = function() {
        var _this = this,
            $panel = _this.$panel,
            $input = _this.$input,
            config = _this.config;


        var position = $input.offset();
        var left = position.left;
        var t = position.top + $input.outerHeight();
        var width = $input.outerWidth();

		// position:top
 		var direction = config.position;
 		if (direction == "top") {
			t = position.top - $panel.outerHeight() + 2;
     	}
        

        $panel.css({
            left: left,
            top: t,
            width: width
        });

    }

    Input.panelZIndex = function() {
        var _this = this,
            $panel = _this.$panel;

        var index_highest = 0;
        $('div').each(function () {
            var index_current = parseInt($(this).css('zIndex'), 10);
            if (index_current > index_highest) {
                index_highest = index_current;
            }
        });
        $panel.css("z-index", index_highest + 10);
    }

    Input.initPanelData = function() {
        var _this = this,
            data = this.config.data;

        // 数据是否加载标志位
        _this._treeDataLoaded = false;
        //当前对象选中数据id为key的map对象
        _this.selectedData = {};
        // temp数据
        _this._tempSelectedData = {};

        if (typeof data == "string") {
            $.ajax({
                type : "GET",
                url : data,
                dataType : "json",
                success : function(data){
                    Input.fillPanelData.call(_this, data);
                },
                error : function(){
                    console.log("InputSelect数据获取失败");
                }
            });
        } else {
            Input.fillPanelData.call(_this, data);
        }

        if (_this.config.initData && _this.config.initData.length > 0)
            _this.dataInit(_this.config.initData);
    }

    Input.fillPanelData = function(data) {
        var _this = this;

        var treeId = _this.treeId = "tree_" + _this.config.id;

        if(!_this.$ztree){
            _this.$ztree = $('<ul class="ztree" id="' + treeId + '"></ul>');
            _this.$panel.append(_this.$ztree);
        }

        $.fn.zTree.destroy(treeId);

        var treeObj = _this.treeObj = $.fn.zTree.init(_this.$ztree, _this.config.setting, data);

        _this._treeDataLoaded = true;

        // expand the first node
        var $nodes = _this.$ztree.children();
        if ($nodes.length == 1) {
            treeObj.expandNode(treeObj.getNodeByTId($nodes.first().attr("id")), true);
        }
    }
    
    Input.setSelectedData = function (node, status) {
        var _this = this,
            keyId = _this.keyId,
            keyName = _this.keyName;

        var nodes = [].concat(node);

        if(status){
            for (var i=0; i<nodes.length; i++) {
                var node = nodes[i];
                _this.selectedData[node[keyId]]={
                    val : node[keyName],
                    tid : node.tId
                };
            }
        }else{
            for (var i=0; i<nodes.length; i++) {
                var node = nodes[i];
                delete _this.selectedData[node[keyId]];
            }
        }
    },

    Input.fillInput = function() {
        var _this = this,
            idArr=[],
            valArr=[],
            selectedData = _this.selectedData;


        // placeholder
        (function(){
            var hasProp = false;
            for (var prop in selectedData) {
                hasProp = true;
                break;
            }
            if (!hasProp) {
                _this.$placeholder && _this.$placeholder.show();
            } else {
                _this.$placeholder && _this.$placeholder.hide();
            }
        })();

        // reset
        _this.config.multi ? _this.$content.empty() : false;
        // set content
        for(var id in selectedData){
            if(selectedData.hasOwnProperty(id)){
                idArr.push(id);
                valArr.push(selectedData[id].val);
                if(_this.config.multi){
                    _this.$content.append("<a id='"+ id +"'>" + selectedData[id].val + "<span class='remove'>x</span></a>");
                }
            }
        }
        // set input
        _this.$input.val(valArr.join(",")).data("id", idArr.join(","));
        // status
        valArr.length > 0 ? _this.$wrap.addClass("hasValue") : _this.$wrap.removeClass("hasValue");
    }

    Input.togglePanel = function() {
        var _this = this;

        _this.$panel.is(":visible") ? Input.hidePanel.call(_this) : Input.showPanel.call(_this);
    }

    Input.showPanel = function() {
        var _this = this;

        Input.bindDocumentEvent.call(_this);
        Input.bindWindowResizeEvent.call(_this);
        Input.bindWindowScrollEvent.call(_this);
        Input.bindPanelResizeEvent.call(_this);

        // reset place and show
        Input.panelPlaceAt.call(_this);
        _this.$panel.show();

        //记录打开面板时的数据
        _this._tempSelectedData = $.extend({}, _this.selectedData);
    }

    Input.hidePanel = function() {
        var _this = this;

        Input.unbindDocumentEvent.call(_this);
        Input.unbindWindowResizeEvent.call(_this);
        Input.unbindWindowScrollEvent.call(_this);
        Input.unbindPanelResizeEvent.call(_this);

        _this.$panel.hide();
        _this.$panel.children(".panelSearch").val("").keyup();//重置ztree状态

        if (Input.isDataChanged.call(_this)) {
            _this.$input.trigger("dataChanged");
            // 有改变的话就更新_temp数据
            _this._tempSelectedData = $.extend({}, _this.selectedData);
        }
    }

    Input.bindWindowResizeEvent = function() {
        var _this = this,
            id = _this.config.id;

        $(window).on("resize" + ".inputSelect_" + id, function(){
            Input.panelPlaceAt.call(_this);
        });
    }

    Input.unbindWindowResizeEvent = function(){
        var _this = this,
            id = _this.config.id;

        $(window).off("resize" + ".inputSelect_" + id);
    }

    Input.bindDocumentEvent = function() {
        var _this = this,
            id = _this.config.id;

        $(document).on(selectEvent + ".inputSelect_" + id, function(event){
            if((!_this.$wrap.has(event.target).length && !_this.$wrap.is(event.target)) 
            	&& (!_this.$panel.has(event.target).length && !_this.$panel.is(event.target))){
                Input.hidePanel.call(_this);
            }
        });
    }

    Input.unbindDocumentEvent = function(){
        var _this = this,
            id = _this.config.id;

        $(document).off(selectEvent + ".inputSelect_" + id);
    }

	Input.bindWindowScrollEvent = function() {
        var _this = this,
            id = _this.config.id;
		
		var t = null;
		$(document).on(
		    'DOMMouseScroll.' + id + ' mousewheel.' + id + ' scroll.' + id,
		    function(){       
		        window.clearTimeout( t );
		        t = window.setTimeout( function(){            
		            Input.panelPlaceAt.call(_this);
		        }, 300 );        
		    }
		);
    }

    Input.unbindWindowScrollEvent = function(){
        var _this = this,
            id = _this.config.id;

        $(document).off('DOMMouseScroll.' + id + ' mousewheel.' + id + ' scroll.' + id);
    }

	Input.bindPanelResizeEvent = function() {
        var _this = this,
            id = _this.config.id,
            direction = _this.config.position,
            $panel = _this.$panel;
		
		/*
		if (direction == "top") {
			$panel.on("resize" + ".inputSelect_" + id, function(){
	            Input.panelPlaceAt.call(_this);
			});
		}
		*/
    }

    Input.unbindPanelResizeEvent = function(){
        var _this = this,
            id = _this.config.id,
            direction = _this.config.position,
            $panel = _this.$panel;
        /*    
		if (direction == "top") {
	        $panel.off("resize" + ".inputSelect_" + id);
		}
		*/
    }

    Input.isDataChanged = function() {
        var _this = this;
            o = _this._tempSelectedData,
            n = _this.selectedData,
            length_o = 0,
            length_n = 0;

        for (var i in n) {
            if (typeof o[i] == "undefined") {
                return true;
            }
            length_n++;
        }
        for (var i in o) {
            length_o++;
        }
        if (length_o != length_n) {
            return true;
        }
        return false;
    },

    Input.searchPanelData = function(content) {
        var _this = this;

        var nodes = _this.treeObj.getNodesByParamFuzzy(_this.keyName, content);
        for(var i= 0,length = nodes ? nodes.length : 0; i<length; i++){
            Input.setNodeVisible.call(_this, nodes[i]);
        }
    }

    // 重置ztree状态
    Input.resetTreeStatus = function() {
        var _this = this,
            treeObj = _this.treeObj,
            $ztree = _this.$ztree,
            $nodes = $tree.children();

        Input.setTreeVisible.call(_this, true);
        //treeObj.cancelSelectedNode();       //取消所有selected状态
        if ($nodes.length==1) {
            treeObj.expandNode(treeObj.getNodeByTId($nodes.first().attr("id")), true);
        }
        /*
         nodes = treeObj.getCheckedNodes();      //获取所有checked状态nodes
         for(var i= 0,length = nodes.length;i<length;i++){
         expandParentNodes(treeObj,nodes[i]); //展开checked状态node的父节点
         }
         */
    }

    Input.setNodeVisible = function(node){
        var _this = this,
            treeObj = _this.treeObj,
            $tree = _this.$ztree;

        // parent visible and expand
        var parentNode = node.getParentNode();
        if(parentNode){ // find parent node
            treeObj.expandNode(parentNode, true);
            treeObj.showNode(node); // show node
            Input.setNodeVisible.call(_this, parentNode); // show parent node
        } else {
        	treeObj.showNode(node); // show node
        }
    }

    Input.setTreeVisible = function(status) {
        var _this = this,
            $ztree = _this.$ztree;

        status ? $ztree.removeClass("hideNode") : $ztree.addClass("hideNode");
        // reset all treeNode
        $ztree.find("li.showNode").removeClass("showNode");
    }

    Input.isReadonly = function() {
        var _this = this,
            $input = _this.$input;

        return $input.is("input:disabled, input[readonly]");
    }

    // set selected data
    Input.prototype.dataInit = function(ids, trigger) {
        var _this = this;

        var callback = function() {
            if (!ids) return ;

            if (typeof ids == "string") {
                ids = ids.split(",");
            }

            var treeObj = _this.treeObj,
                keyId = _this.keyId;

            // reset
            treeObj.checkAllNodes(false);
            _this.selectedData = {};

            // set selected data ; treeNode checked ; input
            var length = _this.config.multi ? ids.length : 1;
            var dataMap = {};
            for(var i = 0; i<length; i++){
                dataMap[ids[i]] = true;
            }
            var nodes = treeObj.getNodesByFilter(function(node){
                return !!dataMap[node[keyId]];
            });
            length = nodes.length;
            for(var i = 0; i<length; i++){
                Input.setSelectedData.call(_this, nodes[i], true);
                treeObj.checkNode(nodes[i], true);
            }

            // set input
            Input.fillInput.call(_this);

            // trigger dataChanged
            +function(){
                if (typeof trigger == "undefined") trigger = true; // trigger default true
                if (!trigger) return;
                if(_this.$panel.is(":hidden")){
                    if (Input.isDataChanged.call(_this)) {
                        _this.$input.trigger("dataChanged");
                        // 有改变的话就更新_temp数据
                        _this._tempSelectedData = $.extend({}, _this.selectedData);
                    }
                }
            }(trigger);
        }

        if (!_this._treeDataLoaded) {
            var interval = setInterval(function(){
                //等到数据加载完成后再加载“已选择数据”
                if (_this._treeDataLoaded) {
                    clearInterval(interval);
                    $.proxy(callback, _this)();
                }
            }, 30);
        } else $.proxy(callback, _this)();
    }

    Input.prototype.getTreeObj = function() {
        return this.treeObj;
    }

    // set tree data
    Input.prototype.refreshPanel = function(data, trigger) {
        var _this = this,
            $input = _this.$input;

        // set panel data
        Input.fillPanelData.call(_this, data);

        // set selected data
        var selected = $input.data("id");
        if (selected)
            _this.dataInit(selected.split(","), trigger);
    }

    Input.prototype.getCurrentData = function() {
        var _this = this,
            selectedData = _this.selectedData,
            treeObj = _this.treeObj,
            idArr = [],
            dataArr = [];

        for(var id in selectedData){
            if(selectedData.hasOwnProperty(id)){
                idArr.push(id);
                dataArr.push(treeObj.getNodeByTId(selectedData[id].tid));
            }
        }
        dataArr.idArr = idArr;
        return dataArr;
    }

    // 返回结果
    return init;
});