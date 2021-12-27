(function(){

	"use strict";
    
    angular.module("TIMECAPSULE").directive("notificationBox", notificationBoxDirective);
    
    function notificationBoxDirective()
    {

        return {
                restrict: "E",
                templateUrl: "app/pages/dashboard/directives/notification-box.template.html",
                scope: { box: "=" }
                };

    }
     
   

})();

 
 