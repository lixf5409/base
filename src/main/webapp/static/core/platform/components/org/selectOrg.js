define(["PDUtilDir/util",
	'PDUtilDir/alert',
    "PDUtilDir/dialog",
    "text!PDUtilDir/org/selectOrg.html",
    "PDUtilDir/grid",
    "MCScrollbarDir/jquery.mCustomScrollbar.concat.min",
    "css!MCScrollbarDir/jquery.mCustomScrollbar.min",
    "ZTree","css!ZTreeCss"], function(CoreUtil, Alert, Dialog, BodyTemplate, Grid){


    function init(config){
        var func = function(){
            //放到这里而不放到define里因为该js依赖ztree.js
            require(['ZTreeExhide'], function(){
                new OrgSelect().init(config);
            });
        };

        //如果传入ID，则绑定事件，以点击事件的方式打开组织选择
        if(config.id){
            var dom = $('#' + config.id);
            if(dom){
                dom.click(function(){
                    func();
                });
            }else{
                Alert({
                	message: '【组织选择】未找到id对应的DOM节点'
                });
            }
        }else{
            func();
        }
    }


    function OrgSelect(){
        this.Util = new Util(this);
        this.$main = null;
        this.config = null;
        this.allType = {};
    }

    //全部在这里定义一遍，减去后续繁琐的属性是否存在问题
    OrgSelect.prototype.init = function(config){
        var def = {
            multi: false,
            title: '组织选择',
            tagType: ['user'],
            treeData: {},            //可自定义左侧树的数据
            gridData: {},             //自定义的列表数据
            rootNode: {
                user: [],
                dept: [],
                role: [],
                roleMember: [],
                gw: []
            },
            hideNode: {
                user: [],
                dept: [],
                role: [],
                roleMember: [],
                gw: []
            },
            showNode: {
                user: [],
                dept: [],
                role: [],
                roleMember: [],
                gw: []
            },
            data: {                                    //自定义右侧选中的数据
                user: [],
                dept: [],
                role: [],
                roleMember: [],
                gw: []
            },
            callback: function(data){},
            afterClose: function(){}
        };
        this.config = $.extend(true, def, config);
        this.createDialog();
        return this;
    };

    OrgSelect.prototype.getTypeObj = function(type){
        return this.allType[type];
    };

    /**
     * 创建弹出窗口
     */
    OrgSelect.prototype.createDialog = function(){
        var _this = this;
        var dialog = Dialog({
            //id : "PD-SelectOrg-Dialog-Id",
            title: _this.config.title,
            zIndex: 1100,
            width: "832px",
            height: "374px",
            body: BodyTemplate,
            dialogSize: "modal-lg",              //modal-lg或modal-sm
            afterClose: _this.config.afterClose,
            afterLoad: function(){
                _this.$main = $("div[class='pd-selectOrg']");
                _this.initTab();                                  //页签初始化
                var select = new Selected(_this).init();            //已选列表初始化
                _this.allType["selected"] = select;
                for(var i= 0,type; type=_this.config.tagType[i++];){
                    switch (type){
                        case "user":
                            _this.allType["user"] = new User(select, _this).init();  //人员选择初始化
                            break;
                        case "dept":
                            _this.allType["dept"] = new Dept(select, _this).init();  //部门选择初始化
                            break;
                        case "role":
                            _this.allType["role"] = new Role(select, _this).init();  //部门选择初始化
                            break;
                        case "roleMember":
                            _this.allType["roleMember"] = new RoleMember(select, _this).init();
                            break;
                        case "gw":
                            _this.allType["gw"] = new Gw(select, _this).init();    //部门选择初始化
                    }
                }
                
                //页签滚动条美化
                _this.$main.find(".pd-selectOrg-tree").mCustomScrollbar({
                    axis: "yx",
                    theme: "minimal-dark",
                    advanced: {
                    	autoExpandHorizontalScroll: true     //该参数处理横向滚动条默认在最右侧问题
                    }      
                });
                
                //已选择列表
                _this.$main.find(".pd-selectOrg-selectList").mCustomScrollbar({
                    axis: "y",
                    theme: "minimal-dark"
                });
            },
            buttons: [{
                name: "确定",
                callback: function(){
                    var Selected = _this.allType["selected"];
                    var result = {"user":[],"dept":[],"role":[],"roleMember":[],"gw":[]};
                    var list = Selected.$ul.find(">li");
                    for(var i= 0,li; li=list[i++];){
                        result[$(li).data("type")].push($(li).data("row"));
                    }
                    var r = _this.config.callback(result);
                    //如果显示返回false则不主动关闭窗口
                    (typeof(r) == 'boolean' && r == false) ? '' : dialog.hide();
                }
            }]
        });

        return dialog;
    };

    OrgSelect.prototype.initTab = function(){
        var _this = this;
        var map = {
            user: '人员',
            dept: '部门',
            role: '角色',
            roleMember: '人员',
            gw: '岗位'
        };
        var data = [];
        for(var i= 0,item; item=this.config.tagType[i++];){
            data.push({
            	typeName: map[item],
            	type: item
            });
        }
        //页签部分
        var navHtml = CoreUtil.template("T_orgSelectTab", {items:data});
        this.$main.find("ul[class='pd-selectOrg-nav']").html(navHtml);
        //页签对应的内容部分
        var paneHtml = CoreUtil.template("T_orgSelectTabPane", {items:data});
        this.$main.find("div[class='pd-selectOrg-tabContent']").html(paneHtml);
        //页签切换处理
        var paneArr = this.$main.find("div[class='pd-selectOrg-tabContent']>div");
        var tabArr = this.$main.find("ul[class='pd-selectOrg-nav']>li");
        tabArr.bind('click', function(){
            for(var i= 0,item; item=tabArr[i++];){
                if(item == this){
                    paneArr.hide();
                    $(paneArr[i-1]).show();
                    tabArr.removeClass("pd-selectOrg-activity");
                    $(tabArr[i-1]).addClass("pd-selectOrg-activity");
                    //刷新对应表格数据(解决在角色人员选择人后，切换到部门人员下未选中问题)
                    _this.getTypeObj($(item).data("type")).myGrid.refresh();
                }
            }
        });
    };

    /*=========================封装人员选择相关操作=============================*/
    function User(select, main){
        this.myGrid = null;
        this.Selected = select;
        this.Main = main;
    }

    User.prototype.getElement = function(row){
        var text = row["userName"] +"/"+ row["userCode"];
        return $("<li title='" + text + (row.deptName ? '/' + row.deptName : '') + "'>" + text + "</li>");
    };

    User.prototype.init = function(){
        this.initData();
        this.createDeptTree();
        //默认显示root节点下的所有数据
        this.showPersonList();
        this.mhSearch();
        return this;
    };

    User.prototype.initData = function(){
        var _this = this;
        if(_this.Main.config.data.user.length){
            var url = '', data = '';
            if(typeof(_this.Main.config.data.user[0]) == "object"){
                //人员+部门
                url = getServicePath() + "/api/org/selectorg/getUserListByUserAndDeptIdArr";
                data = JSON.stringify(_this.Main.config.data.user);
            }else if(typeof(_this.Main.config.data.user[0]) == "string"){
                //人员列表
                url = getServicePath() + "/api/org/selectorg/getUserListByUuids";
                data = _this.Main.config.data.user.join(";");
            }else{
                return;
            }
            
            $.ajax({
                url: url,
                type: 'post',
                //包含人员与部门ID
                data:{
                    uuids: data
                },
                dataType: 'json',
                success: function(data){
                    /*for(var i= 0,row;row=data[i++];){
                        _this.Selected.add("user",row,_this.getElement(row),_this.rule)
                    }*/
                    var len = data.length;
                    for(var i=0; i<len; i++){
                        var row = data[i];
                        if(row){
                            _this.Selected.add('user', row, _this.getElement(row), _this.rule);
                        }
                    }
                }
            });
        }
    };

    User.prototype.rule = function(row, compareData){
        return (row.userUuid == compareData.userUuid && row.ou == compareData.ou) ? true : false;
    };

    User.prototype.createDeptTree = function(){
        var _this = this;
        var setting = {
            callback: {
                onClick: function(event, treeId, treeNode){
                	//判断是否自定义了gridData.user
                	if(!_this.Main.config.gridData.user){
            			//没有设置gridData.user
            			_this.myGrid.reload({
                        	data: {
                        		type: 'URL',
                        		value: getServicePath() + '/api/org/selectorg/getUserByDeptUuidForGrid?deptUuid=' + treeNode.deptUuid
                        	}
                        });
                	}else if(typeof(_this.Main.config.gridData.user) == 'function'){
                		//gridData.user为自定义数据
                		var data = _this.Main.config.gridData.user(treeNode);
                		if(typeof(result) != 'undefined'){
                			//如果返回值不为空，将data渲染至列表
            				_this.myGrid.reload({
                    			data: data
                    		});
                		}else{
                			console.warn('selectOrg: gridData.user is a function but has no return value.');
                		}
                		
                	}else if(typeof(_this.Main.config.gridData.user) == 'object'){
                		//gridData.user为remote对象
                		var remote = {
                			url: '',
                			param: {},
                			success: null,
                			error: null
                		};
                		$.extend(remote, _this.Main.config.gridData.user);
                		
                		$.ajax({
                			url: remote.url,
                			type: 'post',
                			data: remote.param,
                			success: function(data){
                				if(typeof(remote.success) == 'function'){
                					//先执行自定义的success方法
                					var result = remote.success(data);
                					if(typeof(result) != 'undefined'){
                						//有返回值时，将返回值赋值给data
                            			data = result;
                					}
                				}
                				//将data渲染至列表
                				_this.myGrid.reload({
                        			data: data
                        		});
                			},
                			error: function(data){
                				console.warn('selectOrg: Failed to load remote gridData.user');
                				//如果有自定义error方法，执行
                				if(typeof(remote.error) == 'function'){
                					remote.error(data);
                				}
                			}
                		});
                	}else{
                		console.warn('selectOrg: gridData.user must be a function or an object.');
                	}
                    
                    $.fn.zTree.getZTreeObj("pd-selectOrg-user-tree").expandNode(treeNode);
                }
            }
        };
        if(_this.Main.config.treeData.user){
            $.fn.zTree.init($("#pd-selectOrg-user-tree"), this.Main.Util.simpleDeptTreeConfig(setting), _this.Main.config.treeData.user);
        }else{
            $.fn.zTree.init($("#pd-selectOrg-user-tree"), this.Main.Util.deptTreeConfig(setting, "user"));
        }
    };

    User.prototype.showPersonList = function(){
        var _this = this;
        var config = {
            id: "pd-selectOrg-user-list",
            multi: _this.Main.config.multi,
            pageSize: 6,
            pageList: [6,15,30,50],
            height: "230px",
            layout:[{
            	name: "用户名称",
            	field: "userName",
            	width: "75px",
            	sort: true
            },{
            	name: "员工编号",
            	field: "userCode",
            	width: "70px",
            	sort: true
            },{
            	name: "部门OU",
            	field: "ou",
            	width: "120px"
            }],
            data: [],
            onCheck: function(index, row){
                _this.Selected.add("user", row,_this.getElement(row), _this.rule);
            },
            onUncheck: function(index, row){
                _this.Selected.remove("user", [row], _this.rule);
            },
            onSelectAll: function(checked){
                var rows = _this.myGrid.getCurPageData();
                if(checked){
                    for(var i= 0,row; row=rows[i++];){
                        _this.Selected.add("user", row, _this.getElement(row), _this.rule);
                    }
                }else{
                    _this.Selected.remove("user", rows, _this.rule);
                }
            },
            onAfterRenderTable: function(){
                _this.Main.Util.gridCSSModify("user");
                //设置选中数据
                var data = _this.Selected.getDataByType("user");
                for(var i= 0,item; item=data[i++];){
                    this.checkRowByRule(_this.rule, item);
                }
            }
        };
        this.myGrid = Grid.init(config);
    };

    User.prototype.mhSearch = function(){
        var _this = this;
        if(_this.Main.config.treeData.user){
            $("#pd-selectOrg-user-search").hide();
            return false;
        }
        var search = function(text){
            var rootNode = _this.Main.config.rootNode["user"];
            _this.myGrid.reload({
                data: {
                    "type": "URL",
                    "value": getServicePath() + "/api/org/selectorg/getUserMhForGrid"
                },
                queryParam: {
                    "rootNode": rootNode.length > 0 ? JSON.stringify(rootNode) : "",
                    "param": text
                }
            });
        };
        _this.Main.Util.search("pd-selectOrg-user-search", search);
    };

    /*=========================封装部门选择相关操作=============================*/
    function Dept(select, main){
        this.myGrid = null;
        this.Selected = select;
        this.Main = main;
    }

    Dept.prototype.getElement = function(row){
        return $("<li>" + row["deptName"] + "/" + row["deptCode"] + "</li>");
    };

    Dept.prototype.init = function(){
        this.initData();
        this.createDeptTree();
        this.showDeptList();
        this.mhSearch();
        return this;
    };

    Dept.prototype.initData = function(){
        var _this = this;
        if(_this.Main.config.data.dept.length){
            $.ajax({
                url: getServicePath() + "/api/org/selectorg/getDeptListByDeptUuids",
                type: "post",
                data: {
                	uuids: _this.Main.config.data.dept.join(";")
                },
                success: function(data){
                    for(var i= 0,row; row=data[i++];){
                        _this.Selected.add("dept", row, _this.getElement(row), _this.rule);
                    }
                }
            });
        }
    };

    Dept.prototype.rule = function(row, compareData){
        return row.deptUuid == compareData.deptUuid ? true : false;
    };

    Dept.prototype.createDeptTree = function(){
        var _this = this;
        var setting = {
            callback: {
                onClick: function(event, treeId, treeNode){
                	if(!_this.Main.config.gridData.dept){
                		//没有自定义gridData.dept
                		_this.myGrid.reload({
                        	data: {
                        		type: 'URL',
                        		value: getServicePath() + '/api/org/selectorg/getAllChildDeptByDeptTreeIdForGrid?deptTreeId=' + treeNode.deptTreeId
                        	}
                        });
                	}else if(typeof(_this.Main.config.gridData.dept) == 'function'){
                		//自定义静态数据
                		//执行自定义方法，并接收返回值，将其渲染至列表
                		var data = _this.Main.config.gridData.dept(treeNode);
                		if(typeof(data) != 'undefined'){
                			_this.myGrid.reload({
                    			data: data
                    		});
                		}else{
                			console.warn('selectOrg: gridData.dept is a function but has no return value.');
                		}
                	}else if(typeof(_this.Main.config.gridData.dept) == 'object'){
                		//自定义远程数据
                		var remote = {
                			url: '',
                			param: {},
                			success: null,
                			error: null
                		};
                		$.extend(remote, _this.Main.config.gridData.dept);
                		
                		$.ajax({
                			url: remote.url,
                			type: 'post',
                			param: remote.param,
                			success: function(data){
                				if(typeof(remote.success) == 'function'){
                					//如果有自定义success方法，先执行并接收返回值
                					var result = remote.success(data);
                					if(typeof(result) != 'undefined'){
                						data = result;
                					}
                				}
                				_this.myGrid.reload({
                					data: data
                				});
                			},
                			error: function(data){
                				console.warn('selectOrg: Failed to load remote gridData.dept');
                				//如果有自定义error方法，执行
                				if(typeof(remote.error) == 'function'){
                					remote.error(data);
                				}
                			}
                		});
                	}else{
                		console.warn('selectOrg: gridData.dept must be a function or an object.');
                	}
                    
                    $.fn.zTree.getZTreeObj("pd-selectOrg-dept-tree").expandNode(treeNode);
                }
            }
        };
        if(_this.Main.config.treeData.dept){
            $.fn.zTree.init($("#pd-selectOrg-dept-tree"), this.Main.Util.simpleDeptTreeConfig(setting), _this.Main.config.treeData.dept);
        }else{
            $.fn.zTree.init($("#pd-selectOrg-dept-tree"), this.Main.Util.deptTreeConfig(setting, "dept"));
        }
    };

    Dept.prototype.showDeptList = function(){
        var _this = this;
        var config = {
            id: "pd-selectOrg-dept-list",
            multi: _this.Main.config.multi,
            pageSize: 6,
            pageList: [6,15,30,50],
            height: "230px",
            layout: [{
            	name: "部门名称",
            	field: "deptName",
            	sort: true
            },{
            	name: "部门编号",
            	field: "deptCode",
            	sort: true
            }],
            data: [],
            /*data:{
                "type":"URL",
                "value": getServicePath() + "/org/dept/getAllChildDeptByDeptTreeIdForGrid?deptTreeId=root"
            },*/
            onCheck: function(index, row){
                _this.Selected.add("dept", row, _this.getElement(row), _this.rule);
            },
            onUncheck: function(index, row){
                _this.Selected.remove("dept", [row], _this.rule);
            },
            onSelectAll: function(checked){
                var rows = _this.myGrid.getCurPageData();
                if(checked){
                    for(var i= 0,row; row=rows[i++];){
                        _this.Selected.add("dept", row, _this.getElement(row), _this.rule);
                    }
                }else{
                    _this.Selected.remove("dept", rows, _this.rule);
                }
            },
            onAfterRenderTable: function(){
                _this.Main.Util.gridCSSModify("dept");
                //设置选中数据
                var data = _this.Selected.getDataByType("dept");
                for(var i= 0,item; item=data[i++];){
                    this.checkRowByRule(_this.rule, item);
                }
            }
        };
        this.myGrid = Grid.init(config);
    };

    Dept.prototype.mhSearch = function(){
        var _this = this;
        if(_this.Main.config.treeData.dept){
            $("#pd-selectOrg-dept-search").hide();
            return false;
        }
        //分级管理时自定义根节点
        var rootNode = _this.Main.config.rootNode["dept"];
        var search = function(text){
            _this.myGrid.reload({
                data: {
                    type: "URL",
                    value: getServicePath() + "/api/org/selectorg/getDeptMhForGrid"
                },
                queryParam: {
                    rootNode: rootNode.length > 0 ? JSON.stringify(rootNode) : '',
                    param: text
                }
            });
        };
        _this.Main.Util.search("pd-selectOrg-dept-search", search);
    };

    /*=========================封装角色选择相关操作=============================*/
    function Role(select, main){
        this.myGrid = null;
        this.Selected = select;
        this.Main = main;
    }

    Role.prototype.getElement = function(row){
        return $("<li>" + row["roleName"] + "/" + row["roleCode"] + "</li>");
    };

    Role.prototype.init = function(){
        this.initData();
        this.createRoleTree();
        this.showRoleList("root");
        this.mhSearch();
        return this;
    };

    Role.prototype.initData = function(){
        var _this = this;
        if(_this.Main.config.data.role.length){
            $.ajax({
                url: getServicePath() + "/api/org/selectorg/getRoleListByUuids",
                type: "post",
                data: {
                	uuids: _this.Main.config.data.role.join(";")
                },
                success: function(data){
                    for(var i= 0,row; row=data[i++];){
                        _this.Selected.add("role", row, _this.getElement(row), _this.rule);
                    }
                }
            });
        }
    };

    Role.prototype.rule = function(row, compareData){
        return row.roleUuid == compareData.roleUuid ? true : false;
    };

    Role.prototype.createRoleTree = function(){
        var _this = this;
        var setting = {
            data: {
                key: {
                    name: 'dirName'
                },
                simpleData: {
                    enable: true,
                    idKey: 'dirCode',
                    pIdKey: 'pDirCode'
                }
            },
            callback: {
                onClick: function(event, treeId, treeNode){
                	if(!_this.Main.config.gridData.role){
                		//没有自定义gridData.role
                		//查询出该节点下的所有角色信息
                        _this.myGrid.reload({
                        	data: {
                        		type: 'URL',
                        		value: getServicePath() + '/api/org/selectorg/getRoleByRoleDirCodeForGrid?dirCode=' + treeNode.dirCode
                        	}
                        });
                	}else if(typeof(_this.Main.config.gridData.role) == 'function'){
                		//静态数据
                		//执行自定义方法，并接收返回值，将其渲染至列表
                		var data = _this.Main.config.gridData.role(treeNode);
                		if(typeof(data) != 'undefined'){
                			_this.myGrid.reload({
                    			data: data
                    		});
                		}else{
                			console.warn('selectOrg: gridData.role is a function but has no return value.');
                		}
                	}else if(typeof(_this.Main.config.gridData.role) == 'object'){
                		//remote数据
                		var remote = {
                			url: '',
                			param: {},
                			success: null,
                			error: null
                		};
                		$.extend(remote, _this.Main.config.gridData.role);
                		
                		$.ajax({
                			url: remote.url,
                			type: 'post',
                			param: remote.param,
                			success: function(data){
                				if(typeof(remote.success) == 'function'){
                					//如果有自定义success方法，先执行并接收返回值
                					var result = remote.success(data);
                					if(typeof(result) != 'undefined'){
                						data = result;
                					}
                					_this.myGrid.reload({
                						data: data
                					});
                				}
                			},
                			error: function(data){
                				console.warn('selectOrg: Failed to load remote gridData.role');
                				if(typeof(remote.error) == 'function'){
                					//如果有自定义error方法，执行
                					remote.error(data);
                				}
                			}
                		});
                	}else{
                		//gridData.role的类型非法
                		console.warn('selectOrg: gridData.role must be a function or an object.');
                	}
                    
                    $.fn.zTree.getZTreeObj("pd-selectOrg-role-tree").expandNode(treeNode);
                }
            }
        };
        if(_this.Main.config.treeData.role){
            $.fn.zTree.init($("#pd-selectOrg-role-tree"), setting, _this.Main.config.treeData.role);
        }else{
            //自定义根节点
            //var rootNode    = _this.Main.config.rootNode["roleMember"];
            //获取角色目录
            $.ajax({
                url: getServicePath() + "/api/org/selectorg/getAllRoleDir",
                /*"type":"post",
                data:{
                    "rootNode":rootNode.length>0 ? JSON.stringify(rootNode) : ""
                },*/
                success: function(data) {
                    //默认展开
                    for (var i = 0, dir; dir = data[i++];) {
                        if (dir.dirCode == "root") {
                            dir.open = true;
                            break;
                        }
                    }
                    var tree = $.fn.zTree.init($("#pd-selectOrg-role-tree"), setting, data);
                    //隐藏指定的节点
                    for(var j= 0,id;id=_this.Main.config.hideNode.role[j++];){
                        tree.hideNodes(tree.getNodesByParam("dirCode", id));
                        tree.hideNodes(tree.getNodesByParam("dirUuid", id));
                    }
                }
            });
        }
    };

    Role.prototype.showRoleList = function(){
        var _this = this;
        var config = {
            id: "pd-selectOrg-role-list",
            pageSize: 6,
            pageList: [6,15,30,50],
            height: "230px",
            multi: _this.Main.config.multi,
            layout: [{
            	name: "角色名称",
            	field: "roleName",
            	sort: true
            },{
            	name: "角色编号",
            	field: "roleCode",
            	sort: true
            }],
            data: [],
            onCheck: function(index, row){
                _this.Selected.add("role", row, _this.getElement(row), _this.rule);
            },
            onUncheck: function(index, row){
                _this.Selected.remove("role", [row], _this.rule);
            },
            onSelectAll: function(checked){
                var rows = _this.myGrid.getCurPageData();
                if(checked){
                    for(var i= 0,row; row=rows[i++];){
                        _this.Selected.add("role", row, _this.getElement(row), _this.rule);
                    }
                }else{
                    _this.Selected.remove("role", rows, _this.rule);
                }
            },
            onAfterRenderTable: function(){
                _this.Main.Util.gridCSSModify("role");
                //设置选中数据
                var data = _this.Selected.getDataByType("role");
                for(var i= 0,item; item=data[i++];){
                    //这里的this为grid对象
                    this.checkRowByRule(_this.rule,item);
                }
            }
        };
        this.myGrid = Grid.init(config);
    };

    Role.prototype.mhSearch = function(){
        var _this = this;
        if(_this.Main.config.treeData.role){
            $("#pd-selectOrg-role-search").hide();
            return false;
        }
        var search = function(text){
            _this.myGrid.reload({
                data:{
                    "type": "URL",
                    "value": getServicePath() + "/api/org/selectorg/getRoleMhForGrid"
                },
                queryParam: {
                	"param": text
                }
            });
        };
        _this.Main.Util.search("pd-selectOrg-role-search", search);
    };

    /*=========================封装角色成员选择相关操作=============================*/
    function RoleMember(select,main){
        this.myGrid     = null;
        this.Selected   = select;
        this.Main       = main;
    }

    RoleMember.prototype.getElement = function(row){
        return $("<li>" + row["userName"] + "/" + row["userCode"] + "</li>");
    };

    RoleMember.prototype.init = function(){
        this.initData();
        this.createRoleTree();
        this.showRoleMemberList();
        return this;
    };

    RoleMember.prototype.initData = function(){
        var _this = this;
        if(_this.Main.config.data.roleMember.length){
            $.ajax({
                url: getServicePath() + "/api/org/selectorg/getUserListByUuids",
                type: "post",
                data: {
                	uuids: _this.Main.config.data.roleMember.join(";")
                },
                success: function(data){
                    for(var i= 0,row; row=data[i++];){
                        _this.Selected.add("roleMember", row, _this.getElement(row), _this.rule);
                    }
                }
            });
        }
    };

    RoleMember.prototype.rule = function(row,compareData){
        return row.userUuid == compareData.userUuid ? true : false;
    };

    RoleMember.prototype.createRoleTree = function(){
        var _this = this, roleDirList = [];
        var setting = {
            data: {
                key:{
                    name: "dirName"
                },
                simpleData: {
                    enable: true,
                    idKey: "dirCode",
                    pIdKey: "pDirCode"
                }
            },
            callback: {
                onClick: function(event, treeId, treeNode){
                    //显示角色or角色对应的人员判断
                    if(treeNode.roleUuid){
                    	if(!_this.Main.config.gridData.roleMember){
                    		//没有自定义数据
                    		_this.myGrid.reload({
                            	data: {
                            		type: 'URL',
                                	value: getServicePath() + '/api/org/selectorg/getRoleMembersByUuidForGrid?roleUuid=' + treeNode.roleUuid
                            	}
                            });
                    	}else if(typeof(_this.Main.config.gridData.roleMember) == 'function'){
                    		//静态数据
                    		//执行自定义方法并接收返回值，渲染至列表
                    		var data = _this.Main.config.gridData.roleMember(treeNode);
                    		if(typeof(data) != 'undefined'){
                    			_this.myGrid.reload({
                    				data: data
                    			});
                    		}else{
                    			console.warn('selectOrg: gridData.roleMember is a function but has no return value.');
                    		}
                    	}else if(typeof(_this.Main.config.gridData.roleMember) == 'object'){
                    		//remote数据
                    		var remote = {
                    			url: '',
                    			param: {},
                    			success: null,
                    			error: null
                    		};
                    		$.extend(remote, _this.Main.config.gridData.roleMember);
                    		
                    		$.ajax({
                    			url: remote.url,
                    			type: 'post',
                    			param: remote.param,
                    			success: function(data){
                    				if(typeof(remote.success) == 'function'){
                    					//如果有自定义success方法，执行并获取返回值
                    					var result = remote.success(data);
                    					if(typeof(result) != 'undefined'){
                    						data = result;
                    					}
                    				}
                    				_this.myGrid.reload({
                    					data: data
                    				});
                    			},
                    			error: function(data){
                    				console.warn('selectOrg: Failed to load remote gridData.roleMember.');
                    				if(typeof(remote.error) == 'function'){
                    					//如果有自定义eror方法，执行
                    					remote.error(data);
                    				}
                    			}
                    		});
                    	}else{
                    		//数据格式错误
                    		console.warn('selectOrg: gridData.roleMember must be a function or an object.');
                    	}
                    }else{
                        $.fn.zTree.getZTreeObj("pd-selectOrg-roleMember-tree").expandNode(treeNode);
                    }
                }
            }
        };

        if(_this.Main.config.treeData.roleMember){
            $.fn.zTree.init($("#pd-selectOrg-roleMember-tree"), setting, _this.Main.config.treeData.roleMember);
        }else{
            //自定义根节点
            //var rootNode    = _this.Main.config.rootNode["roleMember"];
            //获取角色目录
            $.ajax({
                url: getServicePath() + "/api/org/selectorg/getAllRoleDir",
                async: false,
                /*type:"post",
                data:{
                    "rootNode":rootNode.length>0 ? JSON.stringify(rootNode) : ""
                },*/
                success: function(data) {
                    //默认展开
                    for(var i = 0, dir; dir = data[i++];){
                        if (dir.dirCode == "root") {
                            dir.open = true;
                            break;
                        }
                    }
                    roleDirList = data;
                }
            });
            //获取角色
            $.ajax({
                url: getServicePath() + "/api/org/selectorg/getAllRole",
                type: "get",
                dataType: "json",
                /*type:"post",
                data:{
                    "rootNode":rootNode.length>0 ? JSON.stringify(rootNode) : ""
                },*/
                success: function(roleList){
                    //合并数据，构造树
                    for(var i= 0,item; item=roleList[i++];){
                        //剔除掉未归属分类的角色
                        if(item.dirCode != ""){
                            item.pDirCode = item.dirCode;
                            item.dirCode = item.roleCode;
                            item.dirName = item.roleName;
                            roleDirList.push(item);
                        }
                    }
                    var tree = $.fn.zTree.init($("#pd-selectOrg-roleMember-tree"), setting, roleDirList);
                    //隐藏指定的节点
                    for(var i= 0,id; id=_this.Main.config.hideNode.roleMember[i++];){
                        tree.hideNodes(tree.getNodesByParam("dirCode", id));
                        tree.hideNodes(tree.getNodesByParam("dirUuid", id));
                    }
                }
            });
        }
    };

    RoleMember.prototype.showRoleMemberList = function(){
        var _this = this;
        var config = {
            id: "pd-selectOrg-roleMember-list",
            multi: _this.Main.config.multi,
            pageSize: 6,
            pageList: [6,15,30,50],
            height: "230px",
            layout: [{
            	name: "用户名称",
            	field: "userName",
            	sort: true
            },{
            	name: "员工编号",
            	field: "userCode",
            	sort: true
            }],
            data: [],
            onCheck: function(index, row){
                _this.Selected.add("roleMember", row, _this.getElement(row), _this.rule);
            },
            onUncheck: function(index, row){
                _this.Selected.remove("roleMember", [row], _this.rule);
            },
            onSelectAll: function(checked){
                var rows = _this.myGrid.getCurPageData();
                if(checked){
                    for(var i= 0,row; row=rows[i++];){
                        _this.Selected.add("roleMember", row, _this.getElement(row), _this.rule);
                    }
                }else{
                    _this.Selected.remove("roleMember", rows, _this.rule);
                }
            },
            onAfterRenderTable: function(){
                _this.Main.Util.gridCSSModify("roleMember");
                //设置选中数据
                var data = _this.Selected.getDataByType("roleMember");
                for(var i= 0,item; item=data[i++];){
                    this.checkRowByRule(_this.rule, item);
                }
            }
        };
        this.myGrid = Grid.init(config);
    };


    /*=========================封装岗位选择相关操作=============================*/
    function Gw(select, main){
        this.myGrid = null;
        this.Selected = select;
        this.Main = main;
        //this.keyMap     = {"name":"gwName","code":"gwCode"};
    }

    Gw.prototype.getElement = function(row){
        return $("<li>" + row["gwName"] + "/" + row["gwCode"] + "/" + row["deptName"] + "</li>");
    };

    Gw.prototype.init = function(){
        this.initData();
        this.createDeptTree();
        this.showGwList();
        return this;
    };

    Gw.prototype.initData = function(){
        var _this = this;
        if(_this.Main.config.data.gw.length){
            $.ajax({
                url: getServicePath() + "/api/org/selectorg/getGwListByDeptAndGwUuid",
                type: "post",
                data: {
                    dgwList: JSON.stringify(_this.Main.config.data.gw)
                },
                success: function(rows){
                    for(var i= 0,row; row=rows[i++];){
                        _this.Selected.add("gw", row, _this.getElement(row), _this.rule);
                    }
                }
            });
        }
    };

    Gw.prototype.rule = function(row, compareData){
        return (row.gwUuid == compareData.gwUuid && row.deptUuid == compareData.deptUuid) ? true : false;
    };

    Gw.prototype.createDeptTree = function(){
        var _this = this;
        var setting = {
            callback: {
                onClick: function(event, treeId, treeNode){
                	if(!_this.Main.config.gridData.gw){
                		//没有自定义数据
                		//由于查询并非真分页，因此只可加载静态数据才可正确添加分页信息
                		$.ajax({
                            url: getServicePath() + '/api/org/selectorg/getGwByDeptUuid?deptUuid=' + treeNode.deptUuid,
                            type: 'get',
                            success: function(data){
                                _this.myGrid.reload({
                                	data: data
                                });
                            }
                        });
                	}else if(typeof(_this.Main.config.gridData.gw) == 'function'){
                		//静态数据
                		//执行自定义方法并接收返回值
                		var data = _this.Main.config.gridData.gw(treeNode);
                		if(typeof(data) != 'undefined'){
                			_this.myGrid.reload({
                				data: data
                			});
                		}else{
                			console.warn('selectOrg: gridData.gw is a function but has no return value.');
                		}
                	}else if(typeof(_this.Main.config.gridData.gw) == 'object'){
                		//remote数据
                		var remote = {
                			url: '',
                			param: {},
                			success: null,
                			error: null
                		};
                		$.extend(remote, _this.Main.config.gridData.gw);
                		
                		$.ajax({
                			url: remote.url,
                			type: 'post',
                			param: remote.param,
                			success: function(data){
                				if(typeof(remote.success) == 'function'){
                					//如果有自定义success方法，执行并接收返回值
                					var result = remote.success(data);
                					if(typeof(result) != 'undefined'){
                						data = result;
                					}
                				}
                				_this.myGrid.reload({
                					data: data
                				});
                			},
                			error: function(data){
                				console.warn('selectOrg: Failed to load remote data of gridData.gw');
                				if(typeof(remote.error) == 'function'){
                					//如果有自定义error方法，执行
                					remote.error(data);
                				}
                			}
                		});
                	}else{
                		console.warn('selectOrg: gridData.gw must be a function or an object.');
                	}
                    
                    $.fn.zTree.getZTreeObj("pd-selectOrg-gw-tree").expandNode(treeNode);
                }
            }
        };
        if(_this.Main.config.treeData.gw){
            $.fn.zTree.init($("#pd-selectOrg-gw-tree"), this.Main.Util.simpleDeptTreeConfig(setting), _this.Main.config.treeData.gw);
        }else{
            $.fn.zTree.init($("#pd-selectOrg-gw-tree"), this.Main.Util.deptTreeConfig(setting, "gw"));
        }
    };

    Gw.prototype.showGwList = function(){
        var _this = this;
        var config = {
            id: "pd-selectOrg-gw-list",
            pageSize: 6,
            pageList: [6,15,30,50],
            height: "230px",
            multi: _this.Main.config.multi,
            layout: [{
            	name: "岗位名称",
            	field: "gwName",
            	sort: true
            },{
            	name: "岗位编号",
            	field: "gwCode",
            	sort: true
            }],
            data: [],
            onCheck: function(index, row){
                _this.Selected.add("gw", row, _this.getElement(row), _this.rule);
            },
            onUncheck: function(index, row){
                _this.Selected.remove("gw", [row], _this.rule);
            },
            onSelectAll: function(checked){
                var rows = _this.myGrid.getCurPageData();
                if(checked){
                    for(var i= 0,row; row=rows[i++];){
                        _this.Selected.add("gw", row, _this.getElement(row), _this.rule);
                    }
                }else{
                    _this.Selected.remove("gw", rows, _this.rule);
                }
            },
            onAfterRenderTable: function(){
                _this.Main.Util.gridCSSModify("gw");
                //设置选中数据
                var data = _this.Selected.getDataByType("gw");
                for(var i= 0,item; item=data[i++];){
                    this.checkRowByRule(_this.rule, item);
                }
            }
        };
        this.myGrid = Grid.init(config);
    };

    /*==========================封装已选列表相关操作===========================*/
    function Selected(main){
        this.Main = main;
        this.$ul = $("div[class='pd-selectOrg-selectList']>ul");
    }

    Selected.prototype.init = function(){
        var _this = this;
        //监听来自li标签的事件，当点击li标签时修改背景色
        this.$ul.on("click", "li", function(event){
            _this.$ul.find(">li").removeClass("pd-selectOrg-activity");
            $(this).addClass("pd-selectOrg-activity");
        });
        //双击选中的数据删除
        this.$ul.on("dblclick", "li", function(){
            var OBJ = _this.Main.getTypeObj($(this).data("type"));
            OBJ.myGrid.uncheckRowByRule(OBJ.rule, $(this).data("row"));
            //必须放后面，否则无法取得data上的row对象
            $(this).remove();
        });

        this.toolbarInit();
        return this;
    };

    /**
     * 已选区域操作栏初始化
     */
    Selected.prototype.toolbarInit = function(){
        this.upSelected();
        this.downSelected();
        this.removeSelected();
        this.removeAll();
    };

    /**
     * 上移选中数据
     */
    Selected.prototype.upSelected = function(){
        var _this = this;
        var $up = $("div[class='pd-selectOrg'] .fa-angle-up");
        $up.click(function(){
            var $current = _this.$ul.find("li[class='pd-selectOrg-activity']");
            if($current.length > 0){
                $current.prev().before($current);
            }
        });
    };

    /**
     * 下移选中数据
     */
    Selected.prototype.downSelected = function(){
        var _this = this;
        var $down = $("div[class='pd-selectOrg'] .fa-angle-down");
        $down.click(function(){
            var $current = _this.$ul.find("li[class='pd-selectOrg-activity']");
            if($current.length > 0){
                $current.next().after($current);
            }
        });
    };

    /**
     * 删除选中数据
     */
    Selected.prototype.removeSelected = function(){
        var _this = this;
        var $remove = $("div[class='pd-selectOrg'] .fa-minus");
        $remove.click(function(){
            var $current = _this.$ul.find("li[class='pd-selectOrg-activity']");
            if($current.length > 0){
                var OBJ = _this.Main.getTypeObj($current.data("type"));
                OBJ.myGrid.uncheckRowByRule(OBJ.rule, $current.data("row"));
                //必须放后面，因为移除后就拿不到.data("row")了
                $current.remove();
            }
        });
    };

    /**
     * 删除全部已选数据
     */
    Selected.prototype.removeAll = function(){
        var _this = this;
        var $remove = $("div[class='pd-selectOrg'] .fa-trash-o");
        $remove.click(function(){
            var $lis = _this.$ul.find("li");
            for(var i= 0,li; li=$lis[i++];){
                var $li = $(li);
                var OBJ = _this.Main.getTypeObj($li.data("type"));
                OBJ.myGrid.uncheckRowByRule(OBJ.rule, $li.data("row"));
                $li.remove();
            }
        });
    };

    Selected.prototype.add = function(type, row, $element, rule){
        //如果为单选，每次添加前先清空
        this.Main.config.multi || this.$ul.empty();
        if(!this.checkSelected(type, rule, row)){
            $element.data("row", row).data("type", type).appendTo(this.$ul);
        }
    };

    /**
     * 删除已选列表中的数据
     * @param rows      要删除的数据
     * @param rule      匹配规则
     */
    Selected.prototype.remove = function(type, rows, rule){
        var list = this.$ul.find(">li");
        for(var r= 0,row; row=rows[r++];){
            for(var i= 0,item; item=list[i++];){
                var data = $(item).data("row");
                var dType = $(item).data("type");
                if(data && dType == type && rule(data, row)){
                    $(item).remove();
                    break;
                }
            }
        }
    };

    /**
     * 获取选中数据
     */
    Selected.prototype.getData = function(){
        var list = this.$ul.find(">li"), arr = [];
        for(var i= 0,item; item=list[i++];){
            arr.push($(item).data("row"));
        }
        return arr;
    };

    Selected.prototype.getDataByType = function(type){
        var list = this.$ul.find(">li"), arr = [];
        for(var i= 0,item; item=list[i++];){
            if($(item).data("type") == type){
                arr.push($(item).data("row"));
            }
        }
        return arr;
    };

    /**
     * 判断一条数据是否已在已选列表中
     * @param compareData       行数据（JSON对象）
     * @param rule              匹配规则
     * @param type              类型
     * ep:
     * var rule = function(row,compareData){
            return row.userUuid==compareData.userUuid?true:false;
        };
     */
    Selected.prototype.checkSelected = function(type, rule, compareData){
        var list = this.$ul.find(">li");
        for(var i= 0,item; item=list[i++];){
            if($(item).data("type") == type){
                if(rule($(item).data("row"), compareData)){
                    return true;
                }
            }
        }
        return false;
    };

    /*======================工具类=========================*/
    function Util(main){
        this.Main = main;
    }

    Util.prototype.search = function(id,callback){
        var searchTrigger = null;
        /*$("#"+id).bind("keyup",function(){
              var text = $.trim($(this).val());
              clearTimeout(searchTrigger);
              searchTrigger = setTimeout(function(){
                  callback(text);
              },800);
          });*/
        // 解决鼠标操作粘贴内容到文本框中无法触发事件问题
        $("#" + id).bind('input propertychange', function(){
            var text = $.trim($(this).val());
            clearTimeout(searchTrigger);
            searchTrigger = setTimeout(function(){
                callback(text);
            }, 800);
        });
    };

    Util.prototype.gridCSSModify = function(type){
        $("#pd-selectOrg-" + type + "-list a[class='refresh']").hide();
        //$("#pd-selectOrg-"+type+"-list span[class='pageSize']").hide();
       // $(".pd-selectOrg-dataList td").css({"padding":"0","line-height":"28px","height":"28px"})
    };

    Util.prototype.deptTreeConfig = function(config, tagType){
        var _this = this;
        var rootNode = _this.Main.config.rootNode[tagType];
        var def = {
            async: {
                dataType: "json",
                autoParam: ["deptTreeId"],
                enable: true,
                otherParam: {
                    "rootNode": rootNode.length > 0 ? JSON.stringify(rootNode) : "",
                    "showNode": _this.Main.config.showNode[tagType].join(",")   //通过该参数判断只显示哪些节点
                },
                //url: getServicePath() + "/org/dept/getAsyncDeptTree"
                url: getServicePath() + "/api/org/selectorg/getAsyncDeptTree"
            },
            callback: {
                onAsyncSuccess: function(event, treeId, treeNode, msg){
                    //隐藏指定节点
                    var tree = $.fn.zTree.getZTreeObj(treeId);
                    for(var i= 0,id; id=_this.Main.config.hideNode[tagType][i++];){
                        tree.hideNodes(tree.getNodesByParam("deptCode", id));
                        tree.hideNodes(tree.getNodesByParam("deptUuid", id));
                    }
                }
            }
        };
        return $.extend(true, {}, this.simpleDeptTreeConfig({}), def, config);
    };
    
    //自定义左侧部门树时使用
    Util.prototype.simpleDeptTreeConfig = function(config){
        var def = {
            data: {
                key:{
                    name: 'deptName'
                },
                simpleData: {
                    enable: true,
                    idKey: 'deptTreeId',
                    pIdKey: 'pDeptTreeId',
                    rootPId: ''
                }
            }
        };
        return $.extend(true, {}, def, config);
    };

    function test(){
        require(["PDUtilDir/org/selectOrg"],function(OrgSelect){
            OrgSelect.init({
                title: "组织选择",
                multi: true,
                tagType: ["user","dept","role","roleMember","gw"],
                hideNode: {
                    "user": ["D002001"],
                    "dept": ["D002"],
                    "role": ["RD002"],
                    "gw": []
                },
                rootNode: {
                    "user": ["root"],
                    "dept": ["root"],
                    "role": ["root"],
                    "gw": ["root"]
                },
                data: {
                    "user": ["c7f9c97235114cc29cbe10ce36d9587e","c8216f7edc984f8bbba83de3abe128ce"],
                    "dept": ["c0629375eeb5461a91c789a305ce4e48","06c62e1917cb4b3dac92f61da118c5c9"],
                    "role": ["260aa2c287114e57a522d8938113c651","8829896d0bc64ff398505cf383df681f"],
                    "roleMember": ["aed20805ca6f45369a3f374b9148878b","bebbdc094b844c22aa2980bab5a3f20b"],
                    "gw": [{"deptUuid":"5ea1d1f4e84049c89c13155acd6dcacb","gwUuid":"ff29afaf5169428aa55a2aff3d4c0fab"}]
                },
                callback: function(data){
                }
            });
        });
    }

    return {
        init:init
    }
});
