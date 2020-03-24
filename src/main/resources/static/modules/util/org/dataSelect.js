/*
参数列表
config = {
	id : id, //用于缓存数据的id,通常为当前触发元素id
	multi : false, //单选or多选
	title : "数据选择",
	height : "320px", //默认值320px
	width : "800px", //默认值800px
	tagData : ["user","role","group","post"], //控制显示的数据类型
	hideTag : false, //当tagData只有一条数据时,选择是否隐藏标签
	realTimeData : false, //强制刷新层级树
	dataFilter : {user:{root:"123",hide:[],show:[]}},
	tagAsync : { //指定标签类型,异步加载左侧树
		user:{param:[],url:""}
	},
	dataRefill : true, //数据回填
	initData : [], //初始化数据id数组
	simpleReturnData : false, //是否返回简单数据数组,和一个简单数据映射集
	callback : function(data){}, //处理数据的回调函数
}
*/
define(["PDUtilDir/dialog","text!PDUtilDir/org/dataSelect.html",
	/*"css!PDUtilDir/css/dataSelect.css",*/"ZTree","css!ZTreeCss",
	"MCScrollbarDir/jquery.mCustomScrollbar.concat.min",
	"css!MCScrollbarDir/jquery.mCustomScrollbar.min"],function(Dialog,template){
	var dataCacheObj = {},
		hasParentData = {
			group : true,
			dept : true
		},
        multiTypeSearch=getServicePath() +"/org/orgSearchForOrgSelect",
		typeList = {
			user : {
				key : {
					tree : {
						id : "deptUuid",
						name : "deptName",
						code : "deptCode",
						pcode : "pDeptTreeId"
					},
					data : {
						id : "userUuid",
						code : "userCode",
						name : "userName",
						pname : "deptName"
					}
				},
				name : "人员",
				all : getServicePath() +"/org/dept/getAllDept",
				id :  getServicePath() +"/org/user/getUserByDeptUuid",
				mh :  getServicePath() +"/org/user/getUserMh"
			},
			role : {
				key : {
					tree : {
						id : "dirCode",
						name : "dirName",
						code : "dirCode",
						pcode : "pDirCode"
					},
					data : {
						id : "roleUuid",
						code : "roleCode",
						name : "roleName",
						pname : "dirName"
					}
				},
				name : "角色",
				all :  getServicePath() +"/org/roledir/getAllRoleDir",
				id :  getServicePath() +"/org/role/getRoleByRoleDirCode",
				mh :  getServicePath() +"/org/role/getRoleMh"
			},
			group : {
				key : {
					tree : {
						id : "deptTreeId",
						name : "deptName",
						code : "deptCode",
						pcode : "pDeptTreeId"
					},
					data : {
						id : "deptUuid",
						code : "deptCode",
						name : "deptName",
						pname : "pDeptTreeId"
					}
				},
				name : "群组",
				all : getServicePath() +"/org/dept/getAllDept",
				id : getServicePath() +"/org/dept/getAllChildDeptByDeptTreeId",
				mh : getServicePath() +"/org/dept/getDeptMh"
			},
			post : {
				key : {
					tree : {
						id : "deptUuid",
						name : "deptName",
						code : "deptCode",
						pcode : "pDeptTreeId"
					},
					data : {
						id : "gwUuid",
						code : "gwCode",
						name : "gwName",
						pname : "pDeptTreeId"
					}
				},
				name : "岗位",
				all : getServicePath() +"/org/dept/getAllDept",
				id : getServicePath() +"/org/dept/getGwByDeptUuid",
				mh : null
			},
			dept : {
				key : {
					tree : {
						id : "deptTreeId",
						name : "deptName",
						code : "deptCode",
						pcode : "pDeptTreeId"
					},
					data : {
						id : "deptUuid",
						code : "deptCode",
						name : "deptName",
						pname : "pDeptTreeId"
					}
				},
				name : "部门",
				all : getServicePath() +"/org/dept/getAllDept",
				id : getServicePath() +"/org/dept/getAllChildDeptByDeptTreeId",
				mh : getServicePath() +"/org/dept/getDeptMh"
			}
		};

	function getDataByAll(code,type,callback){
		$.ajax({
			type:"GET",
			url:typeList[type].all+(code?"?code="+code:""),
			success:function(data){
				if(!data){data=[];}
				callback(data);
			},
			error:function(xhr){
				callback([]);
			}
		});
	}

	function getDataById(id,type,callback){
		var data={};
		data[typeList[type].key.tree.id]=id;
		$.ajax({
			type:"GET",
			url:getServer()+typeList[type].id,
			data:data,
			success:function(data){
				if(!data){data=[];}
				callback(data);
			},
			error:function(xhr){
				callback([]);
			}
		});
	}

	function getDataByMh(text,id,type,callback){
		if (!typeList[type].mh) {
			return false;
		}
		var data={};
		/*
		data[typeList[type].key.data.code]=text;
		data[typeList[type].key.data.name]=text;
		*/
		data.param = text;
		data[typeList[type].key.tree.id]=id;
		$.ajax({
			//type:"GET",
			type:"POST",
			url:getServer()+typeList[type].mh,
			data:data,
			dataType:"json",
			success:function(data){
				if(!data){data=[];;}
				callback(data);
			},
			error:function(xhr){
				callback([]);
			}
		});
	}

	function toggleInputStatus($input,flag){
		var status;
		if (!$input.length) {return;}
		if (typeof flag == "boolean") {
			flag?($input[0].checked=true):$input.removeAttr("checked");
			status = flag;
		} else {
			if($input.is(":checked")){
	            $input.removeAttr("checked");
	            status = false;
	        }else{
	            $input[0].checked = true;
	            status = true;
	        }
		}
        return status;
	}

	function getInputStatus($input){
		return $input.is(":checked");
	}

    function transformation(string){
        return string.replace(/[;\.\[\]\s]/g,"\\$&");
    }
	//ZTree辅助函数

	function resetZTreeStatus(id){
		var treeObj = $.fn.zTree.getZTreeObj(id),
			$nodes = $("#"+id).children();
		if (!treeObj) { return false;}
		treeObj.expandAll(false);
		if ($nodes.length==1) {
			treeObj.expandNode(treeObj.getNodeByTId($nodes.first().attr("id")),true);
		}
		clearZTreeSelectedStatus(id);//清除节点选中状态
	}

	function clearZTreeSelectedStatus(id){
		var treeObj = $.fn.zTree.getZTreeObj(id);
		if (!treeObj) { return false;}
		treeObj.cancelSelectedNode();
	}

	function getZTreeSelectedNode(id){
		return $.fn.zTree.getZTreeObj(id).getSelectedNodes();
	}

	//人员选择类
	function DataSelect(config){
		this.config = $.extend({
			dataRefill : true,
			realTimeData : false
		},config);
		this.selectData = {};
		//init Dialog
        this.dialog = this.initDialog();
		var $dialog = this.dialog.$getDialog();
		this.$dataTree = $dialog.find(".dataTree");
		this.$dataList = $dialog.find(".dataList");
		this.$selectList = $dialog.find(".selectList");

		//add scrollBar
		$dialog.find(".dataSelect .mod").children(".scrollWrapper").mCustomScrollbar({
			theme: "minimal-dark",
			scrollInertia:500
		});
		//init DataTree
		this.initDataTree(this.$dataTree);

		//bind event
		this.bindEvent();
	}

	DataSelect.prototype.bindEvent = function(){
		var _this = this;
		//bind dataType event
		this.$dataTree.find(".type").on("click","li",function(event){
			var curType = $(this).data("type"),$curTree,selectedNode;
			if ($(this).is(".on")) {return false;}
			$(this).addClass("on").siblings().removeClass("on");
			$curTree = _this.$dataTree.find("#tree_"+curType);
			if(!$curTree.length){
				$curTree = _this.initTree(_this.$dataTree.find(".tree"),curType);
			}
			$curTree.addClass("on").siblings().removeClass("on");
			_this.setInfo(curType,{id:null,name:"全部"});
			_this.setDataListTitle(curType);
			_this.clearDataList();
			clearZTreeSelectedStatus("tree_"+curType);
		});

		//bind dataList event
		this.$dataList.on("click",".list li",function(event){
			var elem = event.target,
				$selectAllData = _this.$dataList.find(".title #selectAllData");
			_this.toggleSelectData($(this).data("data"),$(this).closest(".list").data("type"));
			_this.setSelectAllData();
		}).on("click","#selectAllData",function(event){
			var $inputs = _this.$dataList.find(".list .data input"),
				type = _this.$dataList.find(".list").data("type");
			if (getInputStatus($(this))) {
				$inputs.not(":checked").each(function(){
					//toggleInputStatus($(this),true);
					_this.toggleSelectData($(this).closest("li").data("data"),type);
				});
			} else {
				$inputs.filter(":checked").each(function(){
					//toggleInputStatus($(this),false);
					_this.toggleSelectData($(this).closest("li").data("data"),type);
				});
			}
		});

		//bind selectList event
		this.$selectList.find(".list").on("dblclick","li",function(event){
			var type = $(this).parent().attr("class"),
				id = $(this).data("id");
			_this.delSelectData(_this.selectData[type][id],type);
			_this.setSelectAllData();
		}).on("click","li",function(event){
			$(this).closest(".list").find("li").removeClass("cur");
			$(this).addClass("cur");
		});
		this.$selectList.find(".tool").on("click","a.btn",function(event){
			var className = $(this).attr("class"),
				$li = _this.$selectList.find(".list li.cur"),
				type = $li.parent().attr("class");
			if (!$li.length) {return false;}
			if (className.indexOf("remove")>-1) {
				_this.delSelectData(_this.selectData[type][$li.data("id")],type);
				_this.setSelectAllData();
			} else {
				if (className.indexOf("up")>-1) {
					$li.prev().before($li);
				} else if (className.indexOf("down")>-1) {
					$li.next().after($li);
				}
			}
		});

		//bind search event
		var searchTrigger=null; //lazySearch
		this.$dataList.find(".search input").on("keyup",function(event){
			var text = $.trim($(this).val());
			clearTimeout(searchTrigger);
			searchTrigger = setTimeout(function(){
				_this.search(text);
			},300);
		})
	};

	DataSelect.prototype.search = function(text){
		var _this = this,
			type = this.$dataTree.find(".info .curType").data("type"),
			id = this.$dataTree.find(".info .curPos").data("pos");
		if (!text) {
			getDataById(id,type,function(data){
				_this.initDataList(data,type);
			});
		} else {
			getDataByMh(text,id,type,function(data){
				_this.initDataList(data,type);
			});
		}
	};

	DataSelect.prototype.initDialog = function(){
		var _this = this;
		var dialog = Dialog({
            id:"DataSelectDialog",
            cache:true,
            title:"数据选择",
            width:"800px",
            height:"320px",
			zIndex:1100,
            modal:"hide",              //modal-lg或modal-sm
            body:template,
            buttons:[{
            	name : "确定",
            	close : true,
            	callback : function(){
					_this.cacheSelectData();
            		_this.config.callback?(function(){
            			if(_this.config.simpleReturnData){
            				var simpleReturnData = _this.getSimpleReturnData();
            				_this.config.callback(simpleReturnData.data,simpleReturnData.set);
            			}else{
            				_this.config.callback($.extend({},dataCacheObj[_this.config.id]));
            			}
            		})():null;
					_this.hide();
            	}
            }]
        });
        dialog.$getDialog().on('hidden.bs.modal', function (e) {
		  _this.clear();
		});
        return dialog;
	};

	DataSelect.prototype.initDataTree = function($wrap){
		this.initType($wrap.find(".type"));
	};

	DataSelect.prototype.initType = function($wrap){
		var _this = this;
		//init urlList
		var $frag = $(document.createDocumentFragment()),
			$li;
		$wrap.append('<ul class="nav"></ul>');
		for(var type in typeList){
            if(typeList.hasOwnProperty(type)){
                $li = $('<li id="type_'+type+'"><a>'+typeList[type].name+'</a></li>');
                $li.data("type",type);
                $frag.append($li);
            }
		}
		$wrap.children('.nav').append($frag);
	};

	DataSelect.prototype.initTree = function($wrap,type){
		var _this = this;
		var setting,data,
			$tree = $wrap.find("#tree_"+type);
		
		if ($tree.length>0||!type) {
			return $tree;
		}

		$tree = $('<div id="tree_'+type+'" class="ztree"></div>');
		$wrap.append($tree);
		setting = {
			data : {
				key : {
					name : typeList[type].key.tree.name
				},
				simpleData : {
					enable : true,
					idKey : typeList[type].key.tree.code,
					pIdKey : typeList[type].key.tree.pcode
				}
			},
			callback : {
				beforeClick : function(treeId,treeNode){
					var selectedNode = getZTreeSelectedNode(treeId)[0],
						dataArr = [],
						key = typeList[type].key.tree;
					//已选中则不进行数据查询
					if(selectedNode&&selectedNode[key.id]==treeNode[key.id]){return false;}
					//是否添加当前节点数据到结果集中
					hasParentData[type]?dataArr.push(treeNode):false;
					//设置提示信息
					_this.setInfo(null,{id:treeNode[key.id],name:treeNode[key.name]});
					//请求数据
					getDataById(treeNode[key.id],type,function(data){
						_this.initDataList(dataArr.concat(data),type);
					});
					return true;
				}
			}
		};
		//async 对某些树需要异步加载节点的配置
		var async = this.config.tagAsync&&this.config.tagAsync[type];
		if(async&&async.url){
			typeList[type].allSync = typeList[type].all;
			typeList[type].all = async.url;
			setting.async = {
				dataType:"json",
				autoParam:async.param,
				enable:true,
				url: getServer()+async.url
			}
		}else{
			if(typeList[type].allSync){
				typeList[type].all = typeList[type].allSync;
				delete typeList[type].allSync;
			}
		}
        var root = this.config.dataFilter[type]?this.config.dataFilter[type].root:undefined;
		getDataByAll(root,type,function(data){
			if (!data||!data.length) {$tree.remove();return;}
			$.fn.zTree.init($tree,setting,data);
			_this.config.dataFilter[type]?_this.treeNodeFilter($tree,type):false;
            resetZTreeStatus($tree.attr("id"));
		});
		return $tree;
	};

    DataSelect.prototype.treeNodeFilter = function($tree,type){
        var treeObj = $.fn.zTree.getZTreeObj($tree.attr("id")),
            filter = this.config.dataFilter[type],
            key = typeList[type].key;
		/*
        if(filter.root) {
            var $root;
            root = treeObj.getNodeByParam(key.tree.id,filter.root);
            $root = $tree.find("#" + root.tId).detach();
            $tree.empty();
            $tree.append($root);
        }
        */
        if(filter.hide){
            var hide = filter.hide,
                show = filter.show||[],
                hNode,sNode;
            for(var i= 0,length=hide.length;i<length;i++){
                hNode = treeObj.getNodeByParam(key.tree.id,hide[i],root);
				treeObj.removeNode(hNode);
            }
        }
    };

	DataSelect.prototype.setDataListTitle = function (type) {
		var $title = this.$dataList.find(".title .titleWrapper"),
			name = typeList[type].name;
		$title.empty().append('<span class="type">'+(this.config.multi?'<input type="checkbox" id="selectAllData">':'')+'</span>'+
			'<span class="name">'+name+'名称</span>'+
			'<span class="code">'+name+'编码</span>'+
			'<span class="pname">'+name+'归属</span>');
	};

	DataSelect.prototype.initDataList = function(dataArr,type){
		var $list = this.$dataList.find(".list"),
			key = typeList[type].key.data;

		this.clearDataList();

		if (!dataArr||!dataArr.length) {
			return false;
		}

		var	$data = $('<ul class="data"></ul>'),
			$frag = $(document.createDocumentFragment()),
			$li,idStr,
			extraKey=this.config.extraKey[type];
		for(var i=0,cur,content;i<dataArr.length;i++){
			curData = dataArr[i];
			if(!curData[key.id]){continue}
			//extraKey
			idStr = curData[key.id]+(extraKey?this.getKey(curData,extraKey):'');
			content = (curData[key.name]||'无')+'/'+(curData[key.code]||'无')+'/'+(curData[key.pname]||'无');
			$li = $('<li id="data_'+(idStr||'noKey')+'" title="'+content+'">'+
					'<span class="name">'+(curData[key.name]||'无')+'</span>'+
					'<span class="code">'+(curData[key.code]||'无')+'</span>'+
					'<span class="pname">'+(curData[key.pname]||'无')+'</span>'+
					'</li>');
			$li.prepend('<span class="type"><input type="'+(this.config.multi?'checkbox':'radio')+'" name="listItem"></span>');
			$li.data("data",curData);
			if (this.selectData[type][idStr]) {
				toggleInputStatus($li.find("input"),true);
			}
			$frag.append($li);
		}
		$data.append($frag);
		$list.append($data).data("type",type);
		this.setSelectAllData();
	};

	DataSelect.prototype.setSelectAllData = function(){
		var $selectAllData = this.$dataList.find(".title #selectAllData");
		$selectAllData.length?toggleInputStatus($selectAllData,!this.$dataList.find(".list .data input").not(":checked").length):false;
	};

	DataSelect.prototype.clearDataList = function(){
		this.$dataList.find(".list").empty();
	};

	DataSelect.prototype.initSelectList = function(dataListObj){
		if (!dataListObj) {return false;}
		var $list = this.$selectList.find(".list");
		$list.empty();
		for(var type in dataListObj){
            if(!dataListObj.hasOwnProperty(type)||!dataListObj[type].length){continue}
			$list.append('<ul class="'+type+'"></ul>');
			this.addSelectData(dataListObj[type],type);
		}
	};

	DataSelect.prototype.clearSelectList = function(){
		this.$selectList.find(".list").empty();
	};

	DataSelect.prototype.initTypeTag = function(tagData){
		var $wrap = this.$dataTree.find(".type .nav"),
			$tree = this.$dataTree.find(".tree"),
			$tag,curType;
		//重置数据显示状态
		$wrap.children().removeClass("on");
		//是否强制刷新tree
		this.config.realTimeData?$tree.empty():$tree.children().removeClass("on");
		//是否隐藏tag标签
		if(tagData.length==1&&this.config.hideTag){
			!this.$dataTree.hasClass("hideTag")?this.$dataTree.addClass("hideTag"):null;
		}else{
			this.$dataTree.removeClass("hideTag");
		}
		//初始化当前可用数据类型
		for (var i = 0,type; i < tagData.length; i++) {
			type = tagData[i];
			$tag = $wrap.children("#type_"+type);
			if (!$tag.length) {
				$tag = $('<li id="type_'+type+'"><a>'+typeList[type].name+'</a></li>');
				$tag.data("type",type);
			} else {
				resetZTreeStatus("tree_"+type);
			}
			$tag.addClass("init");
			$wrap.append($tag);
		}
		$wrap.children().not(".init").each(function(){
			var type = $(this).data("type");
			$(this).closest(".dataTree").find(".tree #tree_"+type).remove();
			$(this).remove();
		});
		//初始化数据显示状态
		curType = $wrap.children().removeClass("init").first().addClass("on").data("type");
		this.initTree($tree,curType).addClass("on");
		this.setDataListTitle(curType);
	};

	DataSelect.prototype.initSelectData = function(tagData,initData){
		this.selectData = {};
        var _this=this;
		//清空selectData数据,合并初始化选中数据
		for (var i = 0,type; i < tagData.length; i++) {
            type = tagData[i];
			this.selectData[type] = {};
		}
		//初始化selectList
		var curDataCacheObj = dataCacheObj[_this.config.id];
		if(this.config.dataRefill&&curDataCacheObj) {
            _this.initSelectList(dataCacheObj[_this.config.id]||{});
		}else{
			if(initData){
				dataCacheObj[_this.config.id] = initData;
				_this.initSelectList(initData);
			}
			/*
			$.ajax({
				type:"GET",
				url:getServer()+multiTypeSearch,
				data:initData,
				success:function(data){
					if(!data){return}
					var curDataCacheObj = dataCacheObj[_this.config.id]||{};
					for (var i = 0,type; i < tagData.length; i++) {
						type = tagData[i];
						if(data[type]){
							curDataCacheObj[type] = curDataCacheObj[type]||[];
							curDataCacheObj[type] = curDataCacheObj[type].concat(data[type]);
						}
					}
					_this.initSelectList(curDataCacheObj);
				},
				error:function(xhr){
				}
			});
			*/
        }
	};

	DataSelect.prototype.clearSelectData = function(){
		this.selectData = {};
	};

    //从 selectList 获取数据
	DataSelect.prototype.cacheSelectData = function(){
		var dataListObj={},
            selectData=this.selectData;
        this.$selectList.find(".list ul").each(function(){
            var type = this.className;
            dataListObj[type]=[];
            $(this).children("li").each(function(){
                dataListObj[type].push(selectData[type][$(this).data("id")]);
            });
        });
		dataCacheObj[this.config.id] = dataListObj;
	};

	DataSelect.prototype.toggleSelectData = function(data,type){
		var key = typeList[type].key.data,
			extraKey=this.config.extraKey[type],
			idStr;
		idStr = data[key.id]+(extraKey?this.getKey(data,extraKey):'');
		if(!this.selectData[type]||!this.selectData[type][idStr]){
			this.addSelectData(data,type);
		}else{
			this.delSelectData(data,type);
		}
	};

	DataSelect.prototype.addSelectData = function(dataArr,type){
		var key = typeList[type].key.data,
			$target = this.$dataList.find(".list .data"),
			$wrap = this.$selectList.find(".list ."+type),
			$li,extraKey=this.config.extraKey[type];

		if (!dataArr||!type) {return false;}
		if (dataArr.constructor==Object) {dataArr=[dataArr];}

		if (!$wrap.length) {
			$wrap = $('<ul class="'+type+'"></ul>');
			this.$selectList.find(".list").append($wrap);
		}

		if (!this.config.multi) {
			if (dataArr.length!=1) {
				return false;
			}
			$wrap.empty().siblings().remove();
			for(var tag in this.selectData){
                if(!this.selectData.hasOwnProperty(tag)){continue}
				this.selectData[tag]={};
			}
		}
		for (var i = 0,curData,content,idStr; i < dataArr.length; i++) {
			curData = dataArr[i];
			idStr = curData[key.id]+(extraKey?this.getKey(curData,extraKey):'');
			content =(curData[key.name]||'无')+'/'+(curData[key.code]||'无')+'/'+(curData[key.pname]||'无');
            if(!!this.selectData[type][idStr]){continue}
			$li = $('<li id="select_'+(idStr||'')+'" title="'+content+'"><span class="text">'+content+'</span></li>');
			$li.data("id",idStr);
			$wrap.append($li);
			toggleInputStatus($target.find("#data_"+transformation(idStr)+" input"),true);
			this.selectData[type][idStr]=curData;
		}
	};

	DataSelect.prototype.delSelectData = function(dataArr,type){
		var key = typeList[type].key.data,
			$wrap = this.$selectList.find(".list ."+type),
			$target = this.$dataList.find(".list .data"),
			extraKey=this.config.extraKey[type];
		if (!dataArr||!type) {return false;}
		if (dataArr.constructor==Object) {dataArr=[dataArr];}

		for (var i = 0,curData,idStr; i < dataArr.length; i++) {
			curData = dataArr[i];
			idStr = curData[key.id]+(extraKey?this.getKey(curData,extraKey):'');
            if(!this.selectData[type][idStr]){continue}
			delete this.selectData[type][idStr];
			$wrap.children("#select_"+transformation(idStr)).remove();
			toggleInputStatus($target.find("#data_"+transformation(idStr)+" input"),false);
		}
		if (!$wrap.children().length) {
			$wrap.remove();
		}
	};

	DataSelect.prototype.getSimpleReturnData = function(){
		var selectData = this.selectData,
			simpleReturnData = {
				data : [],
				set : {}
			},
			key=null,data=null;
		simpleReturnData.set = selectData;
		for(var type in selectData){
            if(!selectData.hasOwnProperty(type)){continue}
			key = typeList[type].key.data;
			for(var id in selectData[type]){
                if(!selectData[type].hasOwnProperty(id)){continue}
				data = selectData[type][id];
				simpleReturnData.data.push({
					id : data[key.id],
					code : data[key.code],
					name : data[key.name],
					type : type,
					extrKey : this.config.extraKey[type]||null
				});
			}
		}
		return simpleReturnData;
	};

	DataSelect.prototype.setInfo = function(type,pos){
		if (!!type) {
			this.$dataTree.find(".curType span").text(typeList[type].name).attr("title",typeList[type].name).
						   parent().data("type",type);
		}
		this.$dataTree.find(".curPos span").text(pos.name).attr("title",pos.name).parent().data("pos",pos.id);
	};

	DataSelect.prototype.setCss = function(){
		this.dialog.$getDialog().
				find(".modal-dialog").css("width",this.config.width).
				find(".modal-body").css("height",this.config.height);
	};

	DataSelect.prototype.clearSearchContent = function(){
		this.$dataList.find(".search input").val("");
	};

	DataSelect.prototype.init = function(config){
		if (!config||!config.id) {return false;}
		var treeRefresh = !!this.config.dataFilter||!!config.dataFilter;
		//初始化配置参数
		$.extend(this.config,{
            dataFilter:{},
			multi : false,
			tagData : ["user"],
			width : "800px",
			height : "320px",
			hideTag : false,
			dataRefill : true,
			realTimeData : treeRefresh,
			simpleReturnData : false,
			extraKey:{
				user : ["deptUuid"]
			},
			tagAsync : {
				user : {
					param : ["deptTreeId"],
					url :  getServicePath() +"/org/dept/getAsyncDeptTree"
				}
			}
		},config);
		this.dialog.setTitle(config.title||"人员选择");
		this.setCss();//设置当前配置样式
		this.setInfo(config.tagData[0],{id:null,name:"全部"});
		this.initTypeTag(config.tagData);
		this.initSelectData(config.tagData,config.initData);
	};

	DataSelect.prototype.clear = function(){
		this.clearDataList();
		this.clearSearchContent();
		this.clearSelectList();
		this.clearSelectData();
	};

	DataSelect.prototype.show = function(){
		this.dialog.show();
	};

	DataSelect.prototype.hide = function(){
		this.dialog.hide();
	};

	DataSelect.prototype.getKey = function(data,extraKey){
		var idStr="";
		if(extraKey&&extraKey.length){
			for(var j=0;j<extraKey.length;j++){
				idStr += "-"+data[extraKey[j]];
			}
		}
		return idStr;
	};

	var dataSelect = new DataSelect({
		callback : function(data){
		}
	});

	function Init(config){
		/*var dataSelect = new DataSelect({
			callback : function(data){
			}
		});*/
		dataSelect.init(config);
		dataSelect.show()
	}

	Init.getData = function(dataId,type,id){
		var result=null;
		switch(arguments.length){
			case 1 : 
				result = dataCacheObj[dataId];break;
			case 2 : 
				result = dataCacheObj[dataId]?dataCacheObj[dataId][type]:result;break;
			case 3 : 
				var key=typeList[type].key.data,
					dataArr = dataCacheObj[dataId]?dataCacheObj[dataId][type]:null;
				if (dataArr&&dataArr.length) {
					for (var i = 0; i < dataArr.length; i++) {
						if(dataArr[i][key.id]==id){
							result = dataArr[i];
							break;
						}
					}
				}
				break;
			default : console.log("getData 参数错误");
		}
		//创建新数据副本
		if (result) {
			if (result.constructor===Object) {
				result = $.extend({},result);
			} else if (result.constructor===Array) {
				result = result.concat([]);
			}
		}
		return result;
	};
	
	return Init;
});