/*
 * require配置
 */
require.config({
    paths:{
        //基础模块配置
        "jquery":"static/modules/jquery/jquery-2.1.3.min",
        "easyui":"static/modules/easyui/jquery.easyui.min",
        "easyui-lang-zh_CN":"static/modules/easyui/locale/easyui-lang-zh_CN",
        //"JQuery.validate":"static/modules/jquery/plugins/validate/jquery.validate.min",
        //"JQuery.validate.extra":"static/modules/jquery/plugins/validate/additional-methods",
        //"JQuery.validate.message":"static/modules/jquery/plugins/validate/localization/messages_zh",

        "Bootstrap":"static/modules/bootstrap/js/bootstrap.min",
        
        "Angular":"static/modules/angular/angular.min.1.2.21", //IE8
        "Angular-ui-router":"static/modules/angular/angular-ui-router.min",

        "ZTree":"static/modules/zTree/js/jquery.ztree.all-3.5.min",
        "ZTreeExhide":"static/modules/zTree/js/jquery.ztree.exhide-3.5.min",
        "LocalZTree":"static/modules/util/localZTree/localZTree",
        "WebUploader":"static/modules/webuploader/webuploader.min",
        "Cropper":"static/modules/cropper/js/cropper",
        "Date":"static/modules/bootstrap/plugins/datetimepicker/js/bootstrap-datetimepicker.min",
        "DateCN":"static/modules/bootstrap/plugins/datetimepicker/js/datetimepicker.cn",
        "ClockPicker":"static/modules/bootstrap/plugins/clockpicker/js/bootstrap-clockpicker.min",
        "Echarts":"static/modules/echarts/echarts.common.min",

        "CkPlayer":"static/modules/ckplayer6.7/ckplayer/ckplayer",
        "ArtTemplate":"static/modules/artTemplate/template",
        "ArtTemplateNative":"static/modules/artTemplate/template-native",

        /*第三方模块文件夹*/
        "CMDir":"static/modules/codemirror",
        "MCScrollbarDir":"static/modules/jquery/plugins/mCustomScrollbar",
        


        /*静态模块路径配置*/
        "PDAppDir":"static/app",
        "PDCoreDir":"static/core",
        "PDGlobalDir":"static/global",
        "PDUtilDir":"static/modules/util",
        "PDModuleDir":"static/modules",
        "PDHomeDir":"static/core/page/home",
        
        //Excel导入
        "ExcelImport":"static/modules/util/excel/excelImport",
        "RenewPwd": "static/core/page/home/js/renewPwd",
        

        /*CSS文件路径映射*/
        "ZTreeCss":"static/modules/zTree/css/zTreeStyle/csTreeStyle",
        "WebUploaderCss":"static/modules/webuploader/css/webuploader",
        "CropperCss":"static/modules/cropper/css/cropper.min",
        "DateCss":"static/modules/bootstrap/plugins/datetimepicker/css/datetimepicker.min",
        "ClockPickerCss":"static/modules/bootstrap/plugins/clockpicker/css/bootstrap-clockpicker.min",

        /*需要动态构建的部分*/
        "jqValidate-build":"static/modules/jquery/plugins/validate/jqValidate-build"
    },
    shim:{
        "Bootstrap":["jquery"],
        "Angular":{"exports":"angular"},
        "Angular-ui-router":["Angular"],
        "ZTree":["jquery"],
        "DateCN":["Date"],
        //"JQuery.validate.extra":["JQuery.validate"],
        //"JQuery.validate.message":["JQuery.validate"],
        "Uploader":["WebUploader"],
        "ZTreeExhide":["ZTree"]
    },
    //urlArgs:"v=0.9.2",
    map:{
        '*':{
            'css':"static/modules/requirejs/plugin/require-css2/css",
            'text':"static/modules/requirejs/plugin/text"
        }
    }
});