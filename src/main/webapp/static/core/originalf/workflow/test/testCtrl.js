define(["jquery"],function($){

    return function($compile,$scope){
        require(["static/core/originalf/workflow/test/testSupport"],function(testSupport){
            testSupport.init();
        });
    };
});