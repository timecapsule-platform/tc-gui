(function(){

	"use strict";
    
    angular.module("TIMECAPSULE").directive("clientSelector", clientSelectorDirective);
    
    function clientSelectorDirective()
    {

        return {
                restrict: "E",
                templateUrl: "app/directives/client-selector/client-selector.template.html",
                scope: 
                { 
                    title: "@",
                    dataset: "=",
                    selected: "=",
                    boxText: "@",
                    enabled: "="
                },
                controller: clientSelectorController
     
                };

    }
     
    function clientSelectorController($scope,Util,PopupService)
    {
        $scope.popupUrl = 'app/directives/client-selector/';
        
        $scope.popup = PopupService;
  
        
        $scope.isEnabled = function()
        {
            return $scope.enabled;
        }
        
        $scope.selectItem = function(item)
         {
             $scope.selected = item;
             $scope.popup.selector.close();
         }
        
        $scope.selectedExists = function()
        {
            if($scope.selected)
            {
                return true;
            }
            return false;
        }
        
        $scope.isSelected = function(item)
        {
            if($scope.selectedExists())
            {
                if($scope.selected.id == item.id)
                {
                    return true;
                }
            }
            
            return false;
        }
        
        $scope.showDatasetPopup = function()
        {  
            if($scope.isEnabled())
            {
                $scope.popup.selector = Util.showPopup($scope.popupUrl+'client-selector-popup.html',$scope);
            }
        }
    }
    
     

})();

 
 