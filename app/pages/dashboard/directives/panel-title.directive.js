(function(){

	"use strict";
    
    angular.module("TIMECAPSULE").directive("panelTitle", panelTitleDirective);
    
    function panelTitleDirective()
    {

        return {
                restrict: "E",
                templateUrl: "app/pages/dashboard/directives/panel-title.template.html",
                scope: { title: "@" }
                };

    }
     
   

})();

 
 