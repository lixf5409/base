/**
 * Created by lenovo on 2014/10/30.
 */
define(function(){
    //subhome.jsp依赖验证组件，而home.jsp不依赖
    /*if(typeof( $.validator)=="function"){
        //自定义密码验证规则
        $.validator.addMethod('PD_password', function (value, element) {
            var len = value.length;
            if(len<6){
                $(element).data('error-msg','长度不能少于6位');
                return false;
            }
            if(len>15){
                $(element).data('error-msg','长度不能大于15位');
                return false;
            }
            return true;
        }, function(params, element) {
            return $(element).data('error-msg');
        });
    }*/
    //项目中的全局配置
    require.config({
        paths : {

        }
    });
});

