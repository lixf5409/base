/**
 * Created by gzy on 2017/5/9.
 * 导入excel的时候，对其验证，导入的是单个文件。 验证内容:
 * 1、不能为空 ,
 * 2、后缀要求是.xls  ,
 */

define(["jquery","PDUtilDir/util"],function($,util){
    /*
    * 参数： excel 的选择器
    * 返回值： true : 验证通过
    * */
    var validate = function(excelSelector){
        var res=true;
        var files=document.querySelector(excelSelector).files;
        if(files){
            if(files.length ==0){
                util.alert("上传前请先选择文件!");
                res=false;
            }else if(!/\.xls$/.test(files[0].name)){
                util.alert("文件格式不正确，请选择.xls文件!");
                res=false;
            }
        }else{
            util.alert("上传前请先选择文件!");
            res=false;
        }
        return res;
    }

    return {
        validate:validate
    }
})
