define(['jquery', 'PDUtilDir/dialog'], function($, Dialog){

/**
	options
	var options = {
		dialogSize: '',
		message: '',
		title: '',
		events: {}
	};
	
	events
	var events = {
		afterClose: null
	};
*/	
	
	function init(config){
		var alert = new Alert(config);
		
		return alert;
	};
	
	function Alert(config){
		var defaultConfig = {
			dialogSize: '',
			title: '系统信息',
			message: '',
			events: {
				afterClose: null
			}
		};
		
		var c = $.extend(true, defaultConfig, config);
		
		//设置宽高
		if(c.dialogSize == 'L'){
			c.dialogSize == 'modal-lg';
		}else if(c.dialogSize == 'M'){
			c.dialogSize == 'modal-md';
		}else if(c.dialogSize == 'S'){
			c.dialogSize == 'modal-sm';
		}
		
		Alert.render(c);
	}

	Alert.render = function(config){
		var dialog = Dialog({
			id: 'system_dialog_alert',
			title: config.title ? config.title : '系统信息',
			modal: {
				backdrop: 'static',
				show: true
			},
			body: '<div style="min-height: 30px;word-wrap: break-word;">' + config.message + '</div>',
			dialogSize: config.dialogSize || 'modal-sm',
			zIndex: 1150,
			afterClose: function(){
				var afterClose = config.events.afterClose;
				typeof afterClose == 'function' && afterClose();
			}
		});
		
		var $dialog = dialog.$getDialog();
		$dialog.css({
			'margin-top': '13%'
		});
		dialog.show();
	}
	
	return init;
});