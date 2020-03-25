define(["jquery"], function(){

    function init(options, homeExt) {
    	/*
    	if (!options.id) {
            return ;
        }
        */

        var menu = new Menu(options, homeExt);

        return menu;
    }

    function Menu(options, homeExt) {
        var _this = this;

        _this.homeExt = homeExt;
        
        var defaultOps = {
            id: ""
        }

        _this.options = $.extend(true, defaultOps, options);

        Menu.init.call(_this);
    }

    Menu.init = function() {
        var _this = this;

        _this.data = []; // 菜单数据集合
        _this.routerData = {}; // 路由数据集合（具有路由信息的菜单）
        
        Menu.loadData.call(_this);
        
        Menu.render.call(_this);
        
        Menu.bindEvent.call(_this);
    }

    Menu.loadData = function() {
    	var _this = this;
    	
    	/*$.ajax({
  			url : getServicePath() + "/page/menu/getCurUserMenu",
  	    	async: false,
  			data : {
  				oriFuncScope : _oriFuncScope,
  				type:"tree"
  			},
  			success: function(data) {
  				// 如果包含根节点，就将根节点去掉
  				if (data && data.length == 1 && data[0].menu.menuId == "root") {
  					data = data[0].subMenu;
  				}
  				
  				_this.data = data;
  				
  				Menu.formatData.call(_this);
  			}
  		});*/
    	//TODO 暂时写死
        _this.data = [{"menu":{"extend1":null,"extend2":null,"extend3":null,"extend4":null,"extend5":null,"menuAuthType":null,"menuCtrl":null,"menuCtrlUrl":null,"menuDesc":"根目录","menuEnable":"Y","menuHelp":null,"menuIcon":null,"menuId":"root","menuName":"根目录","menuOpen":null,"menuOrder":0,"menuPid":"-1","menuRouter":null,"menuType":"1","menuUrl":null},"subMenu":[{"menu":{"extend1":null,"extend2":null,"extend3":null,"extend4":null,"extend5":null,"menuAuthType":null,"menuCtrl":null,"menuCtrlUrl":null,"menuDesc":null,"menuEnable":"Y","menuHelp":null,"menuIcon":"fa fa-cog","menuId":"ab14fbe7ad1d4ee59c4fa4c73ea5a305","menuName":"流程管理","menuOpen":null,"menuOrder":2,"menuPid":"root","menuRouter":null,"menuType":"1","menuUrl":null},
                    "subMenu":[
                        {"menu":{"extend1":null,"extend2":null,"extend3":null,"extend4":null,"extend5":null,"menuAuthType":null,"menuCtrl":"wfm_approvalTemplateCtrl","menuCtrlUrl":"static/core/originalf/workflow/approvaltemplate/approvalTemplateCtrl","menuDesc":null,"menuEnable":"Y","menuHelp":null,"menuIcon":null,"menuId":"f159508365a84655a5ecd982c994f289","menuName":"审批意见模板","menuOpen":"1","menuOrder":2,"menuPid":"ab14fbe7ad1d4ee59c4fa4c73ea5a305","menuRouter":"wfm_approvalTemplate","menuType":"2","menuUrl":"static/core/originalf/workflow/approvaltemplate/views/index.html"},"subMenu":null},
                        {"menu":{"extend1":null,"extend2":null,"extend3":null,"extend4":null,"extend5":null,"menuAuthType":null,"menuCtrl":"wfm_test","menuCtrlUrl":"static/core/originalf/workflow/test/testCtrl","menuDesc":null,"menuEnable":"Y","menuHelp":null,"menuIcon":null,"menuId":"f159508365a84655a5ecd982c994f281","menuName":"测试","menuOpen":"1","menuOrder":2,"menuPid":"ab14fbe7ad1d4ee59c4fa4c73ea5a305","menuRouter":"wfm_test","menuType":"2","menuUrl":"static/core/originalf/workflow/test/views/test.html"},"subMenu":null},
                        ]}]}];

        Menu.formatData.call(_this);
    };
    
    // 格式化菜单原始数据 
    Menu.formatData = function() {
    	var _this = this,
    		data = _this.data,
    		routerData = _this.routerData = {};
    	
    	function formatMenus(menus) {
    		for (var i=0; i<menus.length; i++) {
    			var d = menus[i];
    			
    			if (d.menu.menuType == "2") { // 菜单实体
    				formatMenuLeaf(d.menu);
    			} else { // 菜单分类
    				formatMenuSort(d);
    				
    				if (d.subMenu && d.subMenu.length > 0) {
    					formatMenus(d.subMenu);
    				}
    			}
    		}
    	}
    	
    	// 菜单分类
    	function formatMenuSort(menuSort) {
    		var menu = menuSort.menu;
    		formatMenu(menu);
    		
    		if (menuSort.subMenu && menuSort.subMenu.length > 0) {
    			menu.isParent = true;
    		} else menu.isLeaf = true;
    	}
    	
    	// 菜单实体
    	function formatMenuLeaf(menu) {
    		formatMenu(menu);
    		 
    		menu.isLeaf = true;
    	}
    	
    	function formatMenu(menu) {
    		if (menu.menuOpen == "1" || menu.menuOpen == "3" || menu.menuOpen == "2" || menu.menuOpen == "4") { //都包括路由
				if (menu.menuRouter && menu.menuUrl) {
					var r = menu.menuRouter;
					routerData[r] = menu;
					
					menu.menuHref = 'href="#' + r + '"';
					if (menu.menuOpen == "3") {
						menu.menuTarget = 'target="_blank"';
					}
					if (menu.menuOpen == "2") {
						menu.menuUrl = getServer() + "/" + menu.menuUrl;
					}
				}
			} else if (menu.menuOpen == "5") { //新窗口-本域-非路由
				menu.menuTarget = 'target="_blank"';
				menu.menuHref = 'href="' + getServer() + "/" + menu.menuUrl + '"';
			} else if (menu.menuOpen == "7") { //新窗口-跨域
				menu.menuTarget = 'target="_blank"';
				menu.menuHref = 'href="' + menu.menuUrl + '"';
			} else if (menu.menuOpen == "6") { //新窗口-默认-单页
				menu.menuTarget = 'target="_blank"';
				menu.menuHref = 'href="' + getServicePath() + "/singlePage?tabId=" + menu.menuRouter + '"';
			}
    	}
    	
    	formatMenus(data);
    }
    
    Menu.render = function() {
    	var _this = this,
    		data = _this.data,
    		homeExt = _this.homeExt;
    	
    	if (homeExt && typeof homeExt.renderMenu == "function") { // 如果开发人员有自定义菜单
    		homeExt.renderMenu(data);
    	} else { // 默认菜单
    		Menu.renderDefault.call(_this, data);
    	}
    	
    	_this.$menu = $("#rx-menu");
    }
    
    Menu.renderDefault = function(data) {
    	
    	function createMenus(menus) {
			var html = [];
			
			if (menus && menus.length > 0) {
				for (var i=0; i<menus.length; i++) {
					html.push(createMenu(menus[i]));
				}
			}
			
			return html.join("");
		} 
		
		function createMenu(menu) {
			var menuId = menu.menu.menuId || "",
				menuName = menu.menu.menuName || "",
				menuIcon = menu.menu.menuIcon || "",
				menuHref = menu.menu.menuHref || "",
				menuTarget = menu.menu.menuTarget || "",
				isLeaf = menu.menu.isLeaf,
				isParent = menu.menu.isParent;
			
			var $li = $( 
					//'<li class="rx-menu-item">' +
    				'<li class="rx-menu-item" data-menuid="' + menuId + '">' +
	    	            '<a class="rx-menu-node" ' + menuHref + " " + menuTarget  + ' >' +
		    	            (isParent ? '<i class="rx-menu-switch"></i>' : '') +
		    	            '<i class="rx-menu-line"></i>' +
		    	            (isLeaf ? '<i class="rx-menu-pointer"></i>' : '') +
	    	                (menuIcon ? '<i class="rx-menu-icon ' + menuIcon + '"></i>' : '') +
	    	                '<span class="rx-menu-text">' + menuName + '</span>' +
	    	            '</a>' +
	    	        '</li>'
    		);
			
    		if (isParent) {
    			$ul = $('<ul class="rx-menu-sub"></ul>').appendTo($li);
    			$ul.html(createMenus(menu.subMenu));
    		}
    		
    		return $("<div></div>").append($li).html();
		}
		
		var html = createMenus(data);
		
		// 设置菜单html
    	$("#rx-menu").html(html);
    	
    	require(["MCScrollbarDir/jquery.mCustomScrollbar.concat.min",
    	"css!MCScrollbarDir/jquery.mCustomScrollbar.min"], function() {
    		// 添加滚动条
    		$(".rx-sidebar").mCustomScrollbar({
    			theme: "dark-3",
    			scrollInertia: 200,
    			scrollEasing: 'linear'
    		});
    	})
    }
    
	// 获取路由数据集合
    Menu.prototype.getRouterData = function(data) {
    	var _this = this;
    	
    	return _this.routerData;
    }
    
    // 获取路由数据（指定某一路由）
    Menu.prototype.getRouterDataByRouter = function(router) {
    	var _this = this,
    		routerData = _this.routerData;
    	
    	if (router) {
    		return routerData[router];
    	}
    	
    	return null;
    }
    
    Menu.bindEvent = function() {
        var _this = this,
            options = _this.options;

        var id = options.id;
        
        _this.$active = null;
        
        // 监听子节点点击事件
        $(".rx-menu-node").on("click.switch", function(){
            var $menuNode = $(this);

            var $menuItem = $menuNode.parent(); // li
            var $menuSub = $menuNode.nextAll(".rx-menu-sub"); // ul
            
            // 如果有子节点，需要展开/收缩
            if ($menuSub[0]) {
            	// 展开/关闭
            	$menuItem.toggleClass("open");
        		// 将其它同级的父节点关闭
        		if ($menuItem.hasClass("open")) {
        			$menuItem.siblings().removeClass("open");
        		}
            } else { // 如果是叶子节点，需要设置active
            	if (_this.$active) { // 如果已经有当前激活的菜单，就取消
            		_this.$active.removeClass("active");
            	}
            	$menuNode.addClass("active");
            	_this.$active = $menuNode;
            }
            
        });

    }

    // 激活叶子节点
    Menu.prototype.selectNode = function(menuRouter) {
    	var _this = this,
    		routerData = _this.routerData,
    		$menu = _this.$menu,
    		$active = _this.$active;
    	
    	if (menuRouter && $menu[0] && routerData) {
    		var menu = routerData[menuRouter];
    		if (menu) {
    			var menuId = menu.menuId;
    			
    			var $menuItem = $menu.find('li[data-menuid=' + menuId + ']'); // li
    			
    			if ($menuItem[0]) {
    				var $menuNode = $menuItem.children(".rx-menu-node"); // a
    				var $parentMenuItem = $menuItem.parentsUntil("#rx-menu", "li.rx-menu-item"); // parents li
    				
    				if ($active) {
    					$active.removeClass("active"); // 移除$active
    				}
    				
    				var isOpen = $menuItem.hasClass("open"); // 如果该节点是菜单分类并且已经open了
    				$menu.find("li.open").removeClass("open"); // 先将之前open的都去掉
    				$parentMenuItem.addClass("open"); // 为当前激活的节点的所有父节点添加open样式
    				if (isOpen) { // 如果该节点以前就open状态，那就再次将本节点open
    					$menuItem.addClass("open");
    				}
    				$menuNode.addClass("active"); // 给a添加active
    				
    				$active = _this.$active = $menuNode;
    			}
    		}
    	}
    }
    
    return init;
})
