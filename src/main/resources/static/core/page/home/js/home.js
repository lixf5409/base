define([
    "PDHomeDir/js/router",
    "PDHomeDir/js/tabs",
    "PDHomeDir/js/menu",
    "PDHomeDir/js/homeExtend",
    "PDHomeDir/js/pageClose",
    "PDCoreDir/page/login/js/reLogin"
    ],function (Router, Tabs, Menu, HomeExtend, PageClose) {
	
	function init() {
		// 初始化页签
		initTabs();
		// 初始化路由
		initRouter();
		// 初始化扩展信息
		homeExt = HomeExtend();
		// 初始化菜单
		initMenu();
		// 注册路由
		registerRouter();
		// 启动路由
		startRouter();
		// 页面“关闭”事件监听
		PageClose();
	}
	
	// 页签组件
	var tabs = null;
	// 路由组件
	var router = null;
	// 菜单组件
	var menu = null;
	// 首页扩展
	var homeExt = null;
	// 帮助文档按钮jq对象
	var $btnHelp = null;
	
	function initTabs() {
		tabs = window.tabs = Tabs({ // 注册成全局tabs对象，方便开发人员调用
			navId : 'rx-tabs-nav', // 页签导航id
			contentId : 'rx-tabs-content', // 页签内容id
			onSelect : function(tabId) { //监听页签选中事件
				onSelect(tabId);
			},
			onHelp : function(tabId) { // 监听帮助文档按钮事件
				onHelp(tabId);
			},
			onContextMenu: function(tabId) { // 监听右键菜单事件
				if (tabId) {
					if (!$btnHelp) {
						$btnHelp = $(".cs-tabs-contextmenu a[data-type=help]");
					}
					
					var menuData = menu.getRouterDataByRouter(tabId);
					
					// 如果菜单配置了帮助文档才会显示“帮助文档”按钮
					if (menuData && menuData.menuHelp) {
						$btnHelp.parent().show();
					} else {
						$btnHelp.parent().hide();
					}
				}
			}
		});
		
		// 扩展页签默认的addTab功能
		tabs._addTab = tabs.addTab;
		tabs.addTab = function(config) {
			addTab(config);
		};
	}
	
	function addTab(config) {
		var tabId = config.id;
		
		// 如果已经存在，就直接激活
		if (tabs.exists(tabId)) {
			tabs.selectTab(tabId);
			return ;
		}
		
		// 如果没有注册该路由（说明是开发人员手动添加的。菜单的路由在初始化时就已经注册了）就重新注册
		var rd = {};
		if (!router.isRegistered(tabId)) {
		} else { // 已经注册过了更新
			rd = router.getRegistered(tabId);
		}
		rd._tabConfig = config;
		
		var registerData = {};
		registerData[tabId] = rd;
		router.register(registerData);
		
		tabs._addTab(config);
	}
	
	function initRouter() {
		router = Router({
			defaultRouter: "welcome",	// 默认路由
			event: {
				onRouter: function(r, p) { // 路由改变事件监听
					if (r) {
						onRouter(r, p);
					}
				}
			}
		});
	}
	
	function initMenu() {
		menu = Menu({
			//id: "rx-menu"
		}, homeExt);
	}
	
	// 注册路由
	function registerRouter() {
		// 注册菜单的路由数据
		router.register(menu.getRouterData());
	}
	
	// 启动路由
	function startRouter() {
		router.start();
	}
	
	// 页签选中改变事件
	function onSelect(tabId) {
		/*
		// 获取页签id
		var config = tabs.getTabConfig(tabId);
		
		var r = "";
		if (config && config._menu) { //如果是菜单对应的路由
			r = tabId;
		} else { //非菜单路由，由开发人员自己添加的页签
			r = "self";
		}
		*/
		var r = tabId;
		
		// 当页签选中的时候将路由切换成页签对应的路由
		router.setRouter(r);
	}
	
	// 路由改变事件
	function onRouter(r, p) {
		menu.selectNode(r); // 激活菜单
		
		// 如果已经存在，就直接激活
		if (tabs.exists(r)) {
			tabs.selectTab(r);
			return ;
		}
		
		// 判断欢迎页是否已经创建了，不管初始化时的路由是什么都要初始化欢迎页
		if (r == "welcome") {
			addTabWelcome();
			return ;
		}
		if (!tabs.exists("welcome")) {
			addTabWelcome();
		}
		
		if (r == "404") { // 404页面
			addTab404();
			return ;
		}
		
		// 此时分两种情况：一种是菜单路由；一种是手动调用addTab的路由
		// 1.菜单
		var rd = menu.getRouterDataByRouter(r);
		if (rd) {
			addTabMenu(r);
			return ;
		}
		
		// 2.手动调用:直接获取tabConfig信息然后
		var rd = router.getRegistered(r);
		if (rd && rd._tabConfig) { // 如果注册过并且打开过，就从缓存中获取tabConfig
			tabs.addTab(rd._tabConfig);
		}
	}
	
	function onHelp(tabId) {
		if (tabId) {
			var menuData = menu.getRouterDataByRouter(tabId);
			
			if (menuData && menuData.menuHelp) {
				var href = getServicePath() + "/singlePage?html=" + menuData.menuHelp;
				$btnHelp.attr("target", "_blank").attr("href", href);
				$btnHelp.click();
				
				/*
				tabs.addTab({
					id: tabId + "_" + "help",
					title: menu.menuName + "#" + "帮助文档",
					remote: {
						url: getServicePath() + "/page",
						iframe: true,
						param:  {
							html: menu.menuHelp
						}
					}
				});
				*/
			} 
		}
	}
	
	// 添加欢迎页
	var _welcomeInit = false;
	function addTabWelcome() {
		if (_welcomeInit){ 
    		//return;
    	}
    	_welcomeInit = true; 
    	
    	welcomeHtml = _welcomeHtml || "static/core/page/welcome/welcomeNew.html";
    	welcomeCtrl = _welcomeCtrl || "static/core/page/welcome/js/welcomeCtrlNew";
    	welcomeOpen = _welcomeOpen || 0;
    	
    	if (welcomeOpen == 0) { // 默认
    		tabs.addTab({
        		id: "welcome",
        		title: "首页",
        		closable: false,
        		refreshable:false,
        		_menu: true,
        		remote: {
        			url: getServer() + "/" + welcomeHtml,
        			iframe: false,
        			afterLoad: function() {
        				if (welcomeCtrl) {
        					require([welcomeCtrl], function(Ctrl) {
        						Ctrl();
        					});
        				}
        			}
        		}
        	});
    	} else if (welcomeOpen == 1) { // 以room自带的页面为容器
    		tabs.addTab({
        		id: "welcome",
        		title: "首页",
        		closable: false,
        		refreshable:false,
        		_menu: true,
        		remote: {
        			//url: getStaticPath() + "/core/page/home/subHome.jsp",
        			url:  getServicePath() + "/page",
        			iframe: true,
        			param: {
        				ctrl: welcomeCtrl,
        				html: welcomeHtml
        			}
        		}
        	});
    	} else if (welcomeOpen == 2) { // 自定义页面容器
    		tabs.addTab({
        		id: "welcome",
        		title: "首页",
        		closable: false,
        		refreshable:false,
        		_menu: true,
        		remote: {
        			url: getServer() + "/" + welcomeHtml,
        			iframe: true
        		}
        	});
    	}
	}
	
	function addTab404() {
		tabs.addTab({
			id: "404",
			title: "404",
			_menu: true,
			refreshable:false,
			remote: {
				url: getStaticPath() + "/core/page/404.html",
				iframe: true
			}
		});
	}
	
	// 添加菜单
	function addTabMenu(r) {
		var menuData = menu.getRouterDataByRouter(r);
		
		if (menuData) { //查到对应的菜单
			if (menuData.menuOpen == "1" || menuData.menuOpen == "3") { // 以room自带容器打开
				tabs.addTab({
					id: menuData.menuRouter,
					title: menuData.menuName,
					_menu: true,
					remote: {
						url: getServicePath() + "/page",
						iframe: true,
						param:  {
    						//ctrl : menu.menuCtrlUrl,
    						//html : menu.menuUrl,
    						//service : menu.menuService,
    						//tabId : menu.menuRouter //tab组件中自动添加tabId参数
						}
					}
				})
			} else if (menuData.menuOpen == "2" || menuData.menuOpen == "4") { // 自定义容器 
				tabs.addTab({
					//id: menu.menuId,
					id: menuData.menuRouter,
					title: menuData.menuName,
					_menu: true,
					remote: {
						url: menuData.menuUrl,
						iframe: true
					}
				})
			} 
		} 
	}
	
	
	return init;

});