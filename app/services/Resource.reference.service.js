(function () {
   
    'use strict';

    angular.module('TIMECAPSULE').factory('ResourceReference', ResourceReference);

     ResourceReference.$inject = ['$http','Global','Util','ErrorHandler','QueryFactory'];

     function ResourceReference($http, Global, Util, ErrorHandler, QueryFactory)
    {

        var factory = {};
 
         
         // All loading elements
         factory.isLoading =
         {
             source: false,
         };
         
        factory.name = null;
 
        
        factory.qf = QueryFactory;
        
        
        factory.description = null;
        factory.language = null;
        factory.year = null;
        factory.author = null;
        factory.url = null;
       
        
        factory.Get =  Get;
        factory.Clear =  Clear;
   
        
        factory.init = init;
         
        
        return factory;
        
        
        
        function Clear()
        {  
            factory.description = null;
            factory.language = null;
            factory.year = null;
            factory.author = null;
            factory.url = null;
        }
        
         
        
       
        function Get(uri)
        {
            // Clear the previous Resource
            Clear();
          
            
            // Get Reference source data
            getReferenceData(uri);
           
            
        }
        
        
        /*********************************************************************************************************/
        /************************************     REFERENCE SOURCE DATA LOAD          **************************************/
        /*********************************************************************************************************/
        
         
        
        function getReferenceData(uri)
        {
             
              
            factory.isLoading.source = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?nameVariant  ';
             sparql += 'WHERE { ';
              
             sparql += Global.ns + 'snPlantReference_2fd2c9ba-81a8-41d2-950d-b6fbf9aa3fd3 ' + Global.ns + 'refersTo ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?nameVariant. ';
             
               
  
             sparql += ' } '; 
               console.log(sparql);
             QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   console.log(result);
                factory.isLoading.source = false;  
                
                if(!result.error)
                {   
                    var result = result.results.bindings[0];
                  
                }
                  
             });
            
            
        }
        
         
          
        
        function init()
        { 
           
        }
        
        
         
         
          

    }
 
})();