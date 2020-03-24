define(['jquery', 'PDUtilDir/dialog'], function($, Dialog){
	
/**
	config
	var config = {
		title: '',
		message: '',
		events: {}
	}
	
	events
	var events = {
		positiveCallback: null,
		negativeCallback: null,
		onConfirm: null,
		onCancel: null,
		afterClose: null
	}
*/
	
	function init(config){
		var confirm = new Confirm(config);
		
		return confirm;
	}
	
	function Confirm(config){
		var defaultConfig = {
			title: '系统信息',
			message: '',
			events: {
				onConfirm: null,
				onCancel: null
			}
		};
		
		var c = $.extend(true, defaultConfig, config);
		
		Confirm.render(c);
	}
	
	Confirm.render = function(config){
		//是否点击过“确认”
		var confirmFlag = false;
		var dialog = Dialog({
			id: 'system_dialog_confirm',
			title: config.title ? config.title : '提示信息',
			modal: {
				backdrop: 'static',
				show: true
			},
			body: config.message,
			dialogSize: 'modal-sm',
			zIndex: 1150,
			defaultClose: false,
			afterClose: function(){
				if(!confirmFlag){
					var afterClose = config.events.afterClose;
					typeof afterClose == 'function' && afterClose();
				}
				confirmFlag = false;
			},
			buttons: [{
				name: '是',
				close: true,
				callback: function(){
					confirmFlag = true;
					var onConfirm = config.events.onConfirm;
					typeof onConfirm == 'function' && onConfirm();
				}
			},{
				name: '否',
				close: true,
				callback: function(){
					confirmFlag = true;
					var onCancel = config.events.onCancel;
					typeof onCancel == 'function' && onCancel();
				}
			}]
		});
		
		var $dialog = dialog.$getDialog();
		$dialog.css({
			'margin-top': '13%'
		});
		$dialog.find('.modal-footer').css({
			'padding': '5px 20px'
		});
		$dialog.find('.modal-footer .btn').css({
			'padding': '2px 5px'
		});
		dialog.show();
	}
	
	return init;
});