(function () {
   
    'use strict';

    angular.module('TIMECAPSULE').factory('ResourcePlant', ResourcePlant);

     ResourcePlant.$inject = ['$http','Global','Util','ErrorHandler','QueryFactory','DBpediaFactory', 'PlantsFactory'];

     function ResourcePlant($http, Global, Util, ErrorHandler, QueryFactory, DBpediaFactory, PlantsFactory)
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
        
        factory.location = { name : null , latitude : null, longtitude : null };
        factory.source = { name: null, language: null, date: null };
         
       
        
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
          
            
            // Get Plant References
             getReferences(concept);
             
             // Load the name variants
             getNameVariants(concept);
             
             // Load all drugs the plant produces
              getPlantDrugs(concept);
             
             // Load all reference sources that mention the plant  
              getSources(concept);
             
             // Load all plant uses
              getUses(concept);
             
             // Load all plant locations
             // getLocations(concept);
          
            
            
        }
        
        
        /*********************************************************************************************************/
        /************************************      PLANT DATA LOAD          **************************************/
        /*********************************************************************************************************/
        
        
        
        //////////////////////////////////   NAME VARIANTS  /////////////////////////////////////
        
        function getNameVariants(concept)
        {
            factory.variants = [];
              
            factory.isLoading.variants = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?name  ';
             sparql += 'WHERE { ';
             sparql += '?p a ' + Global.ns + 'Plant. ';
             sparql += '?p  ' + Global.ns + 'name "'+concept+'"^^xsd:string. ';
             sparql += '?p ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
              
             sparql += ' } ORDER BY ASC(?name) '; 
               console.log(sparql); 
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {  
                factory.isLoading.variants = false;  
                console.log(result);
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
        
        function getPlantDrugs(concept)
        {
            factory.drugs = [];
              
            factory.isLoading.pDrugs = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?drugName  ?drugVariant ';
             sparql += 'WHERE { ';
             sparql += '?p a ' + Global.ns + 'Plant. ';
             sparql += '?p  ' + Global.ns + 'name "'+concept+'"^^xsd:string. ';
             sparql += '?p ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             
             sparql += ' ?drugReference ' + Global.ns + 'referredToBeProducedBy ?reference.';
             sparql += ' ?drugReference ' + Global.ns + 'refersTo ?drugNameVariant.';
             sparql += ' ?drugNameVariant ' + Global.ns + 'nameVariant ?drugVariant.';
             sparql += ' ?drug ' + Global.ns + 'hasNameVariant ?drugNameVariant.';
             sparql += ' ?drug ' + Global.ns + 'name ?drugName.';
              
             sparql += ' } ORDER BY ASC(?drugName) '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                factory.isLoading.pDrugs = false;  
                
                if(!result.error)
                {   
                    var references = result.results.bindings;
                     
                    for(var i=0;i<references.length;i++)
                    {
                        if(references[i].drugVariant)
                        {
                            var drug = 
                            { 
                                name: references[i].drugName.value, 
                                variants : []
                            };

                            var variant = references[i].drugVariant.value;

                            var index = Util.conceptExists(factory.drugs,drug);

                            if(index == -1)
                            {
                                 drug.variants.push(variant);
                                 factory.drugs.push(drug);
                            }
                            else
                            {
                                if(!Util.exists(factory.drugs[index].variants,variant))
                                {
                                    factory.drugs[index].variants.push(variant);
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
             sparql += '?p a ' + Global.ns + 'Plant. ';
             sparql += '?p  ' + Global.ns + 'name "'+concept+'"^^xsd:string. ';
             sparql += '?p ' + Global.ns + 'hasNameVariant ?nv. ';
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
             sparql += '?p a ' + Global.ns + 'Plant. ';
             sparql += '?p  ' + Global.ns + 'name "'+concept+'"^^xsd:string. ';
             sparql += '?p ' + Global.ns + 'hasNameVariant ?nv. ';
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
             
             sparql += 'SELECT DISTINCT  ?name   ?lineNumber ?barcode ?id  ?drugName ?drugVariant ?locationName ?latitude ?longtitude ?sourceName  ?specimen ?spLatitude ?spLongtitude ';
             sparql += 'WHERE { ';
             sparql += '?p  a ex:Plant. ';
             sparql += '?p ' + Global.ns + 'name "'+concept+'"^^xsd:string. ';
             sparql += '?p ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
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
             sparql += ' ?source ' + Global.ns + 'hasReference ?reference.';
             sparql += ' ?source ' + Global.ns + 'name ?sourceName.';
             sparql += ' }. ';
              
             
             sparql += 'OPTIONAL {';
             sparql += ' ?reference ' + Global.ns + 'hasSpecimen ?sp. ';
             sparql += ' ?sp ' + Global.ns + 'description ?specimen. ';
                sparql += 'OPTIONAL {';
                sparql += ' ?sp ' + Global.ns + 'refersLocation ?specimenLocation. ';
                sparql += ' ?specimenLocation ' + Global.ns + 'latitude ?spLatitude. ';
                sparql += ' ?specimenLocation ' + Global.ns + 'longtitude ?spLongtitude. ';
                sparql += ' }. ';
             sparql += ' }. ';
            
             sparql += 'OPTIONAL {';
             sparql += ' ?drugReference ' + Global.ns + 'referredToBeProducedBy ?reference.';
             sparql += ' ?drugReference ' + Global.ns + 'refersTo ?drugNameVariant.';
             sparql += ' ?drugNameVariant ' + Global.ns + 'nameVariant ?drugVariant.';
             sparql += ' ?drug ' + Global.ns + 'hasNameVariant ?drugNameVariant.';
             sparql += ' ?drug ' + Global.ns + 'name ?drugName.';
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
        
       
        
        
        
        
        
        
        
        //////////////////////////////////   DBPEDIA  /////////////////////////////////////
        
        
        // Creates an object with the plant name, plant family
        function getPlantNameForDBpedia(name,author)
        {
            var plant = {}
            plant.name = name;
            
            // Remove the author
            if(author)
            {
                 plant.name = name.replace(author,"");
            }
                 
             var words  = plant.name.split(" ");
              
             plant.family = words[0];
                 
             if(words[1])
             {
                 plant.name = words[0]+" "+words[1];
             }
             else
             {
                plant.name = words[0];
             }
            
            return plant;
            
        } 
        
         function parseDBpediaResult(result)
         {  
            factory.dbpediaURL = null;
            factory.abstract = null;
            factory.thumb = null;
            
            if(result.results.bindings.length > 0)
            {
                if(result.results.bindings[0].resource)
                {
                    factory.dbpediaURL = result.results.bindings[0].resource.value;
                }
                if(result.results.bindings[0].abstract)
                {
                    factory.abstract = result.results.bindings[0].abstract.value;
                }
                if(result.results.bindings[0].thumb)
                {
                    factory.thumb = result.results.bindings[0].thumb.value;
                }
            }
            else
            {
                getPlantDBpediaInfo(factory.plant.family); 
            }
            
            
         }
         
         function getPlantDBpediaInfo(plantName)
		 {   
            
             
             var query = "";
             
             query += 'SELECT ?resource ?abstract ?thumb ';
             query += 'WHERE {';
             query += '?resource rdfs:label "'+plantName+'"@en.';
             query += '?resource  <http://dbpedia.org/ontology/abstract> ?abstract.';
             query += '?resource  <http://dbpedia.org/ontology/thumbnail> ?thumb.';
             query += 'FILTER langMatches(lang(?abstract), "en")';
             query += '}';
             
			 DBpediaFactory.Query(query).then(function(result)
			 {    
                if(!result.error)
                {   
                    parseDBpediaResult(result);
                }
                  
			 });
		  }
        
        
        
        function GetPlantNameVariants(name)
        {
             var sparql = "";
              
             sparql += 'SELECT  ?name  ';
             sparql += 'WHERE { ';
             sparql += '?p a ' + Global.ns + 'Plant. ';
             sparql += '?p  ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
             sparql += '?p ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
              
             sparql += ' } ORDER BY ASC(?name) '; 
             
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
               
                if(!result.error)
                {   
                    var rawVariants = result.results.bindings;
                     
                    for(var i=0;i<rawVariants.length;i++)
                    {
                        if(rawVariants[i].name)
                        {
                            var variant = rawVariants[i].name.value;
                            if(!Util.exists(factory.variants,variant))
                            {
                                factory.variants.push(variant);
                            }
                        }
                            
                    }
                    
                }
                  
             });
           
            
        }
        
        
        function GetPlantInfo(name)
        {   
             var sparql = "";
             
             sparql += 'SELECT  ?name ?lineNumber ?barcode ?id  ?drugName ?locationName ?latitude ?longtitude ?referenceSourceName ?referenceSourceDate ?referenceSourceLanguage ';
             sparql += 'WHERE { ';
             //sparql += '?p a ' + Global.ns + 'Plant. ';
             //sparql += '?p  ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
             //sparql += '?p ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
             sparql += '?nv ' + Global.ns + 'nameVariant "'+name+'"^^xsd:string. ';
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
             sparql += ' ?drugReference ' + Global.ns + 'referredToBeProducedBy ?reference.';
             sparql += ' ?drugReference ' + Global.ns + 'refersTo ?drugNameVariant.';
             sparql += ' ?drugNameVariant ' + Global.ns + 'nameVariant ?drugName.';
             sparql += ' }. ';
             
             
             sparql += ' } ORDER BY ASC(?name) '; 
             
            factory.isLoading = true;

            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                factory.isLoading = false; 
                
                if(!result.error)
                {   
                     
                    var rawReferences = result.results.bindings;
                    factory.references = [];
                    
                    // Eliminating duplicate references
                    for(var i=0;i<rawReferences.length;i++)
                    {
                        if(!Util.referenceExists(factory.references,rawReferences[i]))
                        {
                            factory.references.push(rawReferences[i]);
                        }
                    }
                  
                    
                    for(var i=0;i<factory.references.length;i++)
                    {
                        
                        
                        if(factory.references[i].drugName)
                        {
                            var drug = factory.references[i].drugName.value;
                            if(!Util.exists(factory.drugs,drug))
                            {
                                 factory.drugs.push(drug);
                            }
                        }
                        
                        if(factory.references[i].referenceSourceName)
                        {
                            var source = factory.references[i].referenceSourceName.value;
                            if(!Util.exists(factory.sources,source))
                            {
                                 factory.sources.push(source);
                            }
                        }
                             
                    }
                    
                     
                }
                
             });
            
        }
         
        /****************************************** END OF PLANT SPECIES  **********************************************/
        
        
        
          
        
        function init()
        { 
           
        }
        
        
         
         
          

    }
 
})();