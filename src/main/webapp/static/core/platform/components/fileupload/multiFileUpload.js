define(['WebUploader',
    'PDUtilDir/fileupload/fileUpload',
    'PDUtilDir/alert',
    'PDUtilDir/confirm',
    'css!WebUploaderCss'], function(WebUploader, UploadUtil, Alert, Confirm){

    /**
     * 附件上传控件初始化
     * @param options
     */
    var init = function(options){
        var settings = {
            placeAt: "",                                      //附件上传组件所放位置
            allowDelete: true,                                //是否允许删除文件
            allowPhyDelete: true,                             //允许物理删除
            allowUpload: true,                                //是否允许上传文件
            allowDownload: true,                              //是否允许下载
            allowMC: true,                                    //是否允许秒传
            //renameFile:true,                                 //重命名文件（开启后物理文件会去掉后缀已经文件名被修改）
            fileMiddleDir: "",
            //onUploadedFile:function(file,savedFilesId){},  //上传成功扩展(0.9.7版本弃用，用onUploadSuccess替换)
            //onDeletedFile:function(file,savedFilesId){},
            extendColumn: [],
            onDeleteUploadingFile: function(file){},
            onDeleteSavedFile: function(file){},
            onBeforeFileQueued: function(file){
            	return true;
            },
            onUploadStart: function(file){},
            onUploadError: function(file){},
            onUploadSuccess: function(file){},
            uploadConfig: UploadUtil.getUploadConfig(options), //附件上传配置
            //文件存储路径ID
            fileDirId: ""
        };

        return result(new Upload($.extend(true, settings, options)).render());
    };

    /**
     * 对返回API进行控制
     * @param upload
     */
    function result(upload){
        //从附件行对象中拿到file对象
        var getFile = function(list){
            var arr = [];
            for(var i=0,item; item=list[i++];){
                arr.push(item.file)
            }
            return arr;
        };
        
        //获取待上传附件列表
        var getQueuedFiles = function(){
            return getFile(upload.queuedFiles)
        };
        
        //获取已上传附件列表
        var getSavedFiles = function(){
            return getFile(upload.savedFiles)
        };
        
        //获取已删除上传成功附件列表
        var getDeletedSavedFiles = function(){
            return getFile(upload.deletedSavedFiles)
        };
        
        //获取文件统计信息
        var getStats = function() {
            var result = {
                progressNum: 0,          //正在上传中的附件数量
                queueNum: 0              //待上传的附件数量
            };
            //不允许上传附件时，webUploader对象为null
            if(upload.webUploader){
                var stats = upload.webUploader.getStats();
                result.progressNum = stats.progressNum;
                result.queueNum = upload.queuedFiles.length;
            }
            return result;
        };

        return {
            getStats: getStats,
            getQueuedFiles: getQueuedFiles,
            getSavedFiles: getSavedFiles
            //getDeletedSavedFiles:getDeletedSavedFiles
        }
    }


    /********************************Upload对象**********************************/
    /**
     * 附件上传组件对象
     * @param settings
     */
    function Upload(settings){
        this.webUploader    = null;         //WebUploader对象
        this.queuedFiles    = [];           //待上传文件数组
        this.savedFiles     = [];           //已上传文件数组
        this.deletedSavedFiles = [];          //已删除的上传成功附件
        this.$container     = "";           //整个上传组件DOM对象
        this.$toolbar       = "";           //操作栏DOM对象
        this.$table         = "";           //文件列表DOM对象
        this.$status        = "";           //状态栏DOM对象
        this.settings       = settings;
    }
    /**
     * 渲染附件上传组件
     */
    Upload.prototype.render = function(){
        this.container = $('<div class="cs-upload"></div>');
        //添加附件上传组件到指定位置
        var placeAt     = this.settings.placeAt;
        var $placeAt    = typeof(placeAt) == "string" ? $("#" + placeAt) : $(placeAt);
        $placeAt.append(this.container);
        //允许上传附件时才渲染操作栏
        if(this.settings.allowUpload){
            this.renderToolbar();
            //设置添加按钮
            this.settings.uploadConfig.pick = this.container.find("li:contains('添加')");
            //初始化WebUploader
            this.webUploader = InitUploader(this, this.settings.uploadConfig);
        }
        this.renderContent();
        //状态栏暂未使用
        //this.renderStatus();

        //渲染已上传的附件
        var savedFileIds = this.settings.data;
        if(savedFileIds){
            var files = UploadUtil.getSavedFiles(savedFileIds);
            this.renderSavedFiles(files);
        }

        return this;
    };

    /**
     * 渲染操作栏
     */
    Upload.prototype.renderToolbar = function(){
        var html = '<div class="cs-upload-toolbar">'+
                        '<ul>'+
                            '<li class="first"><a><i class="fa fa-plus-circle">&nbsp;</i>添加</a></li>'+
                            /*'<li><a><i class="glyphicon glyphicon-upload">&nbsp;</i>开始上传</a></li>'+*/
                        '</ul>'+
                    '</div>';
        this.$toolbar = $(html);
        var _this = this;
        //添加上传事件
        var $startUpload = $('<li><a><i class="fa fa-cloud-upload">&nbsp;</i>开始上传</a></li>').bind('click',function(){
            _this.webUploader.upload();
        });
        this.$toolbar.find("ul").append($startUpload);

        //把操作栏添加到上传组件面板中
        this.container.append(this.$toolbar);
    };

    /**
     * 渲染附件列表Table
     */
    Upload.prototype.renderContent = function(){
        var $tr = $('<tr></tr>');
        $tr.append('<td>附件名称</td>');
        $tr.append('<td>大小</td>');
        //扩展字段增加
        for(var i=0,item; item=this.settings.extendColumn[i++];){
            $tr.append('<td>' + item.name + '</td>');
        }
        $tr.append('<td>状态</td>');
        $tr.append('<td>操作</td>');
        this.$table = $('<table class="table table-hover" style="margin-bottom: 0px"></table>').append($tr);
        this.container.append($('<div style="min-height: 70px"></div>').append(this.$table));
    };

    /**
     * 渲染状态栏
     */
    Upload.prototype.renderStatus = function(){
        var html = '<div class="cs-upload-status"></div>';
        this.$status = $(html);
        this.container.append(this.$status);
    };

    /**
     * 设置状态栏内容
     */
    /*Upload.prototype.setStatus = function(msg){
        this.$status.html(msg);
    };*/

    /**
     * 渲染已上传的附件
     * @param ids
     */
    Upload.prototype.renderSavedFiles = function(files){
        var _this = this;
        for(var i=0,file; file=files[i++];){
            _this.savedFiles.push(new FileObj(_this, _this.webUploader, file, true));
        }
    };


    /**
     * 附件控件清空
     */
    /*Upload.prototype.clear = function(){
        this.queuedFiles    = [];
        this.savedFiles     = [];
        this.webUploader.reset();
        this.$table.find("tr").not(":first").remove();
    };*/



    /********************************File对象**********************************/
    /**
     * 文件对象
     * @param upload        文件上传组件对象
     * @param webUploader   Webuploader对象
     * @param file          Webuploader中的file对象，包含文件名称、大小等信息
     * @param saved         标识是新上传还是已上传的文件
     * @constructor
     */
    function FileObj(upload, webUploader, file, saved){
        this.Upload     = upload;               //附件上传组件对象
        this.webUploader = webUploader;          //WebUploader对象
        this.file       = file;                 //Webuploader中的file对象
        this.saved      = saved;                //标识当前文件的状态已上传
        //this.responseData= null;                //文件所对应的后端数据信息
        this.$tr        = "";                   //文件行DOM对象
        this.$status    = "";                   //状态DOM对象
        this.$operation = null;                 //操作DOM对象
        this.$del       = null;
        saved ? this.renderSavedFiles() : this.render();
    }


    /**
     * 渲染文件行
     */
    FileObj.prototype.render = function(){
        var file = this.file;
        var html = '<tr>' +
                        '<td title="' + file.name + '" class="cs-mUpload-filename">' + file.name + '</td>'+
                        '<td>' + WebUploader.Base.formatSize(file.size, 2, ['B', 'K', 'M', 'G', 'TB'] ) + '</td>'+
                    '</tr>';
        this.$tr = $(html);

        //扩展列增加
        var extendInfo  = {};
        for(var i= 0,item;item=this.Upload.settings.extendColumn[i++];){
            var tdValue = item.format(file);
            var $td     = $('<td>'+tdValue+'</td>');
            extendInfo[item.filed]  = tdValue;
            this.$tr.append($td);
        }
        file["extendInfo"] = JSON.stringify(extendInfo);

        var _this       = this;
        //状态栏
        this.$status    = $('<td>待上传</td>');
        this.$tr.append(this.$status);
        //操作栏
        this.$operation = $('<td></td>');
        this.$del       = $('<i class="glyphicon glyphicon-trash"></i>').bind('click',function(){_this.remove()});
        this.$operation.append(this.$del);
        this.$tr.append(this.$operation);

        this.Upload.$table.append(this.$tr);
        //this.Upload.settings.afterRenderFile.apply(this,[this]);
    };
    /**
     * 渲染已经上传的附件，适用于已保存的表单编辑
     */
    FileObj.prototype.renderSavedFiles = function(){
        var file = this.file;
        var href = getControllerPath() + '/DownloadController?attachmentId=' + file.swordFileId + '&fileDirId=' + file.fileDirId;
        var aHtml= '<a href="' + href + '" target="_blank">'+ file.name +'</a>';
        //是否允许下载控制
        if(!this.Upload.settings.allowDownload){
            aHtml = file.name;
        }
        var html = '<tr>'+
                        '<td title="'+file.name+'" class="cs-mUpload-filename">'+aHtml+'</td>'+
                        /*'<td>'+ file.uploadDate +'</td>'+*/
                        '<td>'+ WebUploader.Base.formatSize(file.size, 2, ['B', 'K', 'M', 'G', 'TB'] ) +'</td>'+
                    '</tr>';
        this.$tr = $(html);

        //扩展列增加
        var extendInfo = file.extendInfo;
        if(extendInfo){
            extendInfo = JSON.parse(extendInfo);
            for(var i= 0,item;item=this.Upload.settings.extendColumn[i++];){
                this.$tr.append($("<td></td>").append(extendInfo[item.filed]));
            }
        }

        var _this = this;
        //状态栏
        this.$status = $('<td>已上传</td>');
        this.$tr.append(this.$status);
        //操作栏
        this.$operation = $('<td></td>');
        //已上传附件是否允许删除控制
        if(this.Upload.settings.allowDelete){
            this.$del   = $('<i class="glyphicon glyphicon-trash"></i>').bind('click',function(){_this.remove()});
        }
        this.$operation.append(this.$del);
        this.$tr.append(this.$operation);

        this.Upload.$table.append(this.$tr);
        //this.Upload.settings.afterRenderFile.apply(this,[this]);
    };

    /**
     * 文件删除
     */
    FileObj.prototype.remove = function(){
        if(this.saved){
            //真删除与软删除
            this.Upload.settings.allowPhyDelete ? deletePhyFile(this) : deletePhyFileSuccess(this);
        }else{
            deleteFrontFile(this);
        }
    };

    /**
     * 删除附件的前端UI部分，相关操作封装抽取
     * @param fileObj
     */
    function deleteFrontFile(fileObj){
        var _this = fileObj;

        //删除正在上传中的附件
        if(_this.webUploader.isInProgress()){
            _this.file.swordFileStatus = "cancel";                  //计算MD5时使用
            _this.Upload.settings.onDeleteUploadingFile.apply(_this,[_this.file]);
            //标记文件状态为已取消, 同时将中断文件传输。
            _this.webUploader.cancelFile(_this.file);
        }
        //从待上传队列中移除
        delFileFormList(_this.file.name,_this.Upload.queuedFiles);
        //从已上传队列中移除
        delFileFormList(_this.file.name,_this.Upload.savedFiles);
        //移除附件行UI
        _this.$tr.remove();
        //存在id则认为是本次request请求范围内上传成功的附件，不存在则认为是之前会话上传的附件
        _this.file.id && _this.webUploader.removeFile(_this.file,true);
    }

    /**
     * 删除物理文件
     * @param fileObj
     */
    function deletePhyFile(fileObj){
    	Confirm({
    		message: '是否从服务器中删除该附件?',
    		events: {
    			onConfirm: function(){
        			$.ajax({
                        url: getControllerPath() + "/UploadChunkController/attachment/delFile",
                        dataType: 'json',
                        data: {
                            id: fileObj.file.swordFileId
                        },
                        success: function (response) {
                            if(response.success){
                                deletePhyFileSuccess(fileObj);
                            }else{
                                Alert({
                                	message: '删除失败'
                                });
                            }
                        }
                    });
        		}
    		}
    	});
    }

    /**
     * 物理文件删除成功后调用
     * @param FileObj
     */
    function deletePhyFileSuccess(FileObj){
        var _this = FileObj;
        //附件删除Web相关操作
        deleteFrontFile(_this);
        //已上传的文件删除时，调用回调
        _this.Upload.settings.onDeleteSavedFile.apply(_this,[_this.file]);
        //把附件行对象放入已删除数组中
        if(!checkFileFormSavedList(_this.file.swordFileId,_this.Upload.deletedSavedFiles)){
            _this.Upload.deletedSavedFiles.push(_this);
        }
    }


    /********************************WebUploader相关**********************************/
    var InitUploader = function(Upload, config) {
        var _FileObj = FileObj;
        //开启断点续传
        if(config.chunked == true){
            UploadUtil.register(Upload);
        }
        var uploader = WebUploader.create(config);

        //当文件被加入队列以后触发。
        uploader.on('beforeFileQueued', function (file) {
            //判断是否在待上传列表中
            if(getFileFromList(file.name, Upload.savedFiles)){
                Alert({
                	message: '<code>' + file.name + '</code>已经上传'
                });
                return false;
            }

            var result = Upload.settings.onBeforeFileQueued.apply(Upload, [file]);
            return result;
        });
        /**
         * 当一批文件添加进队列以后触发。
         */
        uploader.on( 'filesQueued', function( files ) {
            //判断待上传列表中是否已经存在相同的待上传附件
            var queuedFiles = Upload.queuedFiles;
            for(var i= 0,file;file=files[i++];){
                var FileObj =  new _FileObj(Upload, uploader, file);
                queuedFiles.push(FileObj);

                //公共事件部分判断是否来自于附件上传组件
                file.isUploadComponent = true;
            }
        });
        /**
         * 附件上传数据发送之前触发
         */
        uploader.on('uploadBeforeSend', function(object,data,headers) {
            data["chunkSize"]   = this.options.chunkSize;               //发送每片大小到后端
            data["md5"]         = object.file.swordFileMd5;             //文件MD5
            data["filePath"]    = object.file.swordFilePath;            //文件路径
            data["attachmentId"]= object.file.swordFileId;        //文件ID
            data["fileDirId"]   = object.file.fileDirId;
        });
        /**
         * 当开始上传流程时触发。
         */
        uploader.on( 'uploadStart', function( file ) {
            //找到当前待上传文件对象
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            var progress = '<div class="progress">'+
                                '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 3em;">'+
                                    '0%'+
                                '</div>'+
                            '</div>';
            queuedFile.$status.empty().append(progress);
            file.swordProgress  = queuedFile.$status.find('div[class="progress-bar"]');
            Upload.settings.onUploadStart.apply(Upload,[file]);
        });
        
        /**
         * 上传过程中触发，携带上传进度。
         */
        uploader.on( 'uploadProgress', function(file, percentage) {
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            queuedFile.$status.find('div[class="progress-bar"]').css('width', percentage*95+5 +'%').html((percentage*95+5).toFixed(2) +'%');
        });
        
        /**
         * 当文件上传出错时触发。
         */
        uploader.on( 'uploadError', function( file, reason ) {
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            queuedFile && queuedFile.$status.empty().append('上传失败');
            Upload.settings.onUploadError.apply(Upload,[file]);
        });
        
        /**
         * 当文件上传成功时触发。
         */
        uploader.on( 'uploadSuccess', function( file, response ) {
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            //保存后端返回的数据
            //queuedFile.responseData = response;
            //添加到已上传列表中
            Upload.savedFiles.push(queuedFile);
            //从待上传中删除
            delFileFormList(file.name, Upload.queuedFiles);

            //设置成功状态
            queuedFile.$status.empty().append('已上传');
            queuedFile.saved = true;

            //设置下载链接
            var $a = $('<a></a>')
                .attr('href',getControllerPath()+'/DownloadController?attachmentId='+file.swordFileId+'&fileDirId='+ file.fileDirId)
                .attr('title',file.name);
            var $td = queuedFile.$tr.find("td:first");
            $td.empty().append($a.text(file.name));

            //全部上传完成回调
            //var savedFilesId = getSavedFilesId(Upload.savedFiles);
            //Upload.settings.onUploadedFile.apply(Upload,[file,savedFilesId]);
            Upload.settings.onUploadSuccess.apply(Upload,[file]);
        });
        
        /**
         * 不管成功或者失败，文件上传完成时触发。
         */
        uploader.on('uploadComplete',function(file){

        });

        uploader.on('error', function(errorType, file){
            if(file.size == 0){
                Alert({
                	message: '不能上传大小为0的文件<code>' + file.name + '</code>'
                });
            }
        });

        return uploader;
    };

    /********************************内部私有工具方法**********************************/
    /**
     * 根据文件名从指定的数组中找出文件对象
     * @param fileName
     * @param list
     * @returns fileObj
     */
    function getFileFromList(fileName, list) {
        var tmp = null;
        $(list).each(function(index,entry){
            if( entry.file.name.toLowerCase() === fileName.toLowerCase() ) {
                tmp = entry;
            }
        });
        return tmp;
    }


    /**
     * 根据文件名从指定的数组中删除文件对象
     * @param fileName
     * @param list
     */
    function delFileFormList(fileName, list){
        $(list).each(function(index,entry){
            if( entry.file.name.toLowerCase() === fileName.toLowerCase() ) {
                list.splice(index, 1);
                return false;
            }
        });
    }


    function getSavedFilesId(savedFiles){
        var savedFilesId = [];
        for(var i= 0,fileObj;fileObj=savedFiles[i++];){
            savedFilesId.push(fileObj.file.swordFileId);
        }
        return savedFilesId;
    }

    function checkFileFormSavedList(id,list){
        for(var i= 0,item;item=list[i++];){
            if(item.file.swordFileId==id){
                return true
            }
        }
        return false;
    }
    
    /**
     // 对Date的扩展，将 Date 转化为指定格式的String
     // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     // 例子：
     // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
     // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
     * @param fmt
     * @returns {*}
     * @constructor
     */
    /*Date.prototype.format = function(fmt)
    {
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    };
*/
    return {
        init: init
    }
});