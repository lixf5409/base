/*
 * require配置
 */
require.config({
    paths:{
        //基础模块配置
        "jquery":"static/core/platform/lib/jquery/jquery-2.1.3.min",
        "easyui":"static/core/platform/lib/easyui/jquery.easyui.min",
        "easyui-lang-zh_CN":"static/core/platform/lib/easyui/locale/easyui-lang-zh_CN",
        //"JQuery.validate":"static/core/platform/lib/jquery/plugins/validate/jquery.validate.min",
        //"JQuery.validate.extra":"static/core/platform/lib/jquery/plugins/validate/additional-methods",
        //"JQuery.validate.message":"static/core/platform/lib/jquery/plugins/validate/localization/messages_zh",

        "Bootstrap":"static/core/platform/lib/bootstrap/js/bootstrap.min",
        
        "Angular":"static/core/platform/lib/angular/angular.min.1.2.21", //IE8
        "Angular-ui-router":"static/core/platform/lib/angular/angular-ui-router.min",

        "ZTree":"static/core/platform/lib/zTree/js/jquery.ztree.all-3.5.min",
        "ZTreeExhide":"static/core/platform/lib/zTree/js/jquery.ztree.exhide-3.5.min",
        "LocalZTree":"static/core/platform/lib/util/localZTree/localZTree",
        "WebUploader":"static/core/platform/lib/webuploader/webuploader.min",
        "Cropper":"static/core/platform/lib/cropper/js/cropper",
        "Date":"static/core/platform/lib/bootstrap/plugins/datetimepicker/js/bootstrap-datetimepicker.min",
        "DateCN":"static/core/platform/lib/bootstrap/plugins/datetimepicker/js/datetimepicker.cn",
        "ClockPicker":"static/core/platform/lib/bootstrap/plugins/clockpicker/js/bootstrap-clockpicker.min",
        "Echarts":"static/core/platform/lib/echarts/echarts.common.min",

        "CkPlayer":"static/core/platform/lib/ckplayer6.7/ckplayer/ckplayer",
        "ArtTemplate":"static/core/platform/lib/artTemplate/template",
        "ArtTemplateNative":"static/core/platform/lib/artTemplate/template-native",

        /*第三方模块文件夹*/
        "CMDir":"static/core/platform/lib/codemirror",
        "MCScrollbarDir":"static/core/platform/lib/jquery/plugins/mCustomScrollbar",
        


        /*静态模块路径配置*/
        "PDAppDir":"static/app",
        "PDCoreDir":"static/cor/platform",
        "PDGlobalDir":"static/core/platform/global",
        "PDModuleDir":"static/core/platform/lib",
        "PDUtilDir":"static/core/platform/components/util",
        "PDHomeDir":"static/core/platform/page/home",
        
        //Excel导入
        "ExcelImport":"static/core/platform/lib/util/excel/excelImport",
        "RenewPwd": "static/core/platform/page/home/js/renewPwd",
        

        /*CSS文件路径映射*/
        "ZTreeCss":"static/core/platform/lib/zTree/css/zTreeStyle/csTreeStyle",
        "WebUploaderCss":"static/core/platform/lib/webuploader/css/webuploader",
        "CropperCss":"static/core/platform/lib/cropper/css/cropper.min",
        "DateCss":"static/core/platform/lib/bootstrap/plugins/datetimepicker/css/datetimepicker.min",
        "ClockPickerCss":"static/core/platform/lib/bootstrap/plugins/clockpicker/css/bootstrap-clockpicker.min",

        /*需要动态构建的部分*/
        "jqValidate-build":"static/core/platform/lib/jquery/plugins/validate/jqValidate-build"
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
            'css':"static/core/platform/lib/requirejs/plugin/require-css2/css",
            'text':"static/core/platform/lib/requirejs/plugin/text"
        }
    }
});