/**
 * Created by YiYing on 2016/3/31.
 */
define([
    "PDUtilDir/loading"/*,
    "css!PDUtilDir/css/datagrid.css"*/
    ], function(Loading){

    var cache = {};

    function initGrid(config){
        var defaultConfig = {
            pagination: true,
            key: {
                "total": "allDataCount",
                "rows" : "curPageData"
            },
            queryParam: {},
            layout: [],
            toolbar: [],
            data: [],
            loading: false,
            trEvent: {}     //数据行事件
        };
        var config = $.extend(defaultConfig, config);
        //兼容placeAt和id参数
        config.placeAt  = config.placeAt || config.id;
        config.id = config.id || config.placeAt;
        config.pageSize = config.pageSize || (config.pagination ? 10 : 100);
        //创建表格对象
        var result = new Result(new Grid(config));
        //添加到缓存
        cache[config.id] = result;
        return result;
    }
    //支持通过init方法调用
    initGrid.init = initGrid;
    //通过id拿到表格对象
    initGrid.getGrid = function(id){
        return cache[id];
    };


    /**
     * 可供外部访问的方法全部封装在里面
     * 与Grid对象隔离开，避免内部私有方法暴露出来
     * @param grid
     * @constructor
     */
    function Result(grid){
        this._G = grid;
    }
    Result.fn = Result.prototype;

    /**
     * 获取表格容器jquery对象
     * @returns {jquery DOM}
     */
    Result.fn.getGridPanel = function(){
        return this._G.$gridPanel;
    };

    /**
     * 获取表格配置
     * @returns {*}
     */
    Result.fn.getGridConfig = function(){
        return this._G.config;
    };

    /**
     * 增加一行
     * @param rowData
     * @returns {string}
     */
    Result.fn.appendRow = function(rowData){
        var G               = this._G;
        var curIndexNumber  = G.$gridPanel.find(".pd-grid-active-body tbody tr").length;
        var row             = new Row(G, rowData, curIndexNumber + 1, "inserted");
        var uuid            = row.getIndex();
        G.rows.push(row);
        G.$gridPanel.find(".pd-grid-locked-body tbody").append(row.$locked);
        G.$gridPanel.find(".pd-grid-active-body tbody").append(row.$active);
        G.setInnerPadding();
        //分页栏总条数更新
        G.updateDataCount("add");
        //假分页时把数据添加到data中，解决刷新、翻页、排序时新增数据无法显示的问题
        /*if(G.config.data instanceof Array){
            //判断位置并插入数据
            var baseIndex   = (parseInt(G.pageInfo.curPage)-1)*parseInt(G.config.pageSize);
            G.config.data.splice(baseIndex+curIndexNumber,0,row.getData());
        }*/

        return uuid;
    };

    /**
     * 插入一行
     * @param param
     * {index:"",row:{}}
     */
    Result.fn.insertRow = function(param){
        var activeArr   = this._G.$gridPanel.find(".pd-grid-active-body tbody tr");
        var lockedArr   = this._G.$gridPanel.find(".pd-grid-locked-body tbody tr");
        var row         = new Row(this._G, param.row, 0, "inserted");

        //添加active部分DOM
        for(var m= 0,aRow;aRow=activeArr[m++];){
            if($(aRow).data("uuid") == param.index){
                $(aRow).before(row.$active);
            }
        }
        //添加locked部分
        for(var n= 0,lRow;lRow=lockedArr[n++];){
            if($(lRow).data("uuid")==param.index){
                $(lRow).before(row.$locked);
                //其它相关操作
                this._G.refreshIndex();
                this._G.setInnerPadding();
                this._G.rows.splice(n-1,0,row);
                //分页栏总条数更新
                this._G.updateDataCount("add");

                //假分页时把数据添加到data中，解决刷新、翻页、排序时数据无法显示的问题
                /*if(this._G.config.data instanceof Array){
                    //判断位置并插入数据
                    var baseIndex   = (parseInt(this._G.pageInfo.curPage)-1)*parseInt(this._G.config.pageSize);
                    this._G.config.data.splice(baseIndex+n-1,0,row.getData());
                }*/

                //有对应的index才返回新增加行的uuid
                return row.getIndex();
            }
        }

        return false;
    };

    /**
     * 通过index删除一行
     * @param index
     * @returns {boolean}
     */
    Result.fn.deleteRow = function(index){
        if(index==undefined){return false}
        var rule = function(Row){
            return Row.getIndex()==index;
        };
        this.deleteRowByRule(rule);
    };

    /**
     * 更新某一行数据
     * @param param
     * param 参数包括下列属性：
     * index：要更新的行的索引。
     * row：新的行数据。
     */
    Result.fn.updateRow = function(param){
        this._G.getRowObjByUuid(param.index).update(param.row);
    };

    /**
     * 通过规则删除行
     * @param rule
     */
    Result.fn.deleteRowByRule = function(rule){
        this._G.safeEachRow(function(Row,index){
            if(rule(Row)){
                //假分页时把数据添加到data中，解决刷新、翻页、排序时数据无法显示的问题
                /*if(this._G.config.data instanceof Array){
                    var baseIndex   = (parseInt(this._G.pageInfo.curPage)-1)*parseInt(this._G.config.pageSize);
                    if(Row.getChangeType()=="inserted"){
                        this._G.config.data.splice(baseIndex+index,1);
                    }else{
                        this._G.config.data[baseIndex+index]["_changeType_"] = "deleted";
                    }
                }*/
            	
            	if(this.config.data instanceof Array){
                    var baseIndex = (parseInt(this.pageInfo.curPage) - 1) * parseInt(this.config.pageSize);
                    if(Row.getChangeType() == "inserted"){
                        this.config.data.splice(baseIndex + index, 1);
                    }else{
                        this.config.data[baseIndex+index]["_changeType_"] = "deleted";
                    }
            	}
            	
                //---------------------------------------------------//
                Row.remove();
                //---------------------------------------------------//
            }
        });
        this._G.refreshIndex();
        this._G.setInnerPadding();
    };

    /**
     * 更新某一行数据
     * @param param
     * param 参数包括下列属性：
     * rule：数据匹配规则。
     * row：新的行数据。
     */
    Result.fn.updateRowByRule = function(param){
        this._G.eachRow(function(Row){
            if(param.rule(Row)){
                Row.update(param.row);
            }
        });
    };

    Result.fn.getChanges = function(){
        var data = {
            "inserted":[],
            "deleted":[],
            "updated":[],
            "noChange":[]
        };
        this._G.eachRow(function(Row){
            var rowData = Row.getData();
            switch(Row.getChangeType()){
                case "inserted":
                    data.inserted.push(rowData);
                    break;
                case "deleted":
                    data.deleted.push(rowData);
                    break;
                case "updated":
                    data.updated.push(rowData);
                    break;
                case "noChange":
                    data.noChange.push(rowData);
                    break;
            }
        });
        return data;
    };
    
    
    /**
     * 获取所有数据
     * returns Array
     */
    Result.fn.getAllData = function(){
    	if(this._G.config.data instanceof Array){
            if(this._G.config.pagination){
                var arr=[];
                for(var i= 0,item;item=this._G.config.data[i++];){
                    if(item["_changeType_"]!="deleted"){
                        arr.push(this._G.Util.removeCustomRowAttr(item));
                    }
                }
                return arr;
            }else{
                return this.getCurPageData();
            }
        }else{
            return this.getCurPageData();
        }
    }

    /**
     * 获取当前页数据
     * @returns {Array}
     */
    Result.fn.getCurPageData = function(){
        var arr = [];
        this._G.eachRow(function(Row){
            if(Row.changeType!="deleted"){
                arr.push(Row.getData());
            }
        });
        return arr;
    };

    /**
     * 获取当前页所有Row对象
     * @returns {Array}
     */
    Result.fn.getCurPageRow = function(){
        var arr = [];
        this._G.eachRow(function(Row){
            if(Row.changeType!="deleted"){
                arr.push(new RowInterface(Row));
            }
        });
        return arr;
    };


    /**
     * 返回选中的Row对象
     * @returns {Array}
     */
    Result.fn.getCheckedRow = function(){
        return this._G.getCheckedRow();
    };
    /**
     * 获取选中行的数据
     * @returns {Array}
     */
    Result.fn.getCheckedData = function(){
        return this._G.getCheckedData();
    };
    /**
     * 通过表格index拿到表格对象
     * @param index
     * @return RowInterface
     */
    Result.fn.getRowByIndex = function(index){
        return  new RowInterface(this._G.getRowObjByUuid(index));
    };

    /**
     * 通过行唯一编号选中行
     * @param index
     */
    Result.fn.checkRow = function(index){
        this._G.getRowObjByUuid(index).check();
    };

    /**
     * 通过行唯一编号取消选中行
     * @param index
     */
    Result.fn.uncheckRow = function(index){
        this._G.getRowObjByUuid(index).uncheck();
    };

    /**
     * 按规则选中行
     * @param rule
     * @param compareData
     */
    Result.fn.checkRowByRule = function(rule,compareData){
        this._G.eachRow(function(Row){
            if(Row.getChangeType()!="deleted" && rule(Row,compareData)){
                Row.check();
            }
        })
    };

    /**
     * 按规则取消选中行
     * @param rule
     * @param compareData
     */
    Result.fn.uncheckRowByRule = function(rule,compareData){
        this._G.eachRow(function(Row){
            if(Row.getChangeType()!="deleted" && rule(Row,compareData)){
                Row.uncheck();
            }
        })
    };

    /**
     * 选中全部行
     */
    Result.fn.checkAll = function(){
        this._G.Header.checkAll();
    };

    /**
     * 清除所有选中
     */
    Result.fn.uncheckAll = function(){
        this._G.Header.uncheckAll();
    };

    Result.fn.refresh = function(){
    	this._G.refresh();
    };

    Result.fn.reload = function(config){
        this._G.reload(config);
    };

    /**
     * 表格对象
     * @param config
     * @constructor
     */
    function Grid(config){
        this.config     = config;
        //真分页时，后端返回数据类型结构为此结构即可
        this.pageInfo   = {
            curPage:1,                      //默认当前为表格的第一页
            pageData:[],                    //当前页数据
            dataCount:0,                    //所有数据总条数
            pageCount:0                     //总页数
        };
        //排序参数
        this.sortParam  = {
            field: "",
            order: ""
        };
        this.rows       = [];
        this.Event      = new GridEvent(this);      //从这里可以看到目前Grid提供的所有事件
        this.render();
    }

    Grid.fn         = Grid.prototype;
    //不需要每个Grid对象独有
    Grid.fn.Util    = new Util();

    Grid.fn.render  = function(){
        var _this   = this;
        //grid HTML Structure
        var html =
            '<div class="pd-grid-title"></div>'+
            '<div class="pd-grid-content"'+(_this.config.hidden?' style="display:none"':'')+'>'+
                (_this.config.toolbar.length?'<div class="pd-grid-toolbar"><ul></ul></div>':'')+     //操作栏面板
                '<div class="pd-grid-header">' +
                    '<div class="pd-grid-locked-header"></div>'+
                    '<div class="pd-grid-active-header">' +
                        '<div class="pd-grid-active-header-inner"></div>' +
                    '</div>'+
                '</div>'+
                '<div class="pd-grid-body">' +
                    '<div class="pd-grid-locked-body">' +
                        '<div class="pd-grid-locked-body-inner"></div>'+
                    '</div>' +
                    '<div class="pd-grid-active-body"></div>'+
                '</div>'+
                '<div class="pd-grid-pagination"></div>'+
            '</div>';
        //add to container
        _this.$gridPanel = $("#"+_this.config.placeAt);
        _this.$gridPanel.addClass("pd-grid").empty().append(html);

        //初始化 grid 各个部分
        this.renderTitle();
        this.renderToolbar();
        this.renderHeader();
        this.renderBody();
        this.renderPagination();
    };

    Grid.fn.renderTitle = function(){
        var _this = this;
        var $title = _this.$gridPanel.find(".pd-grid-title");
        if(!_this.config.title){
            $title.empty().hide(); return false;
        }
        $title.empty().show();
        //var html = '<span class="title"><i class="fa fa-table" style="color:#2898e0"></i></span>';
        var html = '<span class="title"></span>';
        if(typeof(_this.config.hidden)!="undefined"){
            html += '<i class="glyphicon'+(_this.config.hidden?' glyphicon-plus-sign':' glyphicon-minus-sign')+'"></i>';
            //表格内容显示隐藏控制
            $title.on('click','.glyphicon',function(e){
                $title.siblings(".pd-grid-content").slideToggle();
                $(this).toggleClass("glyphicon-plus-sign glyphicon-minus-sign");
            });
        }
        $title.append(html);
        $title.children(".title").append(_this.config.title || '数据列表');
    };

    Grid.fn.renderToolbar = function(){
        var _this = this;
        if(!!_this.config.toolbar&&_this.config.toolbar.length>0){
            var $toolbar = _this.$gridPanel.find(".pd-grid-toolbar").empty();
            var $ul = $("<ul></ul>");
            for(var i = 0, length=_this.config.toolbar.length;i<length;i++){
                var item = _this.config.toolbar[i];
                $('<li'+(item.id?' id="'+item.id+'"':'')+'><a><i class="'+item.icon+'"></i>'+ item.name +'</a></li>')
                    .bind("click",_this,item.callback)
                    .appendTo($ul);
            }
            $toolbar.append($ul);
        }
    };

    Grid.fn.renderHeader = function(){
        this.Header = new Header(this).render();
    };

    Grid.fn.renderBody = function(){
        //先准备当前页数据,放到Grid.pageInfo里
        this.config.data instanceof Array ? this.getCurPageData() : this.getAjaxData();

        var $lockedTbody = $('<tbody></tbody>');
        var $activeTbody = $('<tbody></tbody>');
        //创建行,当前页数据清空
        this.rows = [];
        for(var i= 0,rowData;rowData=this.pageInfo.pageData[i++];){
            var row = new Row(this,rowData,i);
            this.rows.push(row);
            $lockedTbody.append(row.$locked);
            $activeTbody.append(row.$active);
        }
        //clone过来已经带上table标签，所以只需要tbody即可
        this.$gridPanel.find(".pd-grid-locked-body-inner").empty()
            .append(this.Header.$locked.clone().append($lockedTbody));
        this.$gridPanel.find(".pd-grid-active-body").empty()
            .append(this.Header.$active.clone().append($activeTbody));


        this.afterRenderBody();
        this.bindBodyEvent();
        //表格渲染结束事件触发
        this.Event.onAfterRenderTableBody();
    };

    Grid.fn.afterRenderBody = function(){
        var $gridBody = this.$gridPanel.find(".pd-grid-body");
        //表格高度设置，只有设置了高度才会出现竖向滚动条
        if(this.config.height){
            $gridBody.css('height', this.config.height);
        }else{
            //未设置高度，且存在分页栏时，并且数据不够时填充满空白行，高度为pageSize*行高
            if(this.config.pagination){
                if(this.pageInfo.pageData.length<this.config.pageSize){
                    var height = this.$gridPanel.find(".pd-grid-body tr:first").outerHeight();
                    $gridBody.css("height",height*this.config.pageSize);
                }else{
                    //切换回不需要设置高度时去掉样式
                    $gridBody.css("height",'');
                }
            }
        }

        //Table Fix状态下需设置宽度
        var lockedWidth     = this.Header.lockedWidth;
        var totalWidth      = this.$gridPanel.outerWidth();
        for(var j= 0,item;item=this.config.layout[j++];){
            if(item.locked){
                if(item.width){
                    lockedWidth += this.Util.convertPercent(totalWidth,item.width);
                }else{
                    lockedWidth += (this.Header.avgNoSetWidth>0 ? this.Header.avgNoSetWidth : 50);
                }
            }
        }
        this.$gridPanel.find(".pd-grid-locked-header").css({"width":lockedWidth+"px"});
        this.$gridPanel.find(".pd-grid-locked-body").css({"width":lockedWidth+"px"});

        var $activeBody = this.$gridPanel.find(".pd-grid-active-body");
        //设置活动部分宽度，便于出现滚动条
        var activeWidth = this.$gridPanel.outerWidth() - this.$gridPanel.find(".pd-grid-locked-header").outerWidth();
        //减去3px解决右侧竖向滚动条遮住右侧边线问题
            activeWidth = activeWidth - 3;
        $activeBody.css('width',activeWidth+"px");
        this.$gridPanel.find(".pd-grid-active-header").css('width',activeWidth+"px");

        //活动部分的滚动绑定事件
        var _this = this;
        $activeBody.bind("scroll",function(){
            _this.$gridPanel.find(".pd-grid-active-header").scrollLeft(this.scrollLeft);
            _this.$gridPanel.find(".pd-grid-locked-body").scrollTop(this.scrollTop);
        });

        this.setInnerPadding();

        //隐藏掉body区域的表格头部
        this.$gridPanel.find(".pd-grid-body thead tr").css({"height":"0px"})
            .find("td").css({"border-top":"0px"}).empty();

        //固定住表格宽度，避免调整浏览器宽度时变形
        this.$gridPanel.css("width",this.$gridPanel.outerWidth());

        //如果不带分页栏，增加下边线,避免无数据时有左右边线但下边线缺失的问题
        if(!this.config.pagination){
            this.$gridPanel.find(".pd-grid-body").css({"border-bottom":"1px solid #ddd"});
        }
    };

    /**
     * 通过该方法修复头部与数据对齐问题
     */
    Grid.fn.setInnerPadding = function(){
        var $tableOut   = this.$gridPanel.find(".pd-grid-active-body");
        var $table      = this.$gridPanel.find(".pd-grid-active-body table");
        var scrollWidth = 17;
        var $headerInner= this.$gridPanel.find(".pd-grid-active-header-inner");
        if($tableOut.outerHeight()>=$table.outerHeight()){
            scrollWidth = 0;
            $headerInner.css({"padding-right":"0px"})
        }else{
            $headerInner.css({"padding-right":"17px"})
        }
        var $bodyInner = this.$gridPanel.find(".pd-grid-locked-body-inner");
        //如果有竖向滚动条需要减去滚动条占用的17px
        if(($tableOut.outerWidth() - scrollWidth) >= $table.outerWidth()){
            $bodyInner.css({"padding-bottom": "0px"});
        }else{
            $bodyInner.css({"padding-bottom": "17px"});
        }
    };

    Grid.fn.bindBodyEvent = function(){
        var _this = this;
        var $Body = this.$gridPanel.find(".pd-grid-body");

        if(!$Body.data("bindEvent")){
            //点击行选中选择框
            $Body.on("click",'tr', function(event){
                //无选择按钮不触发
                if(typeof _this.config.multi == "undefined"){
                	return true;
                }
                //点击a标签不触发
                if(event.target.nodeName == "A"){
                	return true;
                }

                var Row = _this.getRowObjByUuid($(this).data("uuid"));
                var nodeName = event.target.nodeName;
                if(event.target.name == "pd_gird_multi_" + _this.config.id){
                    //直接点击单选或多选时由于选择框本身已修改状态，所以跟行选中相反（其实只需触发扩展事件就行）
                    Row.isCheck() ? Row.check() : Row.uncheck();
                }else if(nodeName != "INPUT" && nodeName != "SELECT"){
                    //点击行选中
                    Row.isCheck() ? Row.uncheck() : Row.check();
                }
            });
            //行hover事件
            $Body.on("mouseover", 'tr', function(){
                var Row = _this.getRowObjByUuid($(this).data("uuid"));
                Row.$locked.css("background-color","#f5f5f5");
                Row.$active.css("background-color","#f5f5f5");
            });
            $Body.on("mouseout",'tr',function(){
                var Row = _this.getRowObjByUuid($(this).data("uuid"));
                Row.$locked.css("background-color","");
                Row.$active.css("background-color","");
            });
            //行扩展事件绑定
            $.each(_this.config.trEvent, function(key, value) {
                $Body.on(key, "tr", function(){
                    var uuid = $(this).data("uuid");
                    value.apply(this,[new RowInterface(_this.getRowObjByUuid(uuid))]);
                });
            });
            $Body.data("bindEvent",true);
        }
    };

    Grid.fn.renderPagination = function(){
        var _this = this;
        var $pagination = _this.$gridPanel.find(".pd-grid-pagination");
        //计算总页数
        _this.pageInfo.pageCount = Math.ceil(_this.pageInfo.dataCount/_this.config.pageSize);
        if(!_this.config.pagination){
            $pagination.empty().hide();
        }else{
            $pagination.empty().show();
            //render pagination
            var html =
                '<a title="第一页" class="GoToFirst"><i class="glyphicon glyphicon-step-backward"></i></a>'+
                '<a title="上一页" class="GoToPrev"><i class="glyphicon glyphicon-chevron-left"></i></a>'+
                '<span class="curPage"><input type="text" value="'+_this.pageInfo.curPage+'"/></span>'+
                '<a title="下一页" class="GoToNext"><i class="glyphicon glyphicon-chevron-right"></i></a>'+
                '<a title="最后一页" class="GoToEnd"><i class="glyphicon glyphicon-step-forward"></i></a>';

            html += '<a title="刷新" class="refresh"><i class="glyphicon glyphicon-refresh"></i></a>';
            html += '<span class="dataCount">共<i class="g_dataCount">'+_this.pageInfo.dataCount+'</i>条</span>';
            html += '<span class="pageSize">每页<select>'+
                '<option value="5">5</option>'+
                '<option value="10">10</option>'+
                '<option value="15">15</option>'+
                '<option value="20">20</option>'+
                '<option value="50">50</option>'+
                '<option value="100">100</option>'+
                '</select>条</span>';
            $pagination.append(html);
            $pagination.find(".pageSize select").val(_this.config.pageSize);
            //setPaginationStatus(_this);
            if(!$pagination.data("bindEvent")){
                $pagination.on('click', 'a', function(){
                    if($(this).is(".disable")){
                    	return true;
                    }
                    var className = this.className.split()[0];
                    if(className.indexOf("GoTo") > -1){
                        var type = className.substring(4);
                        var curPage = _this.pageInfo.curPage;
                        var pageCount = _this.pageInfo.pageCount;
                        
                        switch(type){
                            case 'First':
                                _this.pageInfo.curPage = 1;
                                break;
                            case 'End':
                                _this.pageInfo.curPage = pageCount;
                                break;
                            case 'Prev':
                                if(curPage <= 1){
                                	return true;
                                }
                                _this.pageInfo.curPage = curPage - 1;
                                break;
                            case 'Next':
                                if(curPage >= pageCount){
                                	return true;
                                }
                                _this.pageInfo.curPage = curPage + 1;
                                break;
                        }
                    }
                    _this.refresh();
                }).on("keydown", "input", function(e){
                    if(e.which != 13){
                    	return true;
                    }
                    var val = parseInt($(this).val());
                    _this.pageInfo.curPage = (val > _this.pageInfo.pageCount) ? _this.pageInfo.pageCount :
                        (val>0 ? val : _this.pageInfo.curPage);
                    $(this).val(_this.pageInfo.curPage);
                    _this.refresh();
                }).on("click", "input", function(){
                    $(this).select();
                }).on("blur", "input", function(){
                    var val = parseInt($(this).val());
                    _this.pageInfo.curPage  = (val>_this.pageInfo.pageCount) ? _this.pageInfo.pageCount :
                        (val>0 ? val : _this.pageInfo.curPage);
                    $(this).val(_this.pageInfo.curPage);
                    _this.refresh();
                }).on("change","select",function(){
                    _this.config.pageSize = $(this).val() * 1;
                    _this.pageInfo.curPage = 1;
                    _this.refresh();
                });
                $pagination.data("bindEvent", true);
            }
        }

        //表格渲染结束事件触发,refresh时分开调用刷新内容和分页，故放到这里
        this.Event.onAfterRenderTable();
    };

    /**
     * 表格行操作时设置总条数
     * @param type
     */
    Grid.fn.updateDataCount = function(type){
        if(this.config.pagination != false){
            var $Dom = this.$gridPanel.find(".pd-grid-pagination .g_dataCount");
            var count= Number($Dom.text());
            $Dom.text(type == "add" ? (count+1) : (count-1));
        }
    };

    Grid.fn.getCurPageData = function(){
        var _this = this;
        var data = _this.config.data,
            curPage = _this.pageInfo.curPage,
            pageSize = _this.config.pageSize,
            curPageData = [],
            startIndex, endIndex;
        //判断是否需要对数据进行排序
        if(_this.sortParam && _this.sortParam.field && _this.sortParam.order){
            data = this.Util.sortData(data, _this.sortParam.field, _this.sortParam.order);
        }
        if(data.length>0){
            _this.pageInfo.dataCount = data.length;
            startIndex = (curPage - 1) * pageSize;
            endIndex = Math.min(curPage * pageSize, data.length);
            curPageData = data.slice(startIndex, endIndex);
        }
        _this.pageInfo.pageData = curPageData;
    };

    Grid.fn.getAjaxData = function(){
        var _this = this;
        var load = Loading({
        	id: _this.config.placeAt,
        	modal: true
        });
        _this.config.loading && load.show();
        $.ajax({
            type: 'POST',
            url: _this.config.data.value,
            dataType: "json",
            async: false,
            data: $.extend({
                "pageSize": _this.config.pageSize,
                "curPage": _this.pageInfo.curPage
            }, _this.config.queryParam, _this.sortParam),
            success: function(returnData){
                var response = returnData;
                //如果model属性存在，则取modle中的内容，兼容使用原始ajax的情况
                returnData.model && (returnData = returnData.model);
                //后端返回的数据key可自定义支持
                if(typeof _this.config.key != "undefined"){
                    returnData = {
                        "dataCount": returnData[_this.config.key.total],
                        "pageData": returnData[_this.config.key.rows]
                    }
                }
                $.extend(_this.pageInfo, returnData);
                //数据加载成功事件触发
                var newData = _this.Event.onLoadDataSuccess(_this.pageInfo.pageData, response);
                    newData && (_this.pageInfo.pageData = newData);
                _this.config.loading && load.close();
                return true;
            },
            error: function(jqXHR, status, errorThrown){
                _this.config.loading && load.close();
                return false;
            }
        });
    };

    /**
     * 循环遍历表格当前页Row对象
     * @param callback
     */
    Grid.fn.eachRow = function(callback){
        var len = this.rows.length;
        for(var i=0; i<len; i++){
            callback.apply(this, [this.rows[i], i]);
        }
    };
    /**
     * 循环遍历表格当前页Row对象(适用于循环删除的情况，弊端为可能造成数据倒序)
     * @param callback
     */
    Grid.fn.safeEachRow = function(callback){
        /*var len = this.rows.length-1;
        //start from the top可以避免循环删除的问题
        for(var i= len;i>=0;i--){
            callback.apply(this,[this.rows[i],i]);
        }*/
        //更简便的方法
        var i = this.rows.length;
        while(i--){
            callback.apply(this, [this.rows[i], i]);
        }
    };

    Grid.fn.refreshIndex = function(){
        if(this.config.index){
            var baseIndex = (parseInt(this.pageInfo.curPage) - 1) * parseInt(this.config.pageSize);
            this.$gridPanel.find(".pd-grid-locked-body tbody>tr").each(function(index, element){
                var i = baseIndex + index + 1;
                $(element).children("td:first").attr("title", i).text(i);
            });
        }
    };

    /**
     * 表格刷新
     */
    Grid.fn.refresh = function(){
    	//临时处理bug使用，当加载静态数据时，刷新不进行任何操作
//    	if(this.config.data instanceof Array){
//    		return;
//    	}else{
//            this.Header.uncheckAll();
//            this.renderBody();
//            this.renderPagination();
//    	}
    	var config = this.config;
    	this.load();
    };
    
    /**
     * 载入表格
     */
    Grid.fn.load = function(){
    	this.Header.uncheckAll();
        this.renderBody();
        this.renderPagination();
    }

    /**
     * 重新加载表格
     * @param config 表格初始化对象
     */
    Grid.fn.reload = function(config){
        this.config = $.extend(this.config, config);
        var config = this.config;
        //排序初始化
        this.$gridPanel.find(".pd-grid-header thead .fa-sort").removeClass("fa-sort-desc fa-sort-asc");
        //分页信息初始化
        this.pageInfo = {
            curPage: 1,                      //默认当前为表格的第一页
            pageData: [],                    //当前页数据
            dataCount: 0,                    //所有数据总条数
            pageCount: 0                     //总页数
        };
        this.sortParam = {
            field : "",
            order : ""
        };
        this.load();
    };

    /**
     * 通过uuid拿到表格行对象
     * @param uuid
     * @returns {*}
     */
    Grid.fn.getRowObjByUuid = function(uuid){
        var result = null;
        this.eachRow(function(row){
            if(row.getIndex() == uuid){
                result = row;
            }
        });
        return result;
    };
    
    Grid.fn.getCheckedRow = function(){
        var arr = [];
        this.eachRow(function(Row){
            if(Row.isCheck() && Row.getChangeType() != "deleted"){
                arr.push(new RowInterface(Row))
            }
        });
        return arr;
    };
    
    Grid.fn.getCheckedData = function(){
        var arr = [];
        this.eachRow(function(Row){
            if(Row.isCheck() && Row.getChangeType() != "deleted"){
                arr.push(Row.getData())
            }
        });
        return arr;
    };



    /**
     * 表格头部
     * @param grid
     * @constructor
     */
    function Header(grid){
        this.G = grid;
    }
    Header.fn = Header.prototype;

    Header.fn.render = function(){
        this.$header = this.G.$gridPanel.find(".pd-grid-header");
        this.renderLocked();
        this.renderActive();
        this.bindHeaderEvent();
        return this;
    };

    Header.fn.renderLocked = function(){
        var tdArr = [],lockedWidth = 0;
        //序号与选择框默认放在locked部分
        if(this.G.config.index){
            tdArr.push('<td width="34px"></td>');
            lockedWidth += 34;
        }
        if(typeof(this.G.config.multi) == "boolean"){
            tdArr.push('<td align="center" width="24px">'+(this.G.config.multi?'<input type="checkbox">':'')+'</td>');
            lockedWidth += 24;
        }
        //加1px显示td边框
        this.lockedWidth = lockedWidth+1;

        var totalWidth = this.G.$gridPanel.outerWidth();
        //找出已经设置了多少，方便剩下的平分
        var notSetWidthItem = [];
        var haveSetWidth = lockedWidth;
        var layout = this.G.config.layout;
        for(var i= 0,item; item=layout[i++];){
            if(item.width){
                haveSetWidth += this.G.Util.convertPercent(totalWidth, item.width);
            }else{
                notSetWidthItem.push(item)
            }
        }
        //未设置宽度的列的平均宽度(取整，table宽度设置为100%不够时会自动填满)，减去边框的2px,减去右侧滚动条的17px
        this.avgNoSetWidth = parseInt((totalWidth - haveSetWidth) / notSetWidthItem.length) - 2 - 17;

        //需要锁定部分的列
        tdArr = tdArr.concat(this.createHeaderTd(function(item){return item.locked}));
        this.$locked = $('<table><thead><tr>' + tdArr.join("") + '</tr></thead></table>');
        this.$header.find(".pd-grid-locked-header").append(this.$locked);
    };

    Header.fn.renderActive = function(){
        this.$active = $('<table><thead><tr>'+this.createHeaderTd(function(item){return !item.locked}).join("")+'</tr></thead></table>');
        this.$header.find(".pd-grid-active-header-inner").append(this.$active);
    };

    Header.fn.createHeaderTd = function(rule){
        var tdArr = [];
        var layout = this.G.config.layout;
        //表格容器宽度
        var totalWidth = this.G.$gridPanel.outerWidth() ;
        for(var i= 0,item;item=layout[i++];){
            if(rule(item)){
                var width = item.width ? this.G.Util.convertPercent(totalWidth,item.width) : this.avgNoSetWidth;
                    width = width>0 ? ("width:"+width+"px") :"min-width:50px;";
                var align = (item.align?"text-align:"+item.align+";":"");
                var sort  = (item.sort?'<i class="fa fa-sort"></i>':'');
                var style = 'style="'+ align + width +'"';
                tdArr.push('<td '+style+' class='+item.field+' title="'+item.name+'">'+ item.name + sort +'</td>')
            }
        }
        return tdArr;
    };

    Header.fn.bindHeaderEvent = function(){
        var _this = this;
        this.$header.on("click","td",function(event){
            var nodeName    = event.target.nodeName,
                field       = null,
                order       = "desc";
            if (nodeName=="INPUT") {

                //点击全选与选不选
                $(event.target).is(":checked") ? _this.checkAll() : _this.uncheckAll();

            } else if(nodeName == "I") {
                field = this.className ? this.className : null;
                if(!!field){
                    $(this).siblings().children(".fa-sort").removeClass("fa-sort-desc fa-sort-asc");
                    if($(this).children(".fa-sort").is(".fa-sort-desc,.fa-sort-asc")){
                        $(this).children(".fa-sort").toggleClass("fa-sort-desc fa-sort-asc");
                    }else{
                        $(this).children(".fa-sort").toggleClass("fa-sort-desc");
                    }
                    order = $(this).children(".fa-sort").is(".fa-sort-desc")?"desc":"asc";
                    //设置排序字段后重新渲染表格内容
                    $.extend(_this.G.sortParam,{
                        field : field,
                        order : order
                    });

                    //重新渲染表格
                    _this.G.refresh();
                }
            }
        });
    };

    Header.fn.autoCheckOrUncheck = function(){
        if(this.G.config.multi){
            var checked=0,unChecked=0;
            this.G.eachRow(function(row){
                row.isCheck() ? (checked=1) : (unChecked=1);
            });

            //只存在三种状态：1.所有都选中；2.所有都未选中；3.一部分选中一部分未选中
            //1.所有都选中
            if(checked == 1 && unChecked == 0){
                this.checkAll(true);
                this.G.Event.onCheckedAll();
            }
            //2.所有都未选中；
            if(checked == 0 && unChecked == 1){
                this.uncheckAll(true);
                this.G.Event.onUncheckedAll();
            }
            //3.一部分选中一部分未选中
            if(checked == 1 && unChecked == 1){
                this.$header.find("input").removeAttr("checked");
            }
        }
    };

    Header.fn.checkAll = function(isRowTrigger){
        this.$header.find("input")[0].checked = true;
        //点击行的时候触发checkAll，即通过autoCheckOrUncheck方法
        if(!isRowTrigger){
            this.G.eachRow(function(Row){
                if(Row.getChangeType() != "deleted" && !Row.isCheck()){
                    //参数为true表示不触发onCheckedChange事件
                    Row.check(true);
                }
            });
            //当点击行选中已经触发后再触发全选中时不再触发（行事件会触发该方法）
            this.G.Event.onCheckedChange();
        }
    };

    Header.fn.uncheckAll = function(isRowTrigger){
        var $input = this.$header.find("input");
            $input.length && ($input[0].checked = false);
        if(!isRowTrigger){
            this.G.eachRow(function(Row){
                if(Row.getChangeType() != "deleted" && Row.isCheck()){
                    Row.uncheck(true);
                }
            });
            //当取消行选择触发该事件后再次触发全不选时不再触发
            this.G.Event.onCheckedChange([]);
        }
    };

    /**
     * 表格行对象
     * @param grid
     * @param rowData
     * @param indexNumber
     * @constructor
     */
    function Row(grid,rowData,indexNumber,changeType){
        this.G              = grid;
        this.uuid           = '';
        this.$check         = null;                 //行选择对象
        this.cells          = {};                   //所有列key:field,value:FormObj
        this.rowData        = rowData;
        this.indexNumber    = indexNumber;
        this.changeType     = (changeType || '');   //数据变更类型，可以为inserted、deleted、updated
        this.init();
    }
    Row.fn = Row.prototype;

    Row.fn.init = function(){
        this.uuid   = this.G.Util.uuid();
        //把uuid放到数据上，方便通过API增删改时判断(主要目的为解决刷新等操作不显示新增数据问题)
        /*if(this.G.config.data instanceof Array){
            this.rowData["_index_"]         = this.uuid;
            this.rowData["_changeType_"]    = this.changeType;
        }*/
        this.createLocked();
        this.createActive();
        //行渲染结束事件触发
        this.G.Event.onAfterRenderRow(this);
    };

    Row.fn.createLocked = function(){
        var $tr = $("<tr></tr>").data("uuid",this.uuid);
        if(this.G.config.index){
            var baseNumber  = (parseInt(this.G.pageInfo.curPage)-1)*parseInt(this.G.config.pageSize);
            $tr.append('<td align="center">'+(this.indexNumber+baseNumber)+'</td>');
        }
        if(typeof(this.G.config.multi)=="boolean"){
            this.$check     = $('<input type="'+(this.G.config.multi?'checkbox':'radio')+'" name="pd_gird_multi_'+(this.G.config.id)+'" '+(this.rowData["_checked"]?"checked":"")+'>');
            $tr.append($('<td align="center"></td>').append(this.$check));
        }
        for (var i=0,item;item=this.G.config.layout[i++];) {
            if(item.locked){
                this.createCell($tr,item);
            }
        }
        this.$locked = $tr;
    };

    Row.fn.createActive = function(){
        var $tr = $("<tr></tr>").data("uuid",this.uuid);
        for (var i=0,item;item=this.G.config.layout[i++];) {
            if(!item.locked){
                this.createCell($tr,item);
            }
        }
        this.$active = $tr;
    };

    Row.fn.createCell = function ($tr,cellConfig) {
        var cell = new Cell(this,cellConfig);
        this.cells[cellConfig.field] = cell;
        $tr.append(cell.getCellDom());
    };

    /*Row.fn.createTd = function(tdConfig){
        var tdValue = this.rowData[tdConfig.field];
            tdValue = (tdValue || tdValue==0)?tdValue:"";
            //tdValue = tdConfig.format?tdConfig.format({"row":this.rowData}):tdValue;
        var $td     = $('<td'+(tdConfig.align?' align="'+tdConfig.align+'"':'')+'></td>');
        //如果format返回DOM对象
        if(typeof(tdConfig.format)=="function"){
            //未放到cells中，从元素数据中取值
            $td.append(tdConfig.format.apply($td,[{"row":this.rowData}]));
        }else{
            this.cells[tdConfig.field] = this.createTdContent($td,tdValue,tdConfig);
        }


        /!*$td.focus(function(){alert(1)});
        $td.blur(function(){alert(2)});*!/

        /!*$td.click(function () {
            var OriginalContent = $(this).text();

            $(this).addClass("cellEditing");
            $(this).html('<input type="text" value="'+ OriginalContent + '"  style="width: 100%"/>');
            $(this).children().first().focus();

            $(this).children().first().keypress(function (e) {
                if (e.which == 13) {
                    var newContent = $(this).val();
                    $(this).parent().text(newContent);
                    $(this).parent().removeClass("cellEditing");
                }
            });

            $(this).children().first().blur(function(){
                $(this).parent().text(OriginalContent);
                $(this).parent().removeClass("cellEditing");
            });
        });*!/

        return $td;
    };

    Row.fn.createTdContent = function($td,tdValue,tdConfig){
        var formObj = null;
        var param   = {
            "rowObj":this,
            "$td":$td,
            "tdValue":tdValue,
            "tdConfig":tdConfig
        };
        if(tdConfig.editor){
            var type    = tdConfig.editor.type;
            if(typeof(type)=="function"){
                //自定义表格编辑对象
                formObj = new type(param);
            }else if(typeof(type)=="string"){
                //首字母大写转换
                type    =  type.substring(0,1).toUpperCase() + type.substring(1,type.length);
                formObj = new Forms[type](param);
            }
        }else{
            formObj = new Forms["Span"](param);
        }
        return formObj;
    };*/

    /**
     * 获取行的的唯一编号
     * @returns {string}
     */
    Row.fn.getIndex = function(){
        return this.uuid;
    };

    Row.fn.getChangeType = function(){
        var type = this.changeType;
        //updated的数据分为两种，一直是通过外部接口更新，另一种是通过编辑框更新(通过编辑框更新无法记录下更新状态)
        if(type==""){
            var old = this.rowData;
            var cur = this.getData();
            var isChange = false;
            for(var key in cur){
                if(cur[key]!=old[key]){
                    isChange = true;
                    break;
                }
            }
            type = (isChange ? "updated" : "noChange");
        }
        return type;
    };

    /**
     * 拿到当前行的最新数据
     */
    Row.fn.getData = function(){
        var obj = {};
        for(var key in this.cells){
            //format后取原始值
            if(typeof(this.cells[key]._config.format) != "function"){
                obj[key] = this.getCellValue(key);
            }
        }
        return $.extend({}, this.rowData, obj);
    };

    /**
     * 获取单元格对象
     * @param name
     * @returns {*}
     */
    Row.fn.getCell = function(name){
        if(!name){
        	return null;
        }
        return new CellInterface(this.cells[name]);
    };

    /**
     * 获取单元格的值
     * @param name
     * @returns {*}
     */
    Row.fn.getCellValue = function(name){
        return this.cells[name].getValue();
    };
    /**
     * 删除行
     */
    Row.fn.remove = function(){
        var _this = this;
        //如果是新增加的直接删除
        if(_this.changeType == "inserted"){
            _this.G.safeEachRow(function(row, index){
                if(row.getIndex() == _this.uuid){
                    _this.G.rows.splice(index, 1)
                }
            });
        }
        this.changeType = "deleted";
        this.$locked.remove();
        this.$active.remove();
        //序号刷新
        this.G.refreshIndex();
        //分页栏总条数更新
        this.G.updateDataCount();
    };
    /**
     * 更新行数据
     * @param newData
     */
    Row.fn.update = function(newData){
        for(var key in newData){
            var cell = this.cells[key];
            if(cell){
                cell.setValue(newData[key]);
            }
        }
        //把UI上面不需要显示的数据保存起来
        $.extend(this.rowData, newData);

        if(this.changeType != "inserted" && this.changeType != "deleted"){
            this.changeType = "updated";
        }
    };

    /**
     * 判断行是否选中
     */
    Row.fn.isCheck = function(){
        if(this.$check){
            return this.$check.is(":checked");
        }else{
            return false;
        }
    };
    /**
     * 行选中
     */
    Row.fn.check = function(notTriggerChange){
        this.$check[0].checked = true;
        this.G.Header.autoCheckOrUncheck();
        this.G.Event.onCheck(this);
        //默认触发,可控制不触发该事件（全选时当全选结束后再额外触发，避免触发多次）
        notTriggerChange ? "" :this.G.Event.onCheckedChange();
    };
    /**
     * 取消选中
     */
    Row.fn.uncheck = function(notTriggerChange){
        this.$check.removeAttr("checked");
        this.G.Header.autoCheckOrUncheck();
        this.G.Event.onUncheck(this);
        //默认触发,可控制不触发该事件（全不选时当全不选结束后再额外触发，避免触发多次）
        notTriggerChange ? "" :this.G.Event.onCheckedChange();
    };


    function Cell(Row,config){
        this._R      = Row;
        this._config = config;
        this._$td    = null;
        this._editor = null;
        this._value  = "";
        this._init();
    }

    Cell.fn = Cell.prototype;

    Cell.fn._init = function(){
        var Row = this._R;
        var tdConfig = this._config;

        var tdValue = Row.rowData[tdConfig.field];
        tdValue = (tdValue || tdValue == 0) ? tdValue : '';
        //tdValue = tdConfig.format?tdConfig.format({"row":this.rowData}):tdValue;
        this._$td = $('<td' + (tdConfig.align ? ' align="' + tdConfig.align + '"' : '') + '></td>');
        //数据format处理，其中format中的this为$td对象
        this._value = this._formatValue(tdValue);
        //表格单元渲染
        if(tdConfig.editor){
            this._editor = this.edit();
        }else{
            this._editor = this.read();
        }
    };

    Cell.fn._formatValue = function(value){
        var result = value;
        if(typeof(this._config.format) == 'function'){
            result = this._config.format.apply(this._$td, [{"row": this._R.rowData, "value": value}]);
        }
        
        return result;
    };

    /**
     * 单元格只读
     */
    Cell.fn.read = function(){
        this._$td.empty();
        var param = {
            "rowObj": this._R,
            "$td": this._$td,
            "tdValue": this._value,
            "tdConfig": this._config
        };
        return new Forms["Span"](param);
    };

    /**
     * 单元格编辑
     */
    Cell.fn.edit = function(){
        this._$td.empty();
        var formObj = null;
        var param   = {
            "rowObj":this._R,
            "$td":this._$td,
            "tdValue":this._value,
            "tdConfig":this._config
        };
        var type    = this._config.editor.type;
        if(typeof(type)=="function"){
            //自定义表格编辑对象
            formObj = new type(param);
        }else if(typeof(type)=="string"){
            //首字母大写转换
            type    =  type.substring(0,1).toUpperCase() + type.substring(1,type.length);
            formObj = new Forms[type](param);
        }
        return formObj;
    };

    Cell.fn.setValue = function(value,flag){
        this._editor.setValue(this._formatValue(value));
        //独立调用时修改数据与状态位
        if(flag=="needChangeRowType"){
            this._R.rowData[this._config.field] = value;
            if(this._R.changeType!="inserted" && this._R.changeType!="deleted"){
                this._R.changeType = "updated";
            }
        }
    };

    Cell.fn.getValue = function(){
        return this._editor.getValue();
    };

    Cell.fn.getCellDom = function(){
       return this._$td;
    };

    Cell.fn.getEditor = function(){
        return this._editor;
    };


    /**
     * Row对象对外提供的接口
     * @param Row
     * @constructor
     */
    function RowInterface(Row){
        this._R = Row
    }
    RowInterface.fn = RowInterface.prototype;
    RowInterface.fn.getIndex        = function(){return this._R.getIndex()};
    RowInterface.fn.getData         = function(){return this._R.getData()};
    RowInterface.fn.getChangeType   = function(){return this._R.getChangeType()};
    RowInterface.fn.getCell         = function(name){return this._R.getCell(name)};
    RowInterface.fn.getCellValue    = function(name){return this._R.getCellValue(name)};
    RowInterface.fn.isCheck         = function(){return this._R.isCheck()};
    RowInterface.fn.check           = function(){return this._R.check()};
    RowInterface.fn.uncheck         = function(){return this._R.uncheck()};
    RowInterface.fn.update          = function(newData){return this._R.update(newData)};
    RowInterface.fn.remove          = function(){return this._R.remove()};

    /**
     * Cell对象对外提供的接口
     * @param Cell
     * @constructor
     */
    function CellInterface(Cell){
        this._C = Cell
    }
    CellInterface.fn = CellInterface.prototype;
    CellInterface.fn.getEditor        = function(){return this._C.getEditor()};
    CellInterface.fn.setValue         = function(value){return this._C.setValue(value,"needChangeRowType")};
    CellInterface.fn.getValue         = function(){return this._C.getValue()};
    CellInterface.fn.getCellDom       = function(){return this._C.getCellDom()};


    var Forms = {};
    /**
     * 默认 只读
     * @param param
     * @constructor
     */
    Forms.Span = function(param){
        this.$Dom   = '';
        this._value = param.tdValue;
        this._init(param);
    };
   
    Forms.Span.prototype._init = function(param){
        //考虑到值可能为format后的DOM对象
        this.$Dom = null;
        this.$Dom = $('<span></span>').append(this._value);
//        if(typeof(this._value) == 'string'){
//            //字符串原样输出，避免xss
//            this.$Dom = $('<span></span>').text(this._value);
//        }else{
//            this.$Dom = $('<span></span>').append(this._value);
//        }
        param.$td.append(this.$Dom);
        if(typeof(this._value) == 'string'){
            param.$td.attr('title', this._value);
        }
    };
    
    Forms.Span.prototype.setValue = function(value){
        this.$Dom.html(value);
        //修改Row.getData()方法获取到旧数据的bug wuyc - 2018.11.28
        this._value = value;
        //修复Row.update()后相关列数据的title不改变的bug wuyc - 2018.11.28
        this.setTitle();
    };
    
    Forms.Span.prototype.getValue = function(){
        return this._value;
    };
    
    //修复Row.update()后相关列数据的title不改变的bug wuyc - 2018.11.28
    //设置td的title
    Forms.Span.prototype.setTitle = function(){
    	this.$Dom.parent().attr('title', this._value);
    };

    /**
     * Link,点击可触发click事件
     * @param param
     * @constructor
     */
    Forms.Link = function(param){
        this.$Dom = '';
        this._init(param);
    };
    
    Forms.Link.prototype._init = function(param){
        this.$Dom   = $('<a>'+param.tdValue+'</a>');
        new Util().bindEvent(param.tdConfig.editor.event,param.rowObj,this);
        param.$td.append(this.$Dom);
    };
    
    Forms.Link.prototype.setValue = function(value){
        this.$Dom.text(value);
    };
    
    Forms.Link.prototype.getValue = function(){
        return this.$Dom.text();
    };

    /**
     * 文本框
     * @param param
     * @constructor
     */
    Forms.Text = function(param){
        this.$Dom       = '';
        this._init(param);
    };
    
    Forms.Text.prototype._init = function(param){
        this.$Dom = $('<input type="text" style="width:100%">');
        new Util().bindEvent(param.tdConfig.editor.event, param.rowObj, this);
        param.$td.append(this.$Dom);
        param.tdValue !== null && this.setValue(param.tdValue);
    };
    
    Forms.Text.prototype.setValue = function(value){
        this.$Dom.val(value);
    };
    
    Forms.Text.prototype.getValue = function(){
        return this.$Dom.val();
    };

    /**
     * 下拉选择
     * @param param
     * @constructor
     */
    Forms.Select = function(param){
        this.$Dom       = '';
        this._init(param);
    };
    Forms.Select.prototype._init = function(param){
        this.$Dom   = $('<select style="width:100%"></select>');
        new Util().bindEvent(param.tdConfig.editor.event,param.rowObj,this);
        //初始化Option
        for(var i= 0,item;item=param.tdConfig.editor.options[i++];){
            this.$Dom.append('<option value="'+item.value+'">'+item.name+'</option>')
        }
        param.$td.append(this.$Dom);
        param.tdValue && this.setValue(param.tdValue);
    };
    Forms.Select.prototype.setValue = function(value){
        this.$Dom.val(value);
    };
    Forms.Select.prototype.getValue = function(){
        return this.$Dom.val();
    };

    /**
     * 单选按钮
     * @param param
     * @constructor
     */
    Forms.Radio = function(param){
        this.$td = param.$td;
        this._init(param);
    };
    Forms.Radio.prototype._init = function(param){
        var uuid = new Util().uuid();
        for(var i= 0,item;item=param.tdConfig.editor.options[i++];){
            param.$td.append('<input type="radio" value="'+item.value+'" name="'+uuid+'">'+item.name+'&nbsp;</input>')
        }
        param.tdValue && this.setValue(param.tdValue);
    };
    Forms.Radio.prototype.setValue = function(value){
        this.$td.find("input").each(function(){
            if($(this).val()==value){
                this.checked = true;
            }
        })
    };
    Forms.Radio.prototype.getValue = function(){
        return this.$td.find('input:radio:checked').val()
    };

    /**
     * 把所有Grid的Event都放在这里，所以地方触发注册的事件也以这里为总入口
     * 方便查询管理，避免提供的事件过多后造成混乱
     * @param grid
     * @constructor
     */
    function GridEvent(grid){
        this._G      = new Result(grid);
        this._config = grid.config;
    }

    /**
     * 行选中触发
     * @param Row
     */
    GridEvent.prototype.onCheck = function(Row){
        typeof(this._config.onCheck)=="function" && this._config.onCheck.apply(this._G,[Row]);
    };
    /**
     * 行取消选中时触发
     * @param Row
     */
    GridEvent.prototype.onUncheck = function(Row){
        typeof(this._config.onUncheck)=="function" && this._config.onUncheck.apply(this._G,[Row]);
    };
    /**
     * 当所有行都选中时触发
     */
    GridEvent.prototype.onCheckedAll = function(){
        typeof(this._config.onCheckedAll)=="function" && this._config.onCheckedAll.apply(this._G);
    };
    /**
     * 当所有行都为非选中状态时触发
     */
    GridEvent.prototype.onUncheckedAll = function(){
        typeof(this._config.onUncheckedAll)=="function" && this._config.onUncheckedAll.apply(this._G);
    };
    /**
     * 当选中数据改变时触发
     * @param Rows
     */
    GridEvent.prototype.onCheckedChange = function(Rows){
        typeof(this._config.onCheckedChange)=="function" && this._config.onCheckedChange.apply(this,[Rows?Rows:this._G.getCheckedRow()]);
    };
    /**
     * 当远程数据加载成功时触发
     * @param data
     */
    GridEvent.prototype.onLoadDataSuccess = function(data){
        return typeof(this._config.onLoadDataSuccess)=="function" && this._config.onLoadDataSuccess.apply(this._G,[data]);
    };
    /**
     * 行渲染完成时触发
     * @param Row
     */
    GridEvent.prototype.onAfterRenderRow = function(Row){
        typeof(this._config.onAfterRenderRow)=="function" && this._config.onAfterRenderRow.apply(this._G,[Row]);
    };
    /**
     * 当表格内容渲染完成时触发
     */
    GridEvent.prototype.onAfterRenderTableBody = function(){
        typeof(this._config.onAfterRenderTableBody)=="function" && this._config.onAfterRenderTableBody.apply(this._G);
    };
    /**
     * 当表格渲染完成时触发
     */
    GridEvent.prototype.onAfterRenderTable = function(){
        typeof(this._config.onAfterRenderTable)=="function" && this._config.onAfterRenderTable.apply(this._G);
    };


    /**
     * 通用方法抽取
     * @constructor
     */
    function Util(){}

    /**
     * 移除自定义属性
     * @param row
     */
    Util.prototype.removeCustomRowAttr = function(row){
        //过滤掉Grid组件相关的属性
        var obj = $.extend({}, row);
        delete  obj._changeType_;
        delete  obj._index;
        return obj;
    }
    
    Util.prototype.uuid = function(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() +''+ s4() +''+ s4() +''+ s4() + '' + s4() + s4() + s4();
    };

    /**
     * 把百分比转换为像素(不带单位，方便统计)
     * @param total
     * @param percent
     */
    Util.prototype.convertPercent = function(total,percent){
        var result = percent;
        //像素
        if(percent.search(/px$/) != -1){
            result = Number(percent.substring(0,percent.length-2));
        }
        //百分比
        if(percent.search(/\%$/) != -1){
            result = total*((percent.substring(0,percent.length-1))/100);
        }
        return result;
    };

    /**
     * 静态数据排序
     * @param data          要排序的数据
     * @param field         排序字段
     * @param order         asc为升序、desc为降序
     * @returns {*}
     */
    Util.prototype.sortData = function(data,field,order){
        var result = [];
        if (!data||data.length==0) {return data;}
        //默认降序
        order=(order=="asc")?false:true;
        result.push(data[0]); //向队列中推入第一个元素
        for(var i= 1,item;item=data[i];i++){
            var s= false;
            for(var j= 0,value;value=result[j];j++){
                if((item[field]>value[field])==order){
                    result.splice(j,0,item);
                    s = true;
                    break;
                }
            }
            if(!s) result.push(item);
        }
        return result;
    };


    /**
     * td中组件事件绑定
     * @param events
     * @param Row
     * @param _this
     */
    Util.prototype.bindEvent = function(events,Row,_this){
        // this snippets is correct
        /*if(events){
            $.each(events, function(key, value) {
                _this.$Dom.bind(key,function(){
                    value.apply(_this,[new RowInterface(Row)]);
                });
            });
        }*/
        for (var key in events) {
            _this.$Dom.bind(key, (function(key) {
                return function() {
                    events[key].apply(_this, [new RowInterface(Row)]);
                }
            })(key));
        }
    };

    /*var layout = [
        {name:"性别",field:"Sex",sort:true},
        {name:"电话",field:"Phone"},
        {name:"邮件",field:"Email"},
        {name:"类别",child:[
            {name:"借款类",child:[
                {name:"电话",field:"Phone"},
                {name:"邮件",field:"Email"}
            ]},
            {name:"报销类",child:[
                {name:"电话",field:"Phone"},
                {name:"邮件",field:"Email"}
            ]}
        ]}
    ];*/
    return initGrid;
});