(function(){

	"use strict";
    
    angular.module("TIMECAPSULE").directive("createButton", createButtonDirective);
    
    function createButtonDirective()
    {

        return {
                restrict: "E",
                templateUrl: "app/directives/create-button/create-button.template.html"
                };

    }
     
    
})();

 
 