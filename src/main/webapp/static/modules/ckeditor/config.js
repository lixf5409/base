/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    
    config.font_names='宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;'+ config.font_names;

    //是否强制复制来的内容去除格式 plugins/pastetext/plugin.js   
    config.forcePasteAsPlainText =false//不去除  
    //是否使用等标签修饰或者代替从word文档中粘贴过来的内容 plugins/pastefromword/plugin.js    
    config.pasteFromWordKeepsStructure = false;  
    //从word中粘贴内容时是否移除格式 plugins/pastefromword/plugin.js  
    config.pasteFromWordIgnoreFontFace = true; //默认为忽略格式
    config.pasteFromWordRemoveStyle = false  
    config.pasteFromWordRemoveFontStyles = false;  
    config.allowedContent = true;
    config.format_p = { element: 'p', attributes: { 'class': 'normalPara' } };
};
