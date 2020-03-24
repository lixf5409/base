define(["jquery"],function(){
    window["NTKO"] = {};
    var PATH = getServer()+"/static/modules/util/ntko/resource";

    NTKO["load"] = function(param){
        $("#NTKOOfficeDiv").append(NTKO.getNTKOObject("TANGER_OCX"));
        NTKO['Params'] = $.extend({
            Statusbar:true,
            ToolBars:true,
            Menubar:true,
            TitleBar:true
        },param);
    };

    //该方法不仅用于NTKO文档控件，还用于附件上传在线预览附件功能
    NTKO["getNTKOObject"] = function(id){
        var ua = navigator.userAgent.toLowerCase(),result;
        (ua.match(/msie ([\d.]+)/) || ua.match(/trident\/([\d.]+)/)) ? result=LoadNTKOInIE(id) :
            (ua.match(/firefox\/([\d.]+)/)) ? result=LoadNTKOInFirefox(id) :
                (ua.match(/chrome\/([\d.]+)/)) ? result=LoadNTKOInChrome(id) :
                    (ua.match(/opera.([\d.]+)/)) ? alert("NTKO文档控件不支持Opera浏览器！") :
                        (ua.match(/version\/([\d.]+).*safari/)) ? alert("NTKO文档控件不支持Safari浏览器！") : 0;
        return result;
    };

    NTKO["init"] = function(){
        //如果已经加载则不再重新加载，避免来回切换页签多次加载
        if(this.TANGER_OCX) return;

        var param = this.Params;
        NTKO["TANGER_OCX"] = document.getElementById("TANGER_OCX");
        this.TANGER_OCX.height = "600px";
        this.TANGER_OCX.width = "100%";
        this.TANGER_OCX.AddDocTypePlugin(".pdf","PDF.NtkoDocument","4.0.0.0",PATH+"/ntkooledocall.cab",51,true);
        //如果不存在附件word，则打开默认文档
        if(param.url){
            this.TANGER_OCX.OpenFromURL("/"+param.attachDBPath+"/0/"+param.UNID+"/$File/TANGER_OCX_Attachment.doc")
        }else{
            this.TANGER_OCX.CreateNew("word.document")
           // param.defaultTempURL ? ( this.TANGER_OCX.CreateNew("word.document")):(this.TANGER_OCX.OpenFromURL(param.DefaultTempURL))
        }
        //NTKO Word界面控制
        this.TANGER_OCX.Statusbar	= param.Statusbar;
        this.TANGER_OCX.ToolBars	= param.ToolBars;
        this.TANGER_OCX.Menubar	    = param.Menubar;
        this.TANGER_OCX.TitleBar	= param.TitleBar;
        this.TANGER_OCX.IsNoCopy	= param.IsNoCopy;
        this.TANGER_OCX.IsStrictNoCopy	= param.IsStrictNoCopy;
        //this.SetReadOnly(param.ReadOnly);

        var NTKOForm = '<form id="NTKOForm" style="display:none"><input type="file" name="FileNTKO"></input></form>';
        $(document.forms[0]).after(NTKOForm);
    };

    //IE下加载NTKO文档控件的方法
    function LoadNTKOInIE(id){
        var arr = [];
        arr.push('<!-- 用来产生编辑状态的ActiveX控件的JS脚本-->   ');
        arr.push('<!-- 因为微软的ActiveX新机制，需要一个外部引入的js-->   ');
        arr.push('<object id="'+id+'" classid="clsid:C9BC4DFF-4248-4a3c-8A49-63A7D317F404" ');
        arr.push('codebase="'+ PATH +'/OfficeControl.cab#version=5,0,2,4" >');
        arr.push('<param name="IsUseUTF8URL" value="-1">   ');
        arr.push('<param name="IsUseUTF8Data" value="-1">   ');
        arr.push('<param name="BorderStyle" value="1">   ');
        arr.push('<param name="BorderColor" value="14402205">   ');
        arr.push('<param name="TitlebarColor" value="15658734">   ');
        arr.push('<param name="TitlebarTextColor" value="0">   ');
        arr.push('<param name="MenubarColor" value="14402205">   ');
        arr.push('<param name="MenuButtonColor" VALUE="16180947">   ');
        arr.push('<param name="MenuBarStyle" value="3">   ');
        arr.push('<param name="MenuButtonStyle" value="7">   ');
        arr.push('<param name="WebUserName" value="NTKO">   ');
        arr.push('<param name="MakerCaption" value="北京鼎捷软件有限公司">');
        arr.push('<param name="MakerKey" value="5106AC5F0DC9DE31D90867FA53FCFF08FBD30014">');
        arr.push('<param name="ProductCaption" value="北京发那科机电有限公司">');
        arr.push('<param name="ProductKey" value="8E58FA3B280F1F6FC66390298DB52A6B628D060B">');
        arr.push('<param name="Caption" value="NTKO OFFICE文档控件">   ');
        arr.push('<SPAN STYLE="color:red">不能装载文档控件。请在检查浏览器的选项中检查浏览器的安全设置。</SPAN>   ');
        arr.push('</object>');
        return arr.join("");
    }

    //Firefox下加载NTKO文档控件的方法
    function LoadNTKOInFirefox(id){
        var arr = [];
        arr.push('<object id="'+id+'" type="application/ntko-plug"  codebase="'+ PATH +'/OfficeControl.cab#version=5,0,2,4" ');
        arr.push('ForOnpublishAshtmltourl="publishashtml"');
        arr.push('ForOnpublishAspdftourl="publishaspdf"');
        arr.push('ForOnSaveAsOtherFormatToUrl="saveasotherurl"');
        arr.push('ForOnDoWebGet="dowebget"');
        arr.push('ForOnDoWebExecute="webExecute"');
        arr.push('ForOnDoWebExecute2="webExecute2"');
        arr.push('ForOnFileCommand="FileCommand"');
        arr.push('ForOnCustomMenuCmd2="CustomMenuCmd"');
        arr.push('_IsUseUTF8URL="-1"   ');
        arr.push('_IsUseUTF8Data="-1"   ');
        arr.push('_BorderStyle="1"   ');
        arr.push('_BorderColor="14402205"   ');
        arr.push('_MenubarColor="14402205"   ');
        arr.push('_MenuButtonColor="16180947"   ');
        arr.push('_MenuBarStyle="3"  ');
        arr.push('_MenuButtonStyle="7"   ');
        arr.push('_WebUserName="NTKO"   ');
        arr.push('clsid="{C9BC4DFF-4248-4a3c-8A49-63A7D317F404}" >');
        arr.push('<param name="MakerCaption" value="北京鼎捷软件有限公司">');
        arr.push('<param name="MakerKey" value="5106AC5F0DC9DE31D90867FA53FCFF08FBD30014">');
        arr.push('<param name="ProductCaption" value="北京发那科机电有限公司">');
        arr.push('<param name="ProductKey" value="8E58FA3B280F1F6FC66390298DB52A6B628D060B">');
        arr.push('<param name="Caption" value="NTKO OFFICE文档控件">   ');
        arr.push('<SPAN STYLE="color:red">尚未安装NTKO Web FireFox跨浏览器插件。请点击<a href="'+ PATH +'/NtkoCrossBrowserSetup.msi">安装组件</a></SPAN>   ');
        arr.push('</object>');
        return arr.join("");
    }

    //Chrome下加载NTKO文档控件的方法
    function LoadNTKOInChrome(id){
        var arr = [];
        arr.push('<object id="'+id+'" clsid="{C9BC4DFF-4248-4a3c-8A49-63A7D317F404}"  ForOnSaveToURL="OnComplete2" ForOnBeginOpenFromURL="OnComplete" ForOndocumentopened="OnComplete3"');
        arr.push('ForOnpublishAshtmltourl="publishashtml"');
        arr.push('ForOnpublishAspdftourl="publishaspdf"');
        arr.push('ForOnSaveAsOtherFormatToUrl="saveasotherurl"');
        arr.push('ForOnDoWebGet="dowebget"');
        arr.push('ForOnDoWebExecute="webExecute"');
        arr.push('ForOnDoWebExecute2="webExecute2"');
        arr.push('ForOnFileCommand="FileCommand"');
        arr.push('ForOnCustomMenuCmd2="CustomMenuCmd"');
        arr.push('codebase="'+ PATH +'/OfficeControl.cab#version=5,0,2,4" type="application/ntko-plug" ');
        arr.push('_IsUseUTF8URL="-1"   ');
        arr.push('_IsUseUTF8Data="-1"   ');
        arr.push('_MakerCaption="北京鼎捷软件有限公司" ');
        arr.push('_MakerKey="5106AC5F0DC9DE31D90867FA53FCFF08FBD30014" ');
        arr.push('_ProductCaption="北京发那科机电有限公司"  ');
        arr.push('_ProductKey="8E58FA3B280F1F6FC66390298DB52A6B628D060B"  ');
        arr.push('_BorderStyle="1"   ');
        arr.push('_BorderColor="14402205"   ');
        arr.push('_MenubarColor="14402205"   ');
        arr.push('_MenuButtonColor="16180947"   ');
        arr.push('_MenuBarStyle="3"  ');
        arr.push('_MenuButtonStyle="7"   ');
        arr.push('_WebUserName="NTKO"   ');
        arr.push('_Caption="NTKO OFFICE文档控件">');
        arr.push('<SPAN STYLE="color:red">尚未安装NTKO Web Chrome跨浏览器插件。请点击<a href="'+ PATH +'/NtkoCrossBrowserSetup.msi">安装组件</a></SPAN>   ');
        arr.push('</object>');
        return arr.join("");
    }

    //NTKO保存
    NTKO["SaveToURL"] = function(){
        var param = [];
        param.push("attachDocKey="+this.Params.attachDocKey);		//当前文档与对应附件文档关联KEY
        param.push("attachDBPath="+this.Params.attachDBPath);		//附件库路径

        var URL = "/Produce/DigiFlowFileUpload.nsf/NTKOUploadXAgent.xsp"+"?"+param.join("&");
        var result = this.TANGER_OCX.SaveToURL(URL,"FileNTKO","","TANGER_OCX_Attachment.doc","NTKOForm");
        //alert("=="+result+"==")
        //console.log("=="+result+"==")
        if(result=="0"){alert("正文保存失败，请联系管理员！")}
        return result=="0" ? false : true;
    };

    /**
     * 设置是否只读
     * 调用自带的SetReadOnly方法内容无法复制
     * Param: true|false
     */
    NTKO["setReadOnly"] = function (bool)
    {
        try{
            if(typeof(bool)!="boolean"){
                ((bool=="null" || bool=="undefined"))? (bool=false) : (bool=Boolean(bool));
            }
            var docType = this.TANGER_OCX.DocType;
            //word
            if(docType==1){
                var pType = this.TANGER_OCX.ActiveDocument.ProtectionType;
                if(pType!=-1 && !bool) this.TANGER_OCX.ActiveDocument.Unprotect();
                if(pType==-1 && bool) this.TANGER_OCX.ActiveDocument.Protect(3,false,"");
            }
            //excel
            /*if(docType==2){
             var app = this.TANGER_OCX.ActiveDocument.Application;
             for(var i=1;i<app.Sheets.Count;i++){
             boolvalue ? app.Sheets(i).Protect("",true,true,true) : app.Sheets(i).Unprotect("");
             }
             boolvalue ? app.ActiveWorkbook.Protect("",true) : app.ActiveWorkbook.Unprotect("");
             }*/
        }catch (e) {
        }
    }
});