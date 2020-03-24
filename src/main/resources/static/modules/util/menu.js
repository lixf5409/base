/**
 * 菜单组件
 * 使用方法
 * var menu = Menu({
 * 		width: "120",					//宽度[默认120]
 * 		height: "",						//最小高度[默认auto]
 * 		left: "",						//左边距
 * 		top: "",						//上边距
 * 		item: [{						//菜单项
 * 			id : "item_1"				//id，用来获取item[必填]			
 * 			name: "测试",				//名称
 * 			icon: "fa fa-refresh",		//图标
 * 			callback: function() {}		//回调方法
 * 		}]						
 * })
 */
define(["jquery"/*, "css!PDUtilDir/css/menu"*/], function(){

	function Menu(config) {
		this.config = $.extend({
			width: "120",					//宽度[默认120]
			items : []/*,
			onShow:null,
			onHide:null,
			onClick:null
			*/
		}, config);
		
		Menu.init.call(this);
	}
	
	Menu.init = function() {
		var menu = this;
		
		//初始化数据
		menu.items = {};
		var items = menu.config.items;
		if (items && items.length > 0) {
			for (var i=0; i<items.length; i++) {
				var item = items[i];
				item.id = item.id || Menu.makeRandomId();
				menu.items[item.id] = item;
			}
		}
		
		Menu.render.call(menu);
		Menu.bindEvt.call(menu);
	}
	
	Menu.render = function() {
		/**
		 * template
		 * 
		 * <div class="cs-menu">
		 * 		<div class="cs-menu-item">
		 * 			<span class="cs-menu-item-icon"></span>
		 * 			<span class="cs-menu-item-text"></span>
		 * 		</div>	
		 * </div>
		 */
		var menu = this;
		//创建菜单
		var $menu = menu.$menu = $('<div class="cs-menu"></div>');
		//设置菜单宽度、高度
		var width = menu.config.width || "120",
			height = menu.config.height;
		$menu.width(width);
		height && $menu.height(height);
		//设置菜单位置
		var left = menu.config.left,
			top = menu.config.top;
		left && $menu.css("left", parseFloat(left) + "px");
		top && $menu.css("top", parseFloat(top) + "px");
		//创建菜单项
		var items = menu.config.items;
		if (items && items.length > 0) {
			for (var i=0; i<items.length; i++) {
				var item = items[i];
				$menuItem = $('<div class="cs-menu-item"><span class="cs-menu-item-icon"><i></i></span><span class="cs-menu-item-text"></span></div>');
				if (item.icon) {
					$menuItem.find(".cs-menu-item-icon").addClass(item.icon);
				}
				if (item.name) {
					$menuItem.find(".cs-menu-item-text").text(item.name);
				}
				if (item.id) {
					$menuItem.attr("data-id", item.id);
				}
				
				$menu.append($menuItem);
			}
		}
		$(document.body).append($menu);
	}
	
	Menu.bindEvt = function() {
		var menu = this;
		menu._events = menu._events || {};
		//定义document的mousedown事件
		menu._events["docMouseDown"] = function(evt) {
			if (!menu.$menu.is(evt.target) && menu.$menu.has(evt.target).length == 0) {
				menu.hide();
			}
		}
		//定义cs-menu-item的click事件
		menu.$menu.delegate(".cs-menu-item", "click", function(evt){
			var itemId = $(this).attr("data-id");
			var item = menu.items[itemId];
			item && item.callback && item.callback.call(null);
			menu.hide();
		})
	}
	
	Menu.unBindEvt = function() {
		var menu = this;
		$(document).off("mousedown", this._events["docMouseDown"]);
		menu.$menu.undelegate("click");
	}
	
	Menu.makeRandomId = function() {
		var date = new Date();
		return "" + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
	}
	
	Menu.prototype = {
		show : function(pos) {
			if (pos) {
				pos.left && this.$menu.css("left", parseFloat(pos.left) + "px");
				pos.top && this.$menu.css("top", parseFloat(pos.top) + "px");
			}
			this.$menu.show();
			//监听document事件
			$(document).on("mousedown", this._events["docMouseDown"]);
		},
		hide : function() {
			this.$menu.hide();
			//卸载document事件
			$(document).off("mousedown", this._events["docMouseDown"]);
		},
		destroy : function() {
			Menu.unbindEvt.call(this);
			this.$menu.remove();
		},
		appendItem : function() {
			
		},
		removeItem : function() {
			
		},
		disableItem : function() {
			
		},
		enableItem : function() {
			
		},
		updateItem : function() {
			
		},
		hideItem : function() {
			
		},
		showItem : function() {
			
		},
		getItem : function(itemId) {
			
		}
	}
	
	return function(config){
		return new Menu(config);
	}
})