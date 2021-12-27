(function () {
   
    'use strict';

    angular.module('TIMECAPSULE').factory('ResourceDrug', ResourceDrug);

     ResourceDrug.$inject = ['$http','Global','Util','ErrorHandler','QueryFactory'];

     function ResourceDrug($http, Global, Util, ErrorHandler, QueryFactory)
    {

        var factory = {};
 
         
         // All loading elements
         factory.isLoading =
         {
             page: false,
             create: false,
             edit: false,
             delete: false,
             dbpedia: false,
             variants: false,
             pDrugs: false,
             sources: false,
             references: false,
             uses: false
         };
         
        factory.name = null;
        factory.concept = null;
        
        factory.qf = QueryFactory;
        
        
        factory.references = [];
        factory.variants = [];
        factory.plants = [];
        factory.drugs = [];
        factory.sources = [];
        
        
        factory.Get =  Get;
        factory.Clear =  Clear;
   
        
        factory.init = init;
         
        
        return factory;
        
        
        
        function Clear()
        {
           
            factory.references = [];
            factory.variants = [];
            factory.plants = [];
            factory.drugs = [];
            factory.sources = [];
        }
        
         
        
       
        function Get(name,concept)
        {
            // Clear the previous Resource
            Clear();
          
            
            // Get References
            getReferences(concept);
             
            // Load the name variants
            getNameVariants(concept);

            // Load all plants produced by the drug.
            getDrugPlants(concept);

            // Load all reference sources that mention the drug 
            getSources(concept);

            // Load all drug uses
            getUses(concept);

            // Load all drug locations
            // getLocations(concept);
              
            
        }
        
        
        /*********************************************************************************************************/
        /************************************     DRUG DATA LOAD          **************************************/
        /*********************************************************************************************************/
        
        
        
        //////////////////////////////////   NAME VARIANTS  /////////////////////////////////////
        
        function getNameVariants(concept)
        {
            factory.variants = [];
              
            factory.isLoading.variants = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?name  ';
             sparql += 'WHERE { ';
             sparql += '?d a ' + Global.ns + 'DrugComponent. ';
             sparql += '?d  ' + Global.ns + 'name "'+concept+'"^^xsd:string. ';
             sparql += '?d ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
              
             sparql += ' } ORDER BY ASC(?name) '; 
               
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                factory.isLoading.variants = false;  
                
                if(!result.error)
                {   
                    var variants = result.results.bindings;
                 
                    for(var i=0;i<variants.length;i++)
                    {  
                        factory.variants.push(variants[i].name.value);    
                    }
                  
                }
                  
             });
            
            
        }
        
        
        //////////////////////////////////   PLANT DRUGS  /////////////////////////////////////
        
        function getDrugPlants(concept)
        {
            factory.drugs = [];
              
            factory.isLoading.pDrugs = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?plantName  ?plantVariant ';
             sparql += 'WHERE { ';
             sparql += '?d a ' + Global.ns + 'DrugComponent. ';
             sparql += '?d  ' + Global.ns + 'name "'+concept+'"^^xsd:string. ';
             sparql += '?d ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             
             sparql += ' ?reference ' + Global.ns + 'referredToBeProducedBy ?plantReference.';
             sparql += ' ?plantReference ' + Global.ns + 'refersTo ?plantNameVariant.';
             sparql += ' ?plantNameVariant ' + Global.ns + 'nameVariant ?plantVariant.';
             sparql += ' ?plant ' + Global.ns + 'hasNameVariant ?plantNameVariant.';
             sparql += ' ?plant ' + Global.ns + 'name ?plantName.';
              
             sparql += ' } ORDER BY ASC(?plantName) '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                factory.isLoading.pDrugs = false;  
                
                if(!result.error)
                {   
                    var references = result.results.bindings;
                     
                    for(var i=0;i<references.length;i++)
                    {
                        if(references[i].plantVariant)
                        {
                            var plant = 
                            { 
                                name: references[i].plantName.value, 
                                variants : []
                            };

                            var variant = references[i].plantVariant.value;

                            var index = Util.conceptExists(factory.plants,plant);

                            if(index == -1)
                            {
                                 plant.variants.push(variant);
                                 factory.plants.push(plant);
                            }
                            else
                            {
                                if(!Util.exists(factory.plants[index].variants,variant))
                                {
                                    factory.plants[index].variants.push(variant);
                                }
                            }
                        }
                    }
                  
                }
                  
             });
        }
        
        
        
         
         //////////////////////////////////   SOURCES  /////////////////////////////////////
        
         function getSources(concept)
        {
            factory.sources = [];
              
            factory.isLoading.sources = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?sourceName ';
             sparql += 'WHERE { ';
             sparql += '?d a ' + Global.ns + 'DrugComponent. ';
             sparql += '?d  ' + Global.ns + 'name "'+concept+'"^^xsd:string. ';
             sparql += '?d ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             
             sparql += ' ?source ' + Global.ns + 'hasReference ?reference.';
             sparql += ' ?source ' + Global.ns + 'name ?sourceName.';
               
             sparql += ' } ORDER BY ASC(?sourceName) ';  
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                factory.isLoading.sources = false;  
                
                if(!result.error)
                {   
                    var references = result.results.bindings;
                     
                    for(var i=0;i<references.length;i++)
                    { 
                        factory.sources.push(references[i].sourceName.value);
                    }
                }
                  
             });
        }
          
       
          
       //////////////////////////////////   USES  /////////////////////////////////////
          
        function getUses(concept)
        {
            factory.uses = [];
              
            factory.isLoading.uses = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?use ';
             sparql += 'WHERE { ';
             sparql += '?d a ' + Global.ns + 'DrugComponent. ';
             sparql += '?d  ' + Global.ns + 'name "'+concept+'"^^xsd:string. ';
             sparql += '?d ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             
             sparql += ' ?reference ' + Global.ns + 'refersUse ?u.';
             sparql += ' ?u ' + Global.ns + 'description ?use.';
               
             sparql += ' } ORDER BY ASC(?use) ';  
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                factory.isLoading.uses = false;  
                
                if(!result.error)
                {   
                    var references = result.results.bindings;
                     
                    for(var i=0;i<references.length;i++)
                    { 
                        factory.uses.push(references[i].use.value);
                    }
                }
                  
             });
        }
        
        
        
        
        //////////////////////////////////   REFERENCES  /////////////////////////////////////
        
        function getReferences(concept)
        {
             factory.references = [];
             
             factory.isLoading.references = true;
             
             var sparql = "";
             
             sparql += 'SELECT DISTINCT ?name ?drug ?lineNumber ?barcode ?id  ?plantName ?plantVariant ?locationName ?latitude ?longtitude ?referenceSourceName ?referenceSourceDate ?referenceSourceLanguage ';
             sparql += 'WHERE { ';
             //sparql += '?dc a ' + Global.ns + 'DrugComponent. ';
             sparql += '?dc ' + Global.ns + 'name ?drug. ';
             sparql += '?dc ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
             sparql += '?nv ' + Global.ns + 'nameVariant "'+concept+'"^^xsd:string. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             sparql += 'OPTIONAL { ?nv ' + Global.ns + 'language ?language.  }. '; 
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'lineNumber ?lineNumber.  }. ';
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'barcode ?barcode.  }. ';
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'id ?id.  }. ';
             sparql += 'OPTIONAL {';
             sparql += ' ?reference ' + Global.ns + 'refersLocation ?location.';
             sparql += ' ?location ' + Global.ns + 'name ?locationName.';
                sparql += 'OPTIONAL {';
                sparql += ' ?location ' + Global.ns + 'latitude ?latitude.';
                sparql += ' ?location ' + Global.ns + 'longtitude ?longtitude.';
                sparql += ' }. '; 
             sparql += ' }. ';
             
             sparql += 'OPTIONAL {';
             sparql += ' ?referenceSource ' + Global.ns + 'hasReference ?reference.';
             sparql += ' ?referenceSource ' + Global.ns + 'name ?referenceSourceName.';
                sparql += 'OPTIONAL { ?referenceSource ' + Global.ns + 'language ?referenceSourceLanguage. }.';
                sparql += 'OPTIONAL { ?referenceSource ' + Global.ns + 'date ?referenceSourceDate. }.';
             sparql += ' }. ';
            
             sparql += 'OPTIONAL {';
             sparql += ' ?reference ' + Global.ns + 'referredToBeProducedBy ?plantReference.';
             sparql += ' ?plantReference ' + Global.ns + 'refersTo ?plantNameVariant.';
             sparql += ' ?plantNameVariant ' + Global.ns + 'nameVariant ?plantVariant.';
             sparql += ' ?plant ' + Global.ns + 'hasNameVariant ?plantNameVariant.';
             sparql += ' ?plant ' + Global.ns + 'name ?plantName.';
             sparql += ' }. ';
             
             
             sparql += ' } ORDER BY ASC(?name) LIMIT 50 OFFSET 0'; 
            
           
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                factory.isLoading.references = false;
                
                if(!result.error)
                {    
                    factory.references = result.results.bindings;    
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