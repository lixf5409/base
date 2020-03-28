define(["jquery"], function() {
	
	function init(options) {
		return new Router(options);
	}
	
	function Router(options) {
		var _this = this;
		
		var _options = {
			defaultRouter: null,
			event: {
				onRouter: null
			}
		}
		
		this._options = $.extend(true, _options, options);
		this._$this = $(document.body);
		
		Router.init.call(_this);
	}
	
	Router.init = function() {
		var _this = this,
			_$this = _this._$this,
			options = _this._options;
		
		Router.bindEvent.call(_this);
	}
	
	Router.bindEvent = function() {
		var _this = this,
			_$this = _this._$this,
			options = _this._options,
			onRouter = options.event.onRouter;
		
		
		// 定义路由改变事件
		var _trigger = false; // 触发标记
		_$this.on("routerChange", function(e, router, param) {
			if (!_trigger) {
				_trigger = true;
				
				setTimeout(function() {_trigger = false;}, 100); // 防止短时间内多次触发
				
				typeof onRouter == "function" && onRouter(router, param);
			}
		});
		
	}
	
	Router.prototype.start = function() {
		var _this = this,
			options = _this._options,
			_$this = _this._$this;
		
		// 获取当前页面路由
		var router = _this.getRouter();
		if (!router) { // 没有任何路由就设置默认路由
			options.defaultRouter && _this.setRouter(options.defaultRouter);
			
			// 再次获取当前路由
			router = _this.getRouter();
		}
		
		// 如果有值就触发路由事件
		if (router) { 
			// 延迟触发（新起的线程不会影响主线种代码的执行，防止错误问题出现）
			//setTimeout(function(){
				_$this.trigger("routerChange", [router, _this.getRouterParam()]);
			//}, 30);
		}
		
		// 监听原生路由改变事件（延迟开启，这样在刚开始时不会触发多次）
		setTimeout(function() {
			$(window).on("hashchange", function() {
				
				var router = _this.getRouter();
				if (!router) { // 如果路由为空，就设置默认路由并返回
					options.defaultRouter && _this.setRouter(options.defaultRouter);
					return ;
				}
				var isRegistered = Router.isRegistered.call(_this, router);
				
				if (isRegistered) {
					_$this.trigger("routerChange", [router, _this.getRouterParam()]);
				} else {
					_$this.trigger("routerChange", ["404", null]);
				}
			});
		}, 300);
	}
	
	Router.prototype.setRouter = function(router, param) {
		var _this = this;
		
		var paramStr = "";
		if (param) {
			for (var key in param) {
				paramStr = paramStr.concat(key + "=" + param[key] + "&");
			}
			if (paramStr) {
				paramStr = paramStr.substr(0, paramStr.length - 1);
				paramStr = "?".concat(paramStr);
			}
		}
		
		window.location.hash = router + paramStr;
	}
	
	Router.prototype.getHash = function() {
		var _this = this;
		
		var hash = window.location.hash;
		
		if (hash) {
			// #
			hash = hash.substr(1);
			
			var result = {};
			
			var router = hash.split("?")[0];
			var query = hash.split("?")[1];
			var param = {};
			
			if (query) {
				var queryArr = query.split("&");
				for (var i=0; i<queryArr.length; i++) {
					param[queryArr[i].split("=")[0]] = queryArr[i].split("=")[1];
				}
			}
			
			result.router = router;
			result.param = param;
			
			return result;
		}
		
		return null;
	}
	
	Router.prototype.getRouterParam = function() {
		var _this = this;
		
		var hash = _this.getHash();
		if (hash) {
			return hash.param;
		}
		
		return {};
	}
	
	Router.prototype.getRouter = function() {
		var _this = this;
		
		var hash = _this.getHash();
		if (hash) {
			var router = hash.router;
			
			if (router.indexOf("/") == 0) {
				return router.substr(1);
			} else return router;
		}
		
		return null;
	}
	
	// 注册路由
	Router.prototype.register = function(data) {
		var _this = this,
			routerData = _this.routerData;
		
		if (!routerData) {
			routerData = _this.routerData = {};
		}
		
		for (var key in data) {
			routerData[key] = data[key];
		}
	}
	
	// 是否已经注册过
	Router.prototype.isRegistered = Router.isRegistered = function(router) {
		var _this = this,
			routerData = _this.routerData;
		
		if (router && routerData) {
			return routerData.hasOwnProperty(router);
		}
	}
	
	// 获取注册的
	Router.prototype.getRegistered = function(router) {
		var _this = this,
			routerData = _this.routerData;
		
		if (_this.isRegistered(router)) {
			return routerData[router];
		}
		
		return null;
	}
	
	return init;
});