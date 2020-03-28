/**
 * 图片裁剪（集成了webuploader和cropper）
 * by Elva At Css Team
 * 初始化：
 	require(["Crop"], function(Crop){
		 //初始化Crop
            var crop = Crop({
            	src : "", 										//初始化的图片的src(base64编码或者是url)
				ratio : 4 / 3, 									//图片的宽、高比例，默认4/3
				url : getServer() + "/cropper", 				//图片上传地址
				accept: "gif,jpg,jpeg,bmp,png",					//图片允许的文件后缀
				formData : {},									//图片上传时参数
				success : null, 								//图片上传成功后回调
				error : null  									//图片上传失败后回调
            });
        })
	})
 */
define(["WebUploader",
        "PDUtilDir/dialog",
        "css!WebUploaderCss", 
        "Cropper", 
        "css!CropperCss", 
        //"css!PDUtilDir/css/crop.css", 
        "jquery"], function(WebUploader, Dialog){
	
	//初始化方法
	function init(options) {
		var defaultOptions = {
			src : "", 										//初始化的图片的src(base64编码或者是url)
			ratio : 4 / 3, 									//图片的宽、高比例，默认4/3
			url : getServer() + "/cropper", 				//图片上传地址
			accept: "gif,jpg,jpeg,bmp,png",					//图片允许的文件后缀
			formData : {},									//图片上传时参数
			success : null, 								//图片上传成功后回调
			error : null  									//图片上传失败后回调
		}
		
		options = $.extend(defaultOptions, options);
		return new Crop(options);
	}
	
	function Crop(options) {
		this.options = options;
		
		this.uploader = null;			//webuploader对象
		this.cropper = null;			//cropper对象
		this.dialog = null;				//dialog对象
		
		Crop.init.call(this);
	}
	
	Crop.init = function() {
		var _this = this,
			options = _this.options;
		
		//浏览器是否支持transition属性
		var transition = (function(){ 
		    var thisBody = document.body || document.documentElement,
		    thisStyle = thisBody.style,
		    support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
		          
		    return support; 
		})();
		
		//手动加载远程html(dialog的url方式会影响cropper的初始化)
		require(["text!" + getStaticPath() + "/core/platform/lib/util/crop/crop.html"], function(html){
			//初始化dialog
			var dialog = _this.dialog = Dialog({
	            id:"csCropDiaolog",
	            cache:false,                 
	            title:"图片裁剪",
	            dialogSize:"modal-lg",
	            body: html,
	            buttons:[{
	                name: "完成",
	                callback:function(){
	                    //图片裁剪后调用submit方法将数据提交至后台
	                	_this.uploader.upload();
	                }
	            }]
	        });
			
			if (!transition) { //不支持动画
				dialog.$getDialog().on('show.bs.modal', function (e) {
					_this.uploader = new Uploader(_this); //初始化uploader
		  			_this.cropper = new Cropper(_this);	//初始化cropper
		  			
					if (options.src) {
						_this.cropper.srcWrap(options.src);
					} 
				});
			} else {
				//监听显示完成事件，如果使用url和afterLoad方式那么cropper初始化将失败
				dialog.$getDialog().on('shown.bs.modal', function (e) {
					_this.uploader = new Uploader(_this); //初始化uploader
					_this.cropper = new Cropper(_this);	//初始化cropper
					
					if (options.src) {
						_this.cropper.srcWrap(options.src);
					} 
				});
			}
			
			dialog.show();
	  	});
		
		
	}
	
	Crop.prototype.setFormData = function(data) {
		var _this = this,
			uploader = _this.uploader;
		
		uploader.setFormData(data);
	};
	
	Crop.prototype.close = function() {
		var _this = this,
			dialog = _this.dialog;
		
		dialog.hide();
	}
	
	Crop.prototype.getCropper = function() {
		var _this = this,
			cropper = _this.cropper;
		
		if (cropper && cropper.$img) {
			return cropper.$img;
		}
		return null;
	}
	
	function Uploader(crop) {
		this.crop = crop;
		//是否选择过文件
		this.queue = false;
		
		this.init();
	}
	
	Uploader.prototype.init = function() {
		var _this = this;
			options = _this.crop.options;
		
		var uploader = _this.uploader = new WebUploader.Uploader({
			pick: {
                id: '.cs-crop-picker',
                multiple: false
            },
            thumb: {  // 设置用什么方式去生成缩略图。
                quality: 70, 
                allowMagnify: false, // 不允许放大
                crop: false// 是否采用裁剪模式。如果采用这样可以避免空白内容。
            },
            chunked: false, // 禁掉分块传输，默认是开起的。
            compress: false, // 禁掉上传前压缩功能，因为会手动裁剪。
            server: options.url,
            swf: getServer() + '/static/core/platform/lib/webuploader/Uploader.swf',
            formData : options.formData,
            // 只允许选择图片文件。
            accept: {
                title: 'Images',
                extensions: options.accept,
                mimeTypes: 'image/*'
            },
            // fileNumLimit: 1,
            onError: function() {
                var args = [].slice.call(arguments, 0);
            }
		});
		uploader.on("beforeFileQueued", function(_file){
			//重置下队列，这样可以上传重复的图片
			uploader.reset();
		});
		uploader.on('fileQueued', function( _file ) {
            file = _file;
            
            uploader.makeThumb( file, function( error, src ) {
                if ( error ) {
                    alert('不能预览');
                    return;
                }
                
                _this.crop.cropper.srcWrap( src );
                _this.queue = true;//已经选择过图片

            }, 1, 1 );   // 注意这里的 height 值是 1，被当成了 100% 使用。
        });
		uploader.on( 'uploadSuccess', function( file, response ) {
			options.success && options.success(file, response);
		});
		uploader.on( 'uploadError', function( file, reason ) {
			options.error && options.error(file, reason);
		});
	}
	
	Uploader.prototype.upload = function() {
		var _this = this,
			options = _this.crop.options,
			cropper = _this.crop.cropper;
			
		
		if (cropper && cropper.$img) {
			//上传文件个数
			var files = _this.uploader.getFiles();
			if (files && files.length > 0) {
				_this.setFormData(cropper.$img.cropper("getData"));
				_this.uploader.upload();
			} else {
				if (!_this.quene) {//没有选择过图片
					var formData = _this.setFormData(cropper.$img.cropper("getData"));
					$.ajax({
						url : options.url,
						data : formData,
						success : function(data) {
							options.success && options.success();
						},
						error : function() {
							options.error && options.error();
						}
					})
				} else {
					alert("请重新选择要裁剪的图片！");
				}
			}
		} else {
			alert("请重新选择要裁剪的图片！");
		}
	}
	
	Uploader.prototype.setFormData = function(param) {
		var _this = this,
			uploader = _this.uploader;
		
		var formData = uploader.option("formData");
    	$.extend(formData, param);
    	uploader.option('formData', formData);
    	return formData;
	}
	
	function Cropper(crop) {
		this.crop = crop;
		//是否已经初始化
		this.active = false;
		// 判断浏览器是否支持图片的base64
        this.isBase64Supported = ( function() {
            var data = new Image();
            var support = true;
            data.onload = data.onerror = function() {
                if( this.width != 1 || this.height != 1 ) {
                    support = false;
                }
            }
            data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            return support;
        } )();
        //绑定事件
        this.bindEvt();
        //初始化按钮栏
        this.initToolbar();
	}
	
	Cropper.prototype.bindEvt = function() {
		var _this = this;

		$('.cs-crop-btns').on('click', '[data-method]', function () {
			var $this = $(this);
    		var data = $this.data();

    		if ($this.prop('disabled') || $this.hasClass('disabled')) {
		      	return;
		    }

		    var $img = _this.$img;
		    if ($img && $img.data('cropper') && data.method) {
				data = $.extend({}, data); // Clone a new one

				result = $img.cropper(data.method, data.option/*, data.secondOption*/);
		    }
		});
	}

	Cropper.prototype.initToolbar = function() {
		var _this = this,
			ratio = _this.crop.options.ratio;
		
		$(".cs-crop-btns input[name=aspectRatio]").each(function(){
			var $this = $(this),
				$parent = $(this).parent();
			
			if (ratio == $parent.data("option")) {
				$this.prop("checked");
				$parent.addClass("active");
			}
		});
	}
	
	/* 获取src */
	Cropper.prototype.srcWrap = function(src) {
		var _this = this;
			_this.src = src;

		if ( _this.isBase64Supported ) {
            _this.startCrop();
        } else {
            // 如果不支持base64需要将base64编码传递到后台，后台生成图片文件并返回文件地址.
            $.ajax('', {
                method: 'POST',
                data: {
                	src: src
                },
                dataType:'json'
            }).done(function( response ) {
                if (response.result) {
                	_this.src = response.result;
                    _this.startCrop();
                } else {
                    alert("预览出错");
                }
            });
        }
	}
	
	/* 初始化裁剪 */
	Cropper.prototype.startCrop = function() {
		var _this = this
			src = _this.src;	

		if (_this.active) { //已经初始化过
	        _this.$img.cropper('replace', src);
	      } else {
	    	var options = _this.crop.options;  
	    	
	    	_this.$img = $('<img src="' + src + '">');
	    	$(".cs-crop-wrap").empty().html(_this.$img);
	    	
	    	function initCrop() {
	    		_this.$img.cropper({
	    			aspectRatio: options.ratio,
	    			preview: ".cs-crop-preview",
	    			strict: false,
	    			viewMode: 0,
	    			crop: function (e) {
	    				$("#dataHeight").val(Math.round(e.height));
	    				$("#dataWidth").val(Math.round(e.width));
	    				$("#dataRotate").val(e.rotate);
	    				$("#dataX").val(Math.round(e.x));
	    				$("#dataY").val(Math.round(e.y));
	    				//_this.$avatarData.val(json);
	    				
	    				var imgData = _this.$img.cropper("getImageData");
	    			}
	    		});
	    		
	    		_this.active = true;//初始化完成
	    	}
	    	
	    	//IE下第一次打开时有问题，用一个定时器去处理
	    	if (window.navigator.userAgent.indexOf("MSIE") != -1) {
	    		setTimeout(function(){
	    			initCrop();
	    		}, 500);
	    	} else initCrop();
	      }
	}
	
	return init;
})	