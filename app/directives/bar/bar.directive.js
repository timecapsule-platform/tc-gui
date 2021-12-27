(function(){

	"use strict";
    

angular.module("TIMECAPSULE").directive('bar', barDirective);

function barDirective () 
{

    return{
              restrict: 'E',
              scope: {
                         
                    },
              templateUrl: "app/directives/bar/bar.template.html",    
              link: barLink

          };  
}
    
function barLink($scope, element, attrs) 
{
    
    $scope.canvas = element[0].querySelector('.chart-canvas');
     
    
    $scope.showChart = function(canvas)
    {

     var options = { responsive: true };	

      
        
      var chartData = {
    labels: ["Plant  1", "Plant  2", "Plant  3", "Plant  4", "Plant  5", "Plant  6", "Plant  7"],
    datasets: [
        {
            label: "My First dataset",
            borderWidth: 1,
            data: [10, 7, 20, 16, 8, 6, 5],
        }
    ]
};
        
        
     var context = canvas.getContext("2d");
     var myChart = new Chart(context).Bar(chartData,options);

    }
        
    
    $scope.showChart($scope.canvas);
         
}
    
    
})();