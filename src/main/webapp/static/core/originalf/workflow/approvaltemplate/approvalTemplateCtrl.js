define(["jquery"],function($){

    return function($compile,$scope){
        require(["static/core/originalf/workflow/approvaltemplate/approvalTemplateSupport"],function(approvalTemplate){
            approvalTemplate.init();
        });
    };
});