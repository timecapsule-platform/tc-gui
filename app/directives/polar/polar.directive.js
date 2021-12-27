(function(){

	"use strict";
    

angular.module("TIMECAPSULE").directive('polar', polarDirective);

function polarDirective () 
{

    return{
              restrict: 'E',
              scope: {
                         
                    },
              templateUrl: "app/directives/polar/polar.template.html",    
              link: polarLink

          };  
}
    
function polarLink($scope, element, attrs) 
{
    
    $scope.canvas = element[0].querySelector('.chart-canvas');
     
    
    $scope.showChart = function(canvas)
    {

     var options = { responsive: true };	

      
        
     var chartData = [
				{
					value: 300,
					color:"#F7464A",
					highlight: "#FF5A5E",
					label: "Red"
				},
				{
					value: 50,
					color: "#46BFBD",
					highlight: "#5AD3D1",
					label: "Green"
				},
				{
					value: 100,
					color: "#FDB45C",
					highlight: "#FFC870",
					label: "Yellow"
				},
				{
					value: 40,
					color: "#949FB1",
					highlight: "#A8B3C5",
					label: "Grey"
				},
				{
					value: 120,
					color: "#4D5360",
					highlight: "#616774",
					label: "Dark Grey"
				}

			];
        
        
     var context = canvas.getContext("2d");
     var myChart = new Chart(context).PolarArea(chartData,options);

    }
        
    
    $scope.showChart($scope.canvas);
         
}
    
    
})();