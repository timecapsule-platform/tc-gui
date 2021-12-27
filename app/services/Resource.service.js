(function () {
   
    'use strict';

    angular.module('TIMECAPSULE').factory('Resource', Resource);

     Resource.$inject = ['$http','Global','Util','ErrorHandler', 'ResourcePlant', 'ResourceDrug', 'ResourceSource', 'ResourceReference'];

     function Resource($http, Global, Util, ErrorHandler, ResourcePlant, ResourceDrug, ResourceSource, ResourceReference)
    {

        var factory = {};
 
          
        // The Resource type. One of 'PLANT', 'DRUG', 'VARIANT', 'SOURCE'
        factory.type = null;
        factory.name = null;
        factory.concept = null;
        
        factory.plant = ResourcePlant;
        factory.drug = ResourceDrug;
        factory.source = ResourceSource;
        factory.reference = ResourceReference;
       
        
        factory.Get = Get;
       
      
        
        return factory;
        
        
        
       
        function Get(type,name,concept)
        { 
            factory.type = type;
            factory.name = name;
            factory.concept = concept;
            
              
            console.log("type: ",type," name: ",name, "concept: ",concept);
            
           
            if(type == "PLANT")
            { 
                ResourcePlant.Get(name,concept);
                ResourcePlant.name = name;
            }
            else
            if(type == "DRUG")
            {   
                ResourceDrug.Get(name,concept);
            }
            else
            if(type == "SOURCE")
            {   
                ResourceSource.Get(name);
            }
            else
            if(type == "REFERENCE")
            {   
                ResourceReference.Get(name); // name is actually the url here
            }
            
            
        }
        
        
         
        
        
       
         
          

    }
 
})();