/* 菜单渲染 */
define(["jquery"], function() {
	
	function init() {
    	return new HomeExtend();
	}
	
	function HomeExtend() {
		var _this = this;
		
		HomeExtend.init.call(_this);
	}
	
	HomeExtend.init = function() {
		// 此处编写业务逻辑
	}
	
	// 如果需要自定义菜单时，覆盖下面这个方法，参数：data，是菜单的数据
	//HomeExtend.prototype.renderMenu = function(data) {}
	
	return init;
})