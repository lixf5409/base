/**
 * 
    config
    var config = {
    	id: '',
    	modal: boolean,
    	fontSize: '',
    	text: '',
    	width: '',
    	height: '',
    	html: ''
    }
    
    method
    var method = {
    	show: null,
    	close: null,
    	isShow: null
    }
 * 
 * 
 * loading组件
 * 使用方法：
 * var loading = Loading({
 * 			id : "",							//要显示在某个元素上的元素Id[默认document.body]
			modal : true,						//是否显示遮罩层[默认true]
			fontSize : "18",					//大小[默认sm(中), 还有lg(大)和xs(小)]
			text : "",							//要显示的文本内容[默认无]
			width : "100",						//高度
			height : "30",						//宽度
			html : ""							//自定义html代码[默认无]});
   });		
 * loading.show();
 * loading.close();
 */
define(["jquery"/*, "css!PDUtilDir/css/loading"*/], function(){
	
	function init(config){
		var loading = new Loading(config);
		
		return loading;
	}
	
	function Loading(config) {
		this.config = $.extend({
			id: '',							//要显示在某个元素上的元素Id或者dom对象[默认document.body]
			modal: true,						//是否显示遮罩层[默认true]
			fontSize: '18',					//大小[默认sm(中), 还有lg(大)和xs(小)]
			text: '',							//要显示的文本内容[默认无]
			width: '100',						//高度
			height: '30'/*,					//宽度
			html : "",*/						//要显示的html代码[默认无]
		}, config);

		Loading.init.call(this);
	}
	
	Loading.init = function() {
		var _this = this;
		if (typeof _this.config.id == "string") { //id
			_this._parent = _this.config.id ? document.getElementById(_this.config.id) : document.body;
		}
		if (typeof _this.config.id == "object") { //dom
			_this._parent = _this.config.id;
		}
		
		Loading.render.call(_this);
	}
	
	Loading.render = function() {
		var _this = this;
		//内容
		var $loading = _this._$loading = $('<div class="cs-loading"></div>');
		//遮罩层
		var $loadingMask = _this._$loadingMask = _this.config.modal ? $('<div class="cs-loading-mask"></div>') : null;
		
		var parent = _this._parent;
		if (parent == document.body) { //如果是body，直接fixed
			$loadingMask && $loadingMask.addClass("fixed");
		} else {//为父元素添加position
			var position = $(parent).css("position");
			if (position != "absolute" && position != "fixed" && position != "relative") {
				$(parent).css("position", "relative");
			}
		}
		
		var html = _this.config.html ? html : null;
		var text = _this.config.text;
		
		if (html) {//设置html
			$loading.html(html);
		} else {//设置text
			var $text = $('<span></span>').css("font-size", parseInt(_this.config.fontSize));
			var i = '<i class="fa fa-spinner fa-pulse"></i>';
			i = text ? (i + "&nbsp;" + text) : i;
			$text.html(i).appendTo($loading);
		}
		
		$(parent).append($loading);
		$loadingMask && $(parent).append($loadingMask);
		
		//设置内容宽、高
		$loading.width(parseFloat(_this.config.width)).height(parseFloat(_this.config.height));
		
		//设置居中
		var left, top, wP, hP,
			w = $loading.width(),
			h = $loading.height();
		if (parent == document.body) {
			wP = $(document).width();
			hP = $(document).height();
		} else {
			wP = $(parent).outerWidth(),
			hP = $(parent).outerHeight();
		}
		
		//计算
		left = (wP-w) / 2;
		top = (hP-h) / 2;
		
		$loading.css({
			left : left + "px",
			top : top + "px"
		});
	}
	
	Loading.prototype.constructor = Loading;
	
	Loading.prototype.show = function(){
		if (!this._$loading) {
			Loading.render.call(this);
		}
		this._$loading.show();
		this._$loadingMask && this._$loadingMask.show();
		
		// 判断当前是否有获取焦点的元素，如果有，就让它失去焦点【为防止按钮多次点击或者空格点击触发多次请求】
		document.activeElement && document.activeElement.blur();
		
		this._isShow = true; // is show flag
	};
	
	Loading.prototype.close = function(){
		this._$loading && this._$loading.hide() && this._$loading.remove() && (this._$loading = null);
		this._$loadingMask && this._$loadingMask.hide() && this._$loadingMask.remove() && (this._$loadingMask = null);
		this._isShow = false; 
	};
	
	Loading.prototype.isShow = function(){
		return this._isShow;
	};
	
	return init;
});