define(["jquery", "Bootstrap"], function(){
	
	function init(options) {
		return new Tab(options);
	}
	
	function Tab(options) {
		var _this = this;
		var defaultOpts = {
			navId : '',
			contentId : '',
			onSelect: null,
			//onBlur: null,
			onContextMenu: null
		};

		this.options = $.extend(defaultOpts, options);
		if (this.options.navId && this.options.contentId) {
			Tab.init.call(_this);
		} else {
			console.log("请初始化navId和contentId");
			return ;
		}
	}
	
	//导航的html模板
	var navHtml = 
		'<div class="cs-tabs-nav">' + 
			'<a class="cs-tabs-btn-left" href="javascript:;"><i class="fa fa-backward"></i></a>' +
			'<div class="cs-nav-wrap">' +
				'<div class="cs-nav-list">' +
				'</div>' +
			'</div>' +
			'<a class="cs-tabs-btn-right" href="javascript:;"><i class="fa fa-forward"></i></a>' +
			'<div class="cs-tabs-btn-nav btn-group">' + 
				'<a href="javascript:;" class="dropdown-toggle btn-link" data-toggle="dropdown">导航' + 
					/*
					<li><a href="#" data-type="other">首页</a></li>
					<li><a href="#" data-type="all">页面1</a></li>
					<li><a href="#" data-type="self">页面2</a></li>
					-->
					*/
                	'<span class="fa fa-caret-down"></span>' + 
              	'</a>' + 
              	'<ul class="dropdown-menu dropdown-menu-right">' + 
				'</ul>' + 
	        '</div>' + 
			'<div class="cs-tabs-btn-opts btn-group">' +
				'<a href="javascript:;" class="dropdown-toggle btn-link" data-toggle="dropdown">关闭操作' +
                	'<span class="fa fa-caret-down"></span>' +
              	'</a>' +
              	'<ul class="dropdown-menu dropdown-menu-right">' +
					'<li><a href="javascript:;" data-type="other">关闭其它选项卡</a></li>' +
					'<li><a href="javascript:;" data-type="all">关闭全部选项卡</a></li>' +
					'<li><a href="javascript:;" data-type="self">关闭当前选项卡</a></li>' +
				'</ul>' +
	        '</div>' +
	        '<div class="cs-tabs-contextmenu dropdown-menu">' +
	        	'<li><a href="javascript:;" data-type="help">帮助文档</a></li>' +
				'<li><a href="javascript:;" data-type="other">关闭其它选项卡</a></li>' +
				'<li><a href="javascript:;" data-type="all">关闭全部选项卡</a></li>' +
				'<li><a href="javascript:;" data-type="self">关闭当前选项卡</a></li>' +
			'</div>';
		'</div>';
	
	//内容的html模板
	var contentHtml = 
		'<div class="cs-tabs-content">' +
			/*
			'<div class="cs-tabs-panel active">' +
				'<iframe src="https://www.baidu.com" frameBorder="0" scrolling="true" height="100%" width="100%"></iframe>' +
			'</div>' +
			'<div class="cs-tabs-panel">' +
				'<div style="height:1000px;text-align:center;">bbbb</div>' +
			'</div>' +
			*/
		'</div>';

	Tab.init = function() {
		var _this = this,
			options = _this.options,
			$navWrap = _this.$navWrap = $("#" + options.navId),
			$contentWrap = $("#" + options.contentId);

		//$nav	
		var $nav = _this.$nav = $navWrap.find(".cs-tabs-nav");	
		if (!$nav[0]) {
			$nav = _this.$nav = $(navHtml).appendTo($navWrap);
		} 
		//$navList
		var $navList = _this.$navList = $nav.find(".cs-nav-list");
		//$btnNavList
		var $btnNavList = _this.$btnNavList = $nav.find(".cs-tabs-btn-nav ul");

		//$contentList
		var $contentList = _this.$contentList = $contentWrap.find(".cs-tabs-content");
		if (!$contentList[0]) {
			$contentList = _this.$contentList = $(contentHtml).appendTo($contentWrap);
		} 
		
		_this.$contextMenu = $nav.find(".cs-tabs-contextmenu");
		
		//config map
		_this.configMap = {};
		
		//event map
		_this.eventMap = {};
		
		// tab obj map
		_this.tabMap = {};
		
		//bind the tabId（绑定tabid）
		Tab.bindTabId.call(_this);

		//bind event
		Tab.bindEvent.call(_this);
	}

	Tab.bindTabId = function() {
		var _this = this,
			options = _this.options,
			$navList = _this.$navList,
			$contentList = _this.$contentList,
			$btnNavList = _this.$btnNavList;

		$navList.find("a").each(function(i, n){
			var tabId = $(this).data("id");
			//设置tabId
			if (tabId == null || tabId.length == 0) {
				tabId = Tab.randomTabId.call(_this);
				$(this).attr("data-id", tabId);
			}
			//设置current
			if ($(this).hasClass("active")) {
				_this.current = tabId;
			}
			//设置内容的tabId
			$contentList.find(".cs-tabs-panel").eq(i).attr("data-for", tabId);
			//设置导航的tabId
			$btnNavList.find("li").eq(i).attr("data-for", tabId);
		});
	}

	Tab.randomTabId = function() {
		var date = new Date();
		return "tabs-nav-" + date.getFullYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() + parseInt(Math.random() * 10000);
	}

	Tab.bindEvent = function() {
		var _this = this,
			options = _this.options,
			$nav = _this.$nav,
			$navList = _this.$navList,
			$contentList = _this.$contentList,
			$btnNavList = _this.$btnNavList,
			$contextMenu = _this.$contextMenu,
			$navWrap = _this.$navWrap,
			eventMap = _this.eventMap;

		// 页签点击选中事件
		$navList.on("click", "a", function(){
			var tabId = $(this).attr("data-id");
			if (tabId != _this.current) 
				_this.selectTab(tabId);
		});
		
		/* 右键菜单事件contextmenu */
		+function(){
			$navList.on("contextmenu", "a", function(e){
				var tabId = $(this).attr("data-id");

				// options中注册的onContextMenu事件
				if (typeof options.onContextMenu == "function") {
					var result = options.onContextMenu(tabId);
					
					if (typeof result == "boolean" && !result) {
						return false;
					}
				} 
				
				var left = e.clientX - $navWrap.offset().left;
				var top = e.clientY - $navWrap.offset().top;
				
				$contextMenu.css({
					left: left + 5,
					top: top + 5
				}).show();
				
				_this.selectTab(tabId);
				
				$(document).on("click.tabs.contextmenu", function(e){
					if (3 == e.which) { // 鼠标右键
						return ;
					}
					$contextMenu.hide();
					$(document).off("click.tabs.contextmenu");
			    });
				
				e.preventDefault();
				return false;
			});
			
			$contextMenu.on("mouseup", "a", function(e){
				if (3 == e.which) return ; // 鼠标右键
				var type = $(this).attr("data-type");
				switch(type) {
					case('self') :
						_this.closeTab(_this.current);
						break;
					case('other') :
						_this.closeOtherTab();
						break;	
					case('all') :
						_this.closeAllTab();
						break;	
					case('help') : 
						typeof options.onHelp == "function" && options.onHelp(_this.current);
						break;
				}
			});
		}();
		
		// 页签关闭按钮事件
		$navList.on("click", "a .cs-nav-btn-close", function(evt){
			evt.stopPropagation();

			var tabId = $(this).parent().attr("data-id");
			_this.closeTab(tabId);
		});

		// 页签刷新按钮事件
		$navList.on("click", "a .cs-nav-btn-refresh", function(evt){
			evt.stopPropagation();

			var tabId = $(this).parent().attr("data-id");
			_this.refreshTab(tabId);
		});

		// 导航下拉菜单关闭按钮事件
		$btnNavList.on("click", "a .cs-nav-btn-close", function(evt){
			evt.stopPropagation();

			var tabId = $(this).closest("li").attr("data-for");
			_this.closeTab(tabId);
		});

		// 导航下拉菜单选中事件
		$btnNavList.on("click", "li", function(){
			var tabId = $(this).attr("data-for");
			if (tabId != _this.current) 
				_this.selectTab(tabId);
		});

		// 操作下拉菜单事件
		$nav.on("click", ".cs-tabs-btn-opts ul a", function(){
			var type = $(this).attr("data-type");
			switch(type) {
				case('self') :
					_this.closeTab(_this.current);
					break;
				case('other') :
					_this.closeOtherTab();
					break;	
				case('all') :
					_this.closeAllTab();
					break;	
			}
		});

		// 向左滑动按钮事件
		$nav.find(".cs-tabs-btn-left").on("click", function(){
			Tab.scrollRight.call(_this);
		});

		// 向右滑动按钮事件
		$nav.find(".cs-tabs-btn-right").on("click", function(){
			Tab.scrollLeft.call(_this);
		});

		/*
		$navList.on("onAdd", function(evt, param1){
			typeof(options.onAdd)=="function" && options.onAdd();
		});
		*/

		// 自定义onClose事件
		$navList.on("onClose", function(evt, tabId, callback){
			// 以下触发的是通过调用tabs对象的onClose方法注册进来的指定某个tab关闭时的事件
			// tab onClose
			Tab.fireEvent.call(_this, tabId, "onClose", callback);
		});

		// 自定义onSelect事件
		$navList.on("onSelect", function(evt, tabId){
			// options中的onSelect是面向所有tabs的，每选中一个页签都会触发optins中的onSelect事件
			// tabs onSelect
			typeof(options.onSelect)=="function" && options.onSelect(tabId);
			
			// 以下触发的是通过调用tabs对象的onSelect方法注册进来的指定某个tab被选中时的事件
			// tab onSelect
			Tab.fireEvent.call(_this, tabId, "onSelect", null);
		});

		// 自定义onBlur事件（先暂时不处理该事件）
		$navList.on("onBlur", function(evt, tabId) {
			// 以下是触发options中的onBlur事件
			// ...

			// 以下触发的是通过调用tabs对象的onBlur方法注册进来的指定某个tab被选中时的事件
			// tab onBlur
			/*
			var eventObj = eventMap[tabId];
			if (eventObj) {
				var eventFunc = eventObj["onBlur"];
                if (typeof eventFunc == "function") {
                    eventFunc();
                }
			}
			*/
		});

		// 自定义onRefresh事件
		$navList.on("onRefresh", function(evt, tabId, callback) {
            // 以下触发的是通过调用tabs对象的onRefresh方法注册进来的指定某个tab被刷新时的事件
            // tab onSelect
            Tab.fireEvent.call(_this, tabId, "onRefresh", callback);
		});
	}

	//判断指定的tabId的页签是否存在
	Tab.exists = Tab.prototype.exists = function(tabId) {
		var _this = this,
			options = _this.options,
			$navList = _this.$navList;

		if (tabId != null && tabId.length > 0) {
			var $targetNav = $navList.find("a[data-id='" + tabId + "']");
			if ($targetNav[0]) {
				return true;
			}
		}
		return false;	
	}	
	
	//向左滑动
	Tab.scrollLeft = function() {
		var _this = this,
			$navList = _this.$navList;

		var wrapWidth = $navList.parent().width();
		var width = $navList.width();
		var left = $navList.position().left;
		var distance = wrapWidth / 2;
		
		if (wrapWidth > width) {
			left = 0;
		}else if (wrapWidth + Math.abs(left) > width) {
			left = -(width - wrapWidth);
		} else if (width - wrapWidth - Math.abs(left) < distance) {
			left = -(width - wrapWidth);
		} else {
			left = left - distance;
		}

		$navList.animate({
			left: left + "px"
		}, 200);
	}

	//向右滑动
	Tab.scrollRight = function() {
		var _this = this,
			$navList = _this.$navList;

		var wrapWidth = $navList.parent().width();
		var width = $navList.width();
		var left = $navList.position().left;
		var distance = wrapWidth / 2;
		
		if (wrapWidth > width) {
			left = 0;
		} else if (left > 0) {
			left = 0;
		} else if (Math.abs(left) < distance){
			left = 0;
		} else {
			left = left + distance;
		}

		$navList.animate({
			left: left + "px"
		}, 200);
	}

	//滑动到当前选中
	Tab.scrollToSelect = function() {
		var _this = this,
			$navList = _this.$navList,
			current = _this.current;

		var l = 0;		
		if (current) {
			var $current = $navList.find("a[data-id='" + current + "']");
			var cLeft = $current.position().left;//当前选中的左边框left值
			var cWidth = $current.width();//当前选中的宽度
			var cRight = cLeft + cWidth;//当前选中的右边框的left值
			
			var wrapWidth = $navList.parent().width();//容器宽度
			var width = $navList.width();//集合长度
			var left = $navList.position().left;//集合的left值
			//不用滑动的距离left-right
			var area = {
				left: wrapWidth / 4,
				right: (wrapWidth) / 4 * 3
			}

			if (wrapWidth > width) {
				l = 0 ;
			} else if (cLeft - Math.abs(left) < area.left) {
				l = area.left - cLeft;
				if (l > 0) l = 0;
			} else if (cRight - Math.abs(left) > area.right) {
				l = area.right - cRight;
				if (l < (wrapWidth - width)) l = wrapWidth - width;
			} else return ;
		}

		$navList.animate({
			left: l + "px"
		}, 200);
	}
	
	//添加页签
	Tab.prototype.addTab = function(config) {
		var _this = this,
			options = _this.options,
			$navList = _this.$navList,
			$contentList = _this.$contentList,
			$btnNavList = _this.$btnNavList;
			configMap = _this.configMap,
			tabMap = _this.tabMap;

		var defaultConfig = {
			id : Tab.randomTabId(),//id
			title : "默认标题",//标题
			content : "默认内容",//html内容
			
			remote : {
				url: "",//远程url
				iframe: false,//是否使用iframe
				afterLoad : null,//加载远程html成功后回调（iframe=false时有效）
				param: {}//iframe的src属性的参数（iframe=true时有效）
			},
			closable : true ,//是否可关闭
			refreshable: true // 是否可刷新 
		}
		config = $.extend(defaultConfig, config);

		var tabId = config.id;
		if (Tab.exists.call(_this, tabId)) { //the tabId already exists
			_this.selectTab(tabId);
			return;
		}
		
		//save config map（保存config）
		configMap[tabId] = config;
		
		//添加页签
		var $navItem = $('<a href="javascript:;" data-id="' + config.id + '"><span>' + config.title + '</span></a>').appendTo($navList);
		if (config.refreshable) {
			$navItem.append($('<b>&nbsp;&nbsp;</b><i class="cs-nav-btn-refresh fa fa-refresh"></i>'));
		}
		if (config.closable) {
			$navItem.append($('<b>&nbsp;&nbsp;</b><i class="cs-nav-btn-close fa fa-times-circle"></i>'));
		}
		//添加内容
		var $contentItem = $('<div class="cs-tabs-panel" data-for="' + config.id + '"></div>').appendTo($contentList);
		//添加导航按钮
		var $btnNavItem = $('<li data-for=' + config.id + '><a title="' + config.title + '" href="javascript:;"><span>' + config.title + '</span></a></li>').appendTo($btnNavList);
		if (config.closable) {
			$btnNavItem.find("a").append($('<i class="cs-nav-btn-close fa fa-times-circle"></i>'));
		}

		var remote = config.remote;
		var url = remote.url;
		if (url) {
			if (remote.iframe) {
				var paramArr = [];
		    	for (var key in remote.param) {
		    		paramArr.push(key + "=" + encodeURIComponent(remote.param[key]));
		    	}
				paramArr.push("tabId=" + config.id); //拼接上tabId
				
				if (url.indexOf("?") == -1) {
					url = url + "?" + paramArr.join("&");
				} else {
					url = url + "&" + paramArr.join("&");
				}
				
				var iframe = '<iframe src="' + url + '" frameBorder="0" scrolling="true" height="100%" width="100%"></iframe>';
				$contentItem.html(iframe);
			} else {
				require(['text!' + url],function(html){
					$contentItem.html(html);
					typeof remote.afterLoad == "function" && remote.afterLoad();
				})
			}
		} else {
			$contentItem.html(config.content);
		}
		
		// tab obj map
		tabMap[tabId] = {
			config: config,
			$nav: $navItem,
			$content: $contentItem
		}
		
		//添加完成后就选中该页签
		_this.selectTab(config.id);
	}
	
	//关闭指定页签
	Tab.prototype.closeTab = function(tabId, forceClose) {
		var _this = this,
			options = _this.options,
			$navList = _this.$navList,
			$contentList = _this.$contentList,
			$btnNavList = _this.$btnNavList,
			configMap = _this.configMap;

		if (tabId != null && tabId.length > 0) {
			var $targetNav = $navList.find("a[data-id='" + tabId + "']");
			if (!Tab.isCloseable.call(_this, tabId)) return ;// 是否可删除
			
			function callback() {
				var $targetContent = $contentList.find(".cs-tabs-panel[data-for='" + tabId + "']");
				var $targetBtnNav = $btnNavList.find('li[data-for="' + tabId + '"]');
				var $next = null;
				
				var index = $targetNav.index();
				var length = $navList.find("a").length;
				if (tabId == _this.current) { //关闭自己的同时指定下一个
					if (length != 1) {
						if (index == $navList.find("a").length - 1) { // 如果是最后一个就指定前一个
							index--; 
						} else index++; // 如果不是最后一个就指定下一个
						$next = $navList.find("a").eq(index);
					}
				}
				
				$targetNav.remove(); //remove nav
				$targetContent.remove(); //remove content
				$targetBtnNav.remove(); //remove nav btn
				delete configMap[tabId]; //remove config map
				$next && _this.selectTab($next.attr("data-id"));
			}
			
			if (typeof forceClose == "boolean" && forceClose) {
				callback();
			} else {
				$navList.trigger("onClose", [tabId, callback]); 
			}
		}	
	}
	
	//关闭“其它”页签
	Tab.prototype.closeOtherTab = function() {
		var _this = this,
			options = _this.options,
			$navList = _this.$navList,
			$contentList = _this.$contentList,
			$btnNavList = _this.$btnNavList,
			current = _this.current;

			$navList.find("a").each(function() {
				var _thisA = this;
				var tabId = $(_thisA).attr("data-id");
				if (tabId != current && Tab.isCloseable.call(_this, tabId)) {
					function callback() {
						var $targetContent = $contentList.find(".cs-tabs-panel[data-for='" + tabId + "']");
						var $targetBtnNav = $btnNavList.find('li[data-for="' + tabId + '"]');
						
						$(_thisA).remove(); //remove nav
						$targetContent.remove(); //remove content
						$targetBtnNav.remove(); //remove nav btn
						delete configMap[tabId]; //remove config map
					}
					
					$navList.trigger("onClose", [tabId, callback]); 
				}
			});
			
			_this.selectTab(current);
	}
	
	//关闭“所有”页签
	Tab.prototype.closeAllTab = function() {
		var _this = this,
			options = _this.options,
			$navList = _this.$navList,
			$contentList = _this.$contentList,
			$btnNavList = _this.$btnNavList,
			current = _this.current;

			$navList.find("a").each(function() {
				var _thisA = this;
				var tabId = $(_thisA).attr("data-id");
				if (!Tab.isCloseable.call(_this, tabId)) return ;
				
				function callback() {
					var $targetContent = $contentList.find(".cs-tabs-panel[data-for='" + tabId + "']");
					var $targetBtnNav = $btnNavList.find('li[data-for="' + tabId + '"]');
					
					$(_thisA).remove(); //remove nav
					$targetContent.remove(); //remove content
					$targetBtnNav.remove(); //remove nav btn
					delete configMap[tabId]; //remove config map
				}
				
				$navList.trigger("onClose", [tabId, callback]); 
			});

			var $next = $navList.find("a").last();
			if ($next[0]) {//自动选择最后一个
				_this.selectTab($next.attr("data-id"));
			} else _this.current = null;
	}
	
	// 是否是可关闭的页签
	Tab.isCloseable = function(tabId) {
		var _this = this,
			$navList = _this.$navList;
		
		var $targetNav = $navList.find("a[data-id='" + tabId + "']");
		
		return ($targetNav[0] && $targetNav.find(".cs-nav-btn-close")[0]);
	}
	
	//选中指定tabId的页签
	Tab.prototype.selectTab = function(tabId) {
		var _this = this,
			options = _this.options,
			$navList = _this.$navList,
			$contentList = _this.$contentList,
			$btnNavList = _this.$btnNavList;

		if (tabId != null && tabId.length > 0) {
			if (_this.current != tabId) {
				var $targetNav = $navList.find("a[data-id='" + tabId + "']");
				var $targetContent = $contentList.find(".cs-tabs-panel[data-for='" + tabId + "']");
				var $targetBtnNav = $btnNavList.find('li[data-for="' + tabId + '"]');
				
				if ($targetNav[0] && $targetContent[0]) {
					$navList.find("a").removeClass("active");
					$targetNav.addClass("active");
					$contentList.find(".cs-tabs-panel").removeClass("active");
					$targetContent.addClass("active");
					$btnNavList.find("li").removeClass("active");
					$targetBtnNav.addClass("active");
					//记下当前选中
					// trigger blur
					$navList.trigger("onBlur", [_this.current]); 
					
					_this.current = tabId;
					
					//trigger select
					$navList.trigger("onSelect", [tabId]);
				}
			}
			
		}
		//滑动至当前选中
		Tab.scrollToSelect.call(_this);
	}
	
	//获取指定tabId的页签的config对象
	Tab.prototype.getTabConfig = function(tabId) {
		var _this = this,
			configMap = _this.configMap;
		
		if (tabId != null && tabId.length > 0) {
			return configMap[tabId];
		}
	}
	
	//获取指定tabId的页签的window对象（iframe时有效）
	Tab.prototype.getTabWin = function(tabId) {
		var _this = this,
			options = _this.options,
			$navList = _this.$navList,
			$contentList = _this.$contentList,
			$btnNavList = _this.$btnNavList;
		
		if (tabId != null && tabId.length > 0) {
			if (Tab.exists.call(_this, tabId)) { //the tabId already exists
				var $targetContent = $contentList.find(".cs-tabs-panel[data-for='" + tabId + "']");
				if ($targetContent[0]) {
					var $iframe = $targetContent.find("iframe");
					if ($iframe[0]) 
						return $iframe[0].contentWindow;
				}
			} else console.log("no specified tab");
		} else console.log("tabId is null");
		
		return null;
	}

	// 获取tab对象
	Tab.prototype.getTab = function(tabId) {
		var _this = this,
			tabMap = _this.tabMap;
		
		if (tabId != null && tabId.length > 0) {
			if (Tab.exists.call(_this, tabId)) { //the tabId already exists
				return tabMap[tabId];
			}
		}
	}
	
	// 注册onSelect事件
	Tab.prototype.onSelect = function(tabId, func) {
		var _this = this;

        Tab.attachEvent.call(_this, tabId, "onSelect", func);
	}
	
	// 注册onBlur事件（暂时不对外提供）
	/*
	Tab.prototype.onBlur = function(tabId, func) {
		var _this = this,
		eventMap = _this.eventMap;
	
		if (Tab.exists.call(_this, tabId)) {
			var eventObj = eventMap[tabId];
			if (!eventObj) {
				eventObj = {};
				eventMap[tabId] = eventObj;
			}
			
			eventObj["onBlur"] = func;
		}
		
		return _this;
	}
	*/

	// 注册onClose事件回调
	Tab.prototype.onClose = function(tabId, func) {
        var _this = this;

        Tab.attachEvent.call(_this, tabId, "onClose", func);
	}
	
	// 注册onRefresh事件回调
	Tab.prototype.onRefresh = function(tabId, func) {
		var _this = this;

        Tab.attachEvent.call(_this, tabId, "onRefresh", func);
	}
	
	// 刷新tab
	Tab.prototype.refreshTab = function(tabId) {
		var _this = this,
            $navList = _this.$navList;
		
		if (Tab.exists.call(_this, tabId)) {

			function callback() {
                var win = _this.getTabWin(tabId);
                if (win) {
                    win.location.reload();
                }
            }

            $navList.trigger("onRefresh", [tabId, callback]);
        }
		
		return _this;
	}

	// 注册某个页签的某个事件
	Tab.attachEvent = function(tabId, eventName, func) {
        var _this = this,
            eventMap = _this.eventMap;

        if (Tab.exists.call(_this, tabId)) {
            var eventObj = eventMap[tabId];
            if (!eventObj) {
                eventObj = {};
                eventMap[tabId] = eventObj;
            }

            eventObj[eventName] = func;
        }
	}

	// 触发某个页签的某个事件
	Tab.fireEvent = function(tabId, eventName, callback) {
        var _this = this,
            eventMap = _this.eventMap;

        var eventObj = eventMap[tabId];
        if (eventObj) {
            var eventFunc = eventObj[eventName];
            if (typeof eventFunc == "function") {
                var result = eventFunc();
                if (typeof result == "boolean" && !result) return ; // 如果开发人员返回false了，那就不继续往下执行原本的逻辑了
            }
        }

        typeof callback == "function" && callback();
	}

	return init;
});