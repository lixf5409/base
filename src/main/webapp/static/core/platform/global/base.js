/*
 * base.js
 * 基本设置
 */
define(['PDUtilDir/alert',
	"jquery",
	"Bootstrap"], function(Alert){
	
    /**
     * 对jquery.ajax进行包装（不改变使用方式）
     * 目的是统一处理公共需求
     */
	(function(){
		//授权验证标志
		var AuthFlag = false;
		//服务端异常验证标志
		var serverErrorFlag = false;
		
		//ajax方法clone
		var _ajax = $.ajax;
		
		//ajax方法重新定义
		$.ajax = function(param) {
			//ajax deferred promise 保持原有promise操作
			var promise;
			
			var _param = $.extend({}, {autoWrap : true}, param);
			
			//如果不需要默认的封装:autoWrap = false;
			if (!_param.autoWrap) {
				promise = _ajax(_param);
				//直接返回
				return promise;
			}
			
			//默认ajax options
			var defaultOpts = {
				type: "POST",
				dataType: "json",
				cache: false,
				headers: {
					"CSRFToken" : getCSRFToken()
				}
			};
			//deep extend
			_param = $.extend(true, defaultOpts, _param);
			
			//add t
			if (!_param.cache) {
				var _url = _param.url || ""; 
				var date = new Date();
				var PD_T = "PD_T=" + date.getFullYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
				if (_url.indexOf("?") != -1) {
					_url += "&" + PD_T;
				} else {
					_url += "?" + PD_T;
				}
				_param.url = _url;
			}
			
			if (_param.success) {
				_param.callback = _param.success;
				delete _param.success;
			}
			
			promise = _ajax($.extend({
				success:function(response){
					var code = response.status || response.code || "200";
					//如果是整形，转换为字符串
					typeof(code) == "number" && (code = code + "");
					//状态码控制
					switch(code){
						case "200":
							if (_param.callback) {
								response.hasOwnProperty("model") ? _param.callback(response.model) : _param.callback(response);
							}
							break;
						case "401":
							//弹出框重新登录
							top.SWORDROOM.reLogin(function(){
								// 登录成功之后重新执行下当前请求
                                $.ajax(param);
                            });

							break;
						case "400":
							//客户端错误：受到攻击或者请求异常
							Alert({
								message: "请求异常"
							});
							break;
						case "403":
							//未授权
							if (!AuthFlag) {
								Alert({
									message: "请求的资源未授权"
								});
								AuthFlag = true;
								//过一段时间再设置成false
								setTimeout(function(){
									AuthFlag = false;
								}, 2000);
							}
							break;
						case '500':
							if(!serverErrorFlag){
								var info = '';
								info += '<p><code>服务器端异常：</code>' + response.msg + '</p>';
								info += '<p class="code-500-detail-switch" style="text-align:center;margin: 15px 0;cursor:pointer;color: #6666FF;">';						
								info += 	'<span class="detail-switch-text" style="">查看详情</span>';
								info += 	'<span style="display: inline-block;margin-top: -5px;border-top: 1px dashed #6666FF;width: 100%;"></span>';
								info += '</p>';
								info += '<p class="code-500-detail" style="display:none;margin-top: 5px;">';
								
								for (var i=0; i<response.exceptionDetail.length; i++){
									info += response.exceptionDetail[i] + '<br>';
								}
								info +=  '</p>';
								
								var config = {
									message: info,
									dialogSize: 'M'
								};
								Alert(config);
								//为详情增加点击事件
								var $detailSwitch = $('.code-500-detail-switch');
								$('.code-500-detail-switch').on('click', function(){
									var $detail = $('.code-500-detail');
									if($detail.is(':visible')){
										//详情可见
										$detailSwitch.find('span.detail-switch-text').text('查看详情');
										$detailSwitch.find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
										$detail.hide();
									}else{
										//详情不可见
										$detailSwitch.find('span.detail-switch-text').text('隐藏详情');
										$detailSwitch.find('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
										$detail.show();
									}
								});
								
								serverErrorFlag = true;
								setTimeout(function(){
									serverErrorFlag = false;
								}, 2000);
							}
							break;
						default :
							Alert({
								message: "<code>" + code + ":</code>服务器端异常，请联系管理员<br/>" + (response.msg || response.message)
							});
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown){
					console.log("ajax error:" + textStatus);
				}
			}, _param));
			
			return promise;
		};
	})();
	
    /*
     * 全局ajax监听
     */
	/*(function(){
		var startTimer = null;
		var endTimer = null;
		$(document).ajaxStart(function(){
			/!*
			clearTimeout(startTimer);
			//延迟出现，如果时间比较短就不出现了
			startTimer = setTimeout(function(){
				Util.loading.show();
				endTimer = setTimeout(function(){
					Util.loading.hide();
				}, 200);
			}, 100);
			*!/
		}).ajaxSend(function(evt, request, settings){
		}).ajaxSuccess(function(evt, request, settings){
		}).ajaxComplete(function(evt, request, settings){
		}).ajaxError(function(evt, request, settings){
			//请求出错时关闭等待信息
		}).ajaxStop(function(){
			//请求结束时关闭等待信息
			/!*
			clearTimeout(startTimer);
			clearTimeout(endTimer);
			Util.loading.hide();
			*!/
		});
	})();*/
    
	/**
	 * 打开Form表单公共方法，只在开发样例form中用到了（最终将删掉该方法）
	 * @param param
	 * @returns {*}
	 */
	window.openForm = function(param) {
		var url = getServicePath() + "/form";
		//var url = getServer()+"/static/core/page/form/form.jsp";
		//打开空页面
		var newWindow = window.open(url, "TempPostForm");
		if (!newWindow) return false;
		var html = "<html><head></head><body><form id='TempPostForm' method='post' action='" + url + "'>";
		for (var key in param){
			html += "<input type='hidden' name='" + key + "' value='" + param[key] + "'/>";
		}
		html += "</form><script type='text/javascript'>document.getElementById(\"TempPostForm\").submit()</script></body></html>";
		newWindow.document.write(html);
		return newWindow;
	};
    
    /**
     * 复写bootstrap的modal组件的hideModal方法，为了防止多个modal同时打开时对body产生的padding和滚动条的影响
     * 注意：更新bootstrap时，注意bootstrap的hideModal会有更新
     * by elva
     */
    +function() {
    	//避免padding的影响
    	$.fn.modal.Constructor.prototype.setScrollbar = function(){};		//清空setScrollbar方法
    	$.fn.modal.Constructor.prototype.resetScrollbar = function(){};		//清空resetScrollbar方法
    	//避免滚动条的影响
    	var old = $.fn.modal.Constructor.prototype.hideModal;
    	$.fn.modal.Constructor.prototype.hideModal = function() {			//重写hideModal方法
    		var that = this;
    	    this.$element.hide();
    	    this.backdrop(function () {
    	      if ($(".modal.in").length == 0) {
    	        that.$body.removeClass('modal-open');
    	        that.resetScrollbar() 
    	      }
    	      that.resetAdjustments();
    	      that.$element.trigger('hidden.bs.modal')
    	    })
    	}
    }();
    
    /**
     * 添加本地存储功能api
     */
    +function() {
    	
    	var isLocalStorage = false,
    		isSessionStorage = false;
    	
    	function LocalStorage() {
    		var _this = this;
    		
    		if (window.localStorage) { // 浏览器支持localStorage
    			isLocalStorage = true;
    		}
    		
    		if (window.sessionStorage) { // 浏览器支持sessionStorage
    			isSessionStorage = true;
    		}
    		
    		isSessionStorage = false; // 不用sessionStorage
    		if (!isSessionStorage) {
    			_this._localStorage = {}; // 创建本地localStorage对象
    		}
    	}
    	
    	LocalStorage.prototype.getItem = function(key) {
    		var _this = this,
    			_localStorage = _this._localStorage;
    		
    		if (isSessionStorage) {
    			return LocalStorage.getItemBySS.call(_this, key);
    		} else {
    			if (_localStorage.hasOwnProperty(key)) {
    				return _localStorage[key];
    			} 
    			
    			return LocalStorage.getItemFromTop.call(_this, key);
    		}
    	}
    	
    	LocalStorage.prototype.setItem = function(key, value, global) {
    		var _this = this,
    			_localStorage = _this._localStorage;
    		
    		if (isSessionStorage) {
    			LocalStorage.setItemBySS.call(_this, key, value);
    		} else {
    			if (typeof global == "boolean" && global) {
					LocalStorage.setItemToTop.call(_this, key, value);
    			} else {
    				_localStorage[key] = value;
    			}
    		}
    	}
    	
    	LocalStorage.prototype.removeItem = function(key) {
    		var _this = this,
				_localStorage = _this._localStorage;
    		
    		if (isSessionStorage) {
    			return LocalStorage.removeItemBySS.call(_this, value);
    		} else {
    			delete _localStorage[key];
    			
    			LocalStorage.removeItemFromTop.call(_this, key);
    		}
    	}
    	
    	LocalStorage.getItemBySS = function(key) {
    		var str = window.sessionStorage.getItem(key);
    		var obj = LocalStorage.isJson(str);
    		if (obj) {
    			return obj;
    		} else return str;
    	}
    	
    	LocalStorage.setItemBySS = function(key, value) {
    		if (typeof value == "string") {
    			window.sessionStorage.setItem(key, value);
    		} else if (typeof value == "object" && value) {
    			var str = JSON.stringify(value);
    			window.sessionStorage.setItem(key, str);
    		}
    	}
    	
    	LocalStorage.removeItemBySS = function(key) {
    		window.sessionStorage.removeItem(key);
    	}
    	
    	LocalStorage.isJson = function(str) {
	        try {
	          var obj = JSON.parse(str);
	          if (typeof obj === 'object' && obj) {
	            return obj;
	          } else {
	            return false;
	          }
	        } catch (error) {
	          console.log(error);
	          return false;
	        }
    	}
    	
    	LocalStorage.getItemFromTop = function(key) {
    		var _this = this;
    		
    		var topStorage = LocalStorage.getTop.call(_this);
    		if (topStorage) {  
				return topStorage.getItem(key);
			}
    		
    		return null;
    	}
    	
    	LocalStorage.setItemToTop = function(key, value) {
    		var _this = this;
    		
    		var topStorage = LocalStorage.getTop.call(_this);
    		if (topStorage) {
    			topStorage.setItem(key, value);
    		}
    	}
    	
    	LocalStorage.removeItemFromTop = function(key) {
    		var _this = this;
    		
    		var topStorage = LocalStorage.getTop.call(_this);
    		if (topStorage) {
    			topStorage.removeItem(key);
    		}
    	}
    	
    	LocalStorage.getTop = function() {
    		if (window.self != window.top) { 
    			return window.top.LocalMemory;
    		}
    		
    		return null;
    	}
    	
    	window.LocalMemory = new LocalStorage(); // 注册全局变量对象
    }();
    
    return {}
});