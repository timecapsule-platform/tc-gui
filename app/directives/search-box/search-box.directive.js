(function(){

	"use strict";
    
    angular.module("TIMECAPSULE").directive("searchBox", searchBoxDirective);
    
    function searchBoxDirective()
    {

        return {
                restrict: "E",
                templateUrl: "app/directives/search-box/search-box.template.html",
                scope: { searchText: "=", searchLabel: "@" }, 
                controller: searchBoxController
     
                };

    }
     
    
    function searchBoxController($scope)
    {   
        $scope.searchText = "";
        
        if(!$scope.searchLabel || $scope.searchLabel.length === 0)
        {
            $scope.searchLabel = "Search";
        }
        
          
    }

})();

 
 