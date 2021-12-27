(function () {
   
    'use strict';

    angular.module('TIMECAPSULE').factory('ResourceSource', ResourceSource);

     ResourceSource.$inject = ['$http','Global','Util','ErrorHandler','QueryFactory'];

     function ResourceSource($http, Global, Util, ErrorHandler, QueryFactory)
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
        
         
        
       
        function Get(name)
        {
            // Clear the previous Resource
            Clear();
          
            
            // Get Reference source data
            getReferenceSource(name);
           
            
        }
        
        
        /*********************************************************************************************************/
        /************************************     REFERENCE SOURCE DATA LOAD          **************************************/
        /*********************************************************************************************************/
        
         
        
        function getReferenceSource(name)
        {
            factory.variants = [];
              
            factory.isLoading.source = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?name ?year ?language  ?description ?url  ';
             sparql += 'WHERE { ';
              
             sparql += '?source a ' + Global.ns + 'ReferenceSource. ';
             sparql += '?source ' + Global.ns + 'name ?name. ';
             sparql += '?source ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
             
             sparql += 'OPTIONAL { ?source ' + Global.ns + 'description ?description. }. ';
             sparql += 'OPTIONAL { ?source ' + Global.ns + 'url ?url. }. ';
             sparql += 'OPTIONAL { ?source ' + Global.ns + 'year ?year. }. ';
             sparql += 'OPTIONAL { ?source ' + Global.ns + 'language ?language. }. ';
              
             sparql += ' } '; 
               
             QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   console.log(result);
                factory.isLoading.source = false;  
                
                if(!result.error)
                {   
                    var result = result.results.bindings[0];
                    getSourceAuthors(name);
                    if(result.description)
                    factory.description = result.description.value;
                    if(result.language)
                    factory.language = result.language.value;
                    if(result.year)
                    factory.year = result.year.value;
                    if(result.url)
                    factory.url = result.url.value;
                  
                }
                  
             });
            
            
        }
        
        
        function getSourceAuthors(source)
        {     
  
             factory.authors = [];
            
             var sparql = "";
             
             sparql += 'SELECT DISTINCT ?author ';
             sparql += 'WHERE { ';
              
             sparql += '?source a ' + Global.ns + 'ReferenceSource. ';
             sparql += '?source ' + Global.ns + 'name ?name. ';
             sparql += '?source ' + Global.ns + 'name "'+source+'"^^xsd:string. ';
             
             sparql += '?source ' + Global.ns + 'hasAuthor ?a. ?a ' + Global.ns + 'name ?author.';
  
             sparql += ' } '; 
            
            console.log(sparql);
             

            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                
                console.log(result);
                if(!result.error)
                {   
                     factory.authors = result.results.bindings;
                      
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }

             });
           
            
         }
        
        
          
        
        function init()
        { 
           
        }
        
        
         
         
          

    }
 
})();