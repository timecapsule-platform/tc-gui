(function(){

	"use strict";
    

angular.module("TIMECAPSULE").directive('progressBarSmall', progressBarSmallDirective);

function progressBarSmallDirective () 
{

    return{
              restrict: 'E',
              scope: {
                        curVal: '@',
                        maxVal: '@'
                    },
              templateUrl: "app/directives/progress-bar/progress-bar-small.view.html",    
              link: progressBarSmallLink

          };  
}
    
function progressBarSmallLink($scope, element, attrs) 
{
        
    function updateProgress()
    {  
      var progress = 0;

      if ($scope.maxVal) 
      {
        progress = Math.min($scope.curVal, $scope.maxVal) / $scope.maxVal * element[0].querySelector('.progress-bar-small').clientWidth;
      }

      element[0].querySelector('.progress-bar-bar-small').style.width = progress +"px";    
     
    }

    $scope.$watch('curVal', updateProgress);
    $scope.$watch('maxVal', updateProgress);        
}
    
    
})();