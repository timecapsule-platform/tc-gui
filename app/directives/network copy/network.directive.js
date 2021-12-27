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
                    
                },
                link: networkLink
     
                };

    }
     
    
    function networkLink($scope, element, attrs)
    {   
        var container = element[0].getElementsByClassName('network')[0];
          

        // create an array with nodes
        var nodes = new vis.DataSet([
        {id: 1, label: 'Drug Component', image: 'assets/images/menu-drugs-active.svg', shape: 'image'},
        {id: 2, label: 'Plant Species 1', image: 'assets/images/menu-plants-active.svg', shape: 'image'},
        {id: 3, label: 'Plant Species 2', image: 'assets/images/menu-plants-active.svg', shape: 'image'},
        {id: 4, label: 'Plant Species 3', image: 'assets/images/menu-plants-active.svg', shape: 'image'}
        ]);
 
        // create an array with edges
        var edges = new vis.DataSet([
        {from: 1, to: 2},
        {from: 1, to: 3},
        {from: 1, to: 4}
        ]);

        // create a network
        var data = {
        nodes: nodes,
        edges: edges
        };
        var options = {};
        var network = new vis.Network(container, data, options); 
       
        
    }

})();

 
 