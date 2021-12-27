(function(){

	"use strict";
    
    angular.module("TIMECAPSULE").directive("network", networkDirective);
    
    function networkDirective()
    {

        return {
                restrict: "E",
                templateUrl: "app/directives/network/network.template.html",
                scope: 
                { 
                    data : "=",
                    center: "="
                },
                link: networkLink
     
                };

    }
     
    
    function networkLink($scope, element, attrs)
    {   
        var container = element[0].getElementsByClassName('network')[0];
          
        
        var dataset = [ {id: 0, label: $scope.center, image: 'assets/images/menu-plants-active.svg', shape: 'image'} ];
        
        
        for(var i=0;i<$scope.data.length;i++)
        {
            var node = { id: i+1, label: $scope.data[i], image: 'assets/images/menu-drugs-active.svg', shape: 'image'};
            dataset.push(node);
        }
         
        
        // create an array with nodes
        var nodes = new vis.DataSet(dataset);
 
        var edgeDataset = [];
        
        for(var i=0;i<$scope.data.length;i++)
        {
            var edge = { from: 0, to: i+1};
            edgeDataset.push(edge);
        }
        
        // create an array with edges
        var edges = new vis.DataSet(edgeDataset);

        // create a network
        var data = {
        nodes: nodes,
        edges: edges
        };
        var options = { clickToUse: true };
        var network = new vis.Network(container, data, options); 
       
        
    }

})();

 
 