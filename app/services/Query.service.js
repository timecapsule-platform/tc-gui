(function () {
   
    'use strict';

    angular.module('TIMECAPSULE').factory('Query', Query);

     Query.$inject = ['$http','Global','Util','ErrorHandler','QueryBuilder', 'QueryBuilderCount', 'QueryBuilderTotal', 'QueryFactory'];

     function Query($http, Global, Util, ErrorHandler, QueryBuilder, QueryBuilderCount, QueryBuilderTotal, QueryFactory)
    {

        var factory = {};
      
        var qb = QueryBuilder;
        var qbc = QueryBuilderCount;
        var qbt = QueryBuilderTotal;
        
        factory.sparql = null; 
          
        // Query building blocks
        factory.options = 
        [
            // Name Variants
            {
                code: 1,
                name: "Name Variant(s)",
                text: "Show me",
                bg: "query-blue",
                
                criteria:
                [
                    new Option(0, "All", "Criteria", "", "query-purple", null, null, null),
                    new Option(1, "First Used", "Criteria", "", "query-purple", null, null, null),
                    new Option(3, "Most Common", "Criteria", "", "query-purple", null, null, null),
                    new Option(4, "Ambiguous", "Criteria", "", "query-purple", null, null, null)
                ],
                from: 
                [  
                     
                    new Option(1, "Plant Species", "from", "of", "query-grey", "circle-green.svg", null, null), 
                    new Option(2, "Drug Component", "from", "of", "query-grey", "circle-pink.svg", null, null)
                ],
                filters:
                [
                    new Option(1, "Language", "filter", "in language", "query-grey", "circle-red.svg", null, null),
                    new Option(2, "Date Period", "filter", "during date period", "query-grey", "circle-cyan.svg", null, null),
                    new Option(3, "Publication Location", "filter", "at location", "query-grey", "circle-orange.svg", null, null),
                    new Option(4, "Reference Source", "filter", "mentioned in", "query-grey", "circle-yellow.svg", null, null)
                ],
                optional: []
            },
            // Drug Components
            {
                code: 2,
                name: "Drug Component(s)",
                type: "select",
                text: "Show me",
                bg: "query-pink",
                criteria:
                [
                    new Option(0, "All", "Criteria", "", "query-purple", null, null, null)
                ],
                from: [],
                filters: 
                [ 
                    new Option(1,"Plant Species","filter","derived from","query-grey","circle-green.svg",null, null), 
                    new Option(2,"Reference Source","filter","mentioned in","query-grey","circle-yellow.svg",null, null),
                    new Option(3,"Location","filter","with origin","query-grey","circle-orange.svg",null, null),
                    new Option(4,"Plant Part","filter","derived from","query-grey","circle-brown.svg",null, null),
                    new Option(5,"Plant Family","filter","derived from","query-grey","circle-green-light.svg",null, null),
                    new Option(6, "Date Period", "filter", "mentioned during", "query-grey", "circle-cyan.svg", null, null)
                ],
                optional: [ ]
                
            }, // Reference Sources
            {
                code: 3,
                name: "Reference Source(s)",
                text: "Show me",
                type: "select",
                bg: "query-yellow",
                criteria:
                [
                    new Option(0, "All", "Criteria", "", "query-purple", null, null, null),
                    new Option(1, "First", "Criteria", "", "query-purple", null, null, null),
                ],
                from:
                [
                    new Option(1,"Plant Species","from","that mention","query-grey","circle-green.svg",null, null), 
                    new Option(2,"Drug Component","from","that mention","query-grey","circle-pink.svg",null, null)
                    
                ],
                filters:
                [
                    new Option(1, "Language", "filter", "written in language", "query-grey", "circle-red.svg", null, null),
                    new Option(3, "Publication Location", "filter", "published at location", "query-grey", "circle-orange.svg", null, null)
                ],
                optional: [ ]
                
            }, // Plant Species
            {
                code: 4,
                name: "Plant Species",
                text: "Show me",
                type: "select",
                bg: "query-green",
                criteria:
                [
                    new Option(0, "All", "Criteria", "", "query-purple", null, null, null)
                ],
                from:[],
                filters: 
                [
                    new Option(1,"Drug Component","filter","that produce","query-grey","circle-pink.svg",null, null),
                    new Option(2, "Date Period", "filter", "mentioned during", "query-grey", "circle-cyan.svg", null, null)
                ],
                optional: []
                
            }, // Locations
            {
                code: 5,
                name: "Location(s)",
                text: "Show me",
                type: "select",
                bg: "query-orange",
                criteria:
                [
                    new Option(0, "All", "Criteria", "", "query-purple", null, null, null)
                ],
                from:
                [
                    new Option(1, "Plant Species", "from", "of", "query-grey", "circle-green.svg", null, null), 
                    new Option(2, "Drug Component", "from", "of", "query-grey", "circle-pink.svg", null, null)
                    
                ],
                filters: [],
                optional: []
                
            }
              
            
        ];
        
        
 
        factory.select = null;
        factory.from = null;
        factory.filters = [];
        factory.criteria = null;
       
        factory.state = 
        {
            select      : true,
            from        : false,
            criteria    : false,
            filter      : false,
            optional    : false
        };
        
        factory.isExecuting = false;
        
        factory.results = [];
        factory.resultsTotal = [];
        
        factory.condensed = [];
        
        factory.variants = [];
        factory.pPlants = [];
        factory.pDrugs = [];
        factory.references = [];
        factory.locations = [];
        factory.sources = [];
        factory.drugs = [];
        factory.plants = [];
        
        factory.markers = [];
        factory.sourceMarkers = [];
        factory.markersReady = false;
        
        factory.visualizations = [];
         
        factory.Execute = Execute;
        factory.Clear = Clear;
        factory.OrganizeData = OrganizeData;
        factory.FixCondensed = FixCondensed;
        factory.AddVisualizations = AddVisualizations;
        factory.ExecuteResultsCount = ExecuteResultsCount;
        factory.ExecuteAll = ExecuteAll;
        factory.ExecuteTotal = ExecuteTotal;
        factory.GenerateLocationMarkers = GenerateLocationMarkers;
        factory.GenerateSourceMarkers = GenerateSourceMarkers;
        factory.clearMarkers = clearMarkers;
        
        factory.init = init;
         
        
        return factory;
        
        
        
        
        function clearData()
        {
            factory.results = [];
            factory.resultsTotal = [];
            
            factory.condensed = [];
            
            factory.variants = [];
            factory.pPlants = [];
            factory.pDrugs = [];
            factory.references = [];
            factory.locations = [];
            factory.sources = [];
            factory.drugs = [];
            factory.plants = [];
            
         
            factory.clearMarkers();
            
            factory.markers = [];
            factory.sourceMarkers = [];
            factory.markersReady = false;
            factory.sourceMarkersReady = false;
            
            factory.visualizations = [];
        }
        
        function Clear()
        {
            clearData();
            
            factory.select = null;
            factory.from = null;
            factory.filters = [];
            factory.criteria = null;
            factory.optional = [];
            
            
 
            factory.state = 
            {
                select      : true,
                from        : false,
                criteria    : false,
                filter      : false,
                optional    : false
            };
        }
        
        
        
        
        
        // This will retrieve all results in the background for the visualizations
        function ExecuteTotal()
        {  
            
            // Second argument is the offset and third argument is the results limit
            qbt.BuildQuery(factory,0,100000);
            
             
            if(qbt.query.sparql)
            {
                 
                factory.isExecutingTotal = true;
                
                QueryFactory.ExecuteQuery(qbt.query.sparql).then(function(result)
                 {    
                    factory.isExecutingTotal = false; 
                    
                    if(!result.error)
                    {   
                        factory.resultsTotal = result.results.bindings;  
                        factory.GenerateLocationMarkers();
                        factory.GenerateSourceMarkers();
                    }
                    else
                    {  
                        ErrorHandler.handleErrorCode(result.code);
                    }

                 });
            }
            else
            {
                console.log("Invalid Query");
            }
        }
        
        function clearMarkers()
         {
             for(var i=0;i<factory.markers.length;i++)
            {
                factory.markers[i].setMap(null);
            }
             
             for(var i=0;i<factory.sourceMarkers.length;i++)
            {
                factory.sourceMarkers[i].setMap(null);
            }
             
         } 
        
        function GenerateLocationMarkers()
        {
            factory.markersReady = false;
            
            for(var i=0;i<factory.resultsTotal.length;i++)
            { 
                var markerIcon = "assets/images/marker-undefined.svg";

                if(factory.resultsTotal[i].type)
                {
                    if(factory.resultsTotal[i].type.value == "Grows")
                        markerIcon = "assets/images/marker-grows.svg";
                    else
                    if(factory.resultsTotal[i].type.value == "ArchaeologicalFinding")
                        markerIcon = "assets/images/marker-arcaeological.svg";
                    else
                    if(factory.resultsTotal[i].type.value == "Cargo")
                        markerIcon = "assets/images/marker-cargo.svg";
                }

                if(factory.resultsTotal[i].latitude && factory.resultsTotal[i].longitude)
                { 
                  
                    var marker = new google.maps.Marker(
                    { 
                        title: "Uknown",
                        icon: markerIcon,
                        position: 
                        { 
                            lat: Number(factory.resultsTotal[i].latitude.value), 
                            lng: Number(factory.resultsTotal[i].longitude.value)
                        },
                        map: null
                     });
                    
                    factory.markers.push(marker);
                    
                   
                }

                

            }
            
            factory.markersReady = true;
        }
        
        function GenerateSourceMarkers()
        {
            
            factory.sourceMarkersReady = false;
            
            for(var i=0;i<factory.resultsTotal.length;i++)
            { 
                var markerIcon = "assets/images/marker-source.svg";
               
                if(factory.resultsTotal[i].slatitude && factory.resultsTotal[i].slongitude)
                { 
                  
                    var sourceMarker = new google.maps.Marker(
                    { 
                        title: "Uknown",
                        icon: markerIcon,
                        position: 
                        { 
                            lat: Number(factory.resultsTotal[i].slatitude.value), 
                            lng: Number(factory.resultsTotal[i].slongitude.value)
                        },
                        map: null
                     });
                    
                    factory.sourceMarkers.push(sourceMarker);
                   
                }

                

            }
            
            factory.sourceMarkersReady = true;
            
        }
        
        
        // This will retrieve the remaining results after pushing the "Load All" button
        function ExecuteAll()
        {  
            
            // Second argument is the offset and third argument is the results limit
            qb.BuildQuery(factory,50,100000);
            
             
            if(qb.query.sparql)
            {
                 
                factory.isExecutingAll = true;
                
                QueryFactory.ExecuteQuery(qb.query.sparql).then(function(result)
                 {    
                    factory.isExecutingAll = false; 

                    if(!result.error)
                    {   
                        for(var i=0;i<result.results.bindings.length;i++)
                        {
                            factory.results.push(result.results.bindings[i]);
                        }
                        
                        factory.OrganizeData();
                         
                    }
                    else
                    {  
                        ErrorHandler.handleErrorCode(result.code);
                    }

                 });
            }
            else
            {
                console.log("Invalid Query");
            }
        }
        
        
        
        
         // This will execute a query that will count the results
        function ExecuteResultsCount()
        {
            // Second argument is the offset and third argument is the results limit
            qbc.BuildQuery(factory,0, 1000000);
            factory.sparqlCount = qbc.query.sparql;
            
            var sparql = "";
            
             sparql += 'SELECT  (COUNT(*) as ?count) WHERE { { ';
             sparql += factory.sparqlCount;
             sparql += ' } } '; 
            
             factory.isExecutingCount = true;
              
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                factory.isExecutingCount = false; 

                if(!result.error)
                {   
                    factory.resultsCount = result.results.bindings[0].count.value;    
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }

             });
            
             
        }
        
        function Execute()
        {
            clearData();
            
            // Second argument is the offset and third argument is the results limit
            qb.BuildQuery(factory,0,50);
            
            factory.sparql = qb.query.sparql;
            factory.resultFormat = qb.query.resultFormat;
            factory.resourceType = qb.query.resourceType;
            factory.resourceName = qb.query.resourceName;
            factory.resourceConcept = qb.query.resourceConcept;
            factory.networkPlantPart = qb.query.networkPlantPart;
            factory.networkPlant = qb.query.networkPlant;
            
            if(qb.query.sparql)
            {
                factory.ExecuteResultsCount();
                factory.ExecuteTotal();
                
                factory.isExecuting = true;
                
                QueryFactory.ExecuteQuery(qb.query.sparql).then(function(result)
                 {    
                    factory.isExecuting = false; 

                    if(!result.error)
                    {   
                        factory.results = result.results.bindings;
                       
                        factory.OrganizeData();
                        factory.AddVisualizations();
                    }
                    else
                    {  
                        ErrorHandler.handleErrorCode(result.code);
                    }

                 });
            }
            else
            {
                console.log("Invalid Query");
            }
        }
        
        
        
        
        
        function AddVisualizations()
        {
            
            
            var criteria = qb.options.criteria.code;
            var select = qb.options.select.code;
            if(qb.options.from)
            {
                var from = qb.options.from.code;
            }
            
            var hasfilter  = function(name) { 
            
                for(var i=0;i<qb.options.filters.length;i++)
                {
                    if(qb.options.filters[i].name == name)
                    {
                        return true;
                    }
                }
            
                return false;
            };
            
            function getFilter(filterName)
            {
                for(var i=0;i<qb.options.filters.length;i++)
                {
                    if(qb.options.filters[i].name == filterName)
                        return i;
                }

                return -1;
            }
            
            
            if(criteria == 0)
            {
                // VARIANTS
                if(select && select == 1)
                {
                    factory.visualizations.push("variant-timeline");
                    factory.visualizations.push("language-timeline");
                    factory.visualizations.push("source-language-timeline");
                    factory.visualizations.push("location-timeline");
                    
                    if(hasfilter("Language"))
                    {
                        for(var i=0;i<factory.visualizations.length;i++)
                        {
                            if(factory.visualizations[i] == "language-timeline")
                                factory.visualizations.splice(i,1);
                        }
                    }
                     
                    if(hasfilter("Location"))
                    {
                        for(var i=0;i<factory.visualizations.length;i++)
                        {
                            if(factory.visualizations[i] == "location-timeline")
                                factory.visualizations.splice(i,1);
                        }
                    }
                }
                // DRUG COMPONENTS
                else
                if(select && select == 2)
                {
                    
                    
                   
                    if(hasfilter("Plant Family"))
                    {
                         // Store the family into query.familyName so it can be used by visualization pie chart
                         var index = getFilter('Plant Family'); 
                         factory.plantFamily = qb.options.filters[index].data.name;
                         factory.visualizations.push("pie-drug-family");
                         factory.visualizations.push("pie-plant-family");
                    }
                    
                    if(hasfilter("Plant Species"))
                    {
                         factory.visualizations.push("network-drug-plant");
                    }
                    
                    if(hasfilter("Plant Part"))
                    {
                        factory.visualizations.push("pie-plant-part");
                    }
                     
                    if(hasfilter("Location"))
                    {
                        for(var i=0;i<factory.visualizations.length;i++)
                        {
                            if(factory.visualizations[i] == "location-timeline")
                                factory.visualizations.splice(i,1);
                        }
                    } 
                }
                else
                if(select && select == 3)
                {
                     
                }
                else
                if(select && select == 4)
                {
                    factory.visualizations.push("map");
                }
                else
                if(select && select == 5)
                {
                    factory.visualizations.push("map");
                }
              
                
            }
            
             
        }
        
        
        
        
        
        
        function OrganizeData()
        {
            
            if(factory.results.length)
            {
                factory.references = angular.copy(factory.results);
              
                
                for(var i=0;i<factory.references.length;i++)
                {
                    // Name Variants
                    if(factory.references[i].nameVariant)
                    {
                        var variant = factory.references[i].nameVariant.value;
                        if(!Util.exists(factory.variants,variant))
                        {
                             factory.variants.push(variant);
                            
                        }
                    }
                    
                    // Drugs
                    if(factory.references[i].name)
                    {
                        var drug = factory.references[i].name.value;
                        if(!Util.exists(factory.drugs,drug))
                        {
                             factory.drugs.push(drug);
                        }
                    }
                    
                    // Reference Sources
                    if(factory.references[i].sourceName)
                    {
                        var source = factory.references[i].sourceName.value;
                        if(!Util.exists(factory.sources,source))
                        {
                             factory.sources.push(source);
                        }
                    }
                    
                    // Plants
                    if(factory.references[i].plantName)
                    {
                        var plant = factory.references[i].plantName.value;
                        if(!Util.exists(factory.plants,plant))
                        {
                             factory.plants.push(plant);
                        }
                    }
                    
                    // Locations
                    if(factory.references[i].locationName)
                    {
                        
                        var location = factory.references[i].locationName.value;
                        if(!Util.exists(factory.locations,location))
                        {
                             factory.locations.push(location);
                        }
                    }
                    
                    // Produced by Plant
                    if(factory.references[i].pPlant)
                    {
                        var pPlant = factory.references[i].pPlant.value;
                        if(!Util.exists(factory.pPlants,pPlant))
                        {
                             factory.pPlants.push(pPlant);
                        }
                    }
                    
                    // Produces Drug Component
                    if(factory.references[i].pDrug)
                    {
                        var pDrug = factory.references[i].pDrug.value;
                        if(!Util.exists(factory.pDrugs,pDrug))
                        {
                             factory.pDrugs.push(pDrug);
                        }
                    }
                    
                    
                }
                
                factory.FixCondensed();
                
            }
            
            
        }
        
        
        function FixCondensed()
        {
            factory.condensed = [];
            
            // VARIANTS  
            if(factory.select && factory.select.code == 1 )
            { 
                for(var i=0;i<factory.variants.length;i++)
                { 
                    var item = {};
                    item.name = factory.variants[i];
                    item.references = [];

                    for(var j=0;j<factory.references.length;j++)
                    {
                        if(factory.references[j].nameVariant.value == item.name)
                        {
                            item.references.push(factory.references[j]);
                        }
                    }

                    factory.condensed.push(item);
                }
            }
            // DRUGS
            else
            if(factory.select && factory.select.code == 2)
            {  
                for(var i=0;i<factory.drugs.length;i++)
                {
                    var item = {};
                    item.name = factory.drugs[i];
                    item.references = [];

                    for(var j=0;j<factory.references.length;j++)
                    {
                        if(factory.references[j].name.value == item.name)
                        {
                            item.references.push(factory.references[j]);
                        }
                    }

                    factory.condensed.push(item);
                }
            }
            // SOURCES
            else
            if(factory.select && factory.select.code == 3)
            {  
                for(var i=0;i<factory.sources.length;i++)
                {
                    var item = {};
                    item.name = factory.sources[i];
                    item.references = [];

                    for(var j=0;j<factory.references.length;j++)
                    {
                        if(factory.references[j].sourceName.value == item.name)
                        {
                            item.references.push(factory.references[j]);
                        }
                    }

                    factory.condensed.push(item);
                }
            }
            // PLANTS
            else
            if(factory.select && factory.select.code == 4)
            {  
                for(var i=0;i<factory.plants.length;i++)
                {
                    var item = {};
                    item.name = factory.plants[i];
                    item.references = [];

                    for(var j=0;j<factory.references.length;j++)
                    {
                        if(factory.references[j].plantName.value == item.name)
                        {
                            item.references.push(factory.references[j]);
                        }
                    }

                    factory.condensed.push(item);
                }
            }
            // LOCATIONS
            else
            if(factory.select && factory.select.code == 5)
            {   
                factory.locations.push("Unnamed");
             
                for(var i=0;i<factory.locations.length;i++)
                {
                    var item = {};
                    item.name = factory.locations[i];
                    item.references = [];

                    for(var j=0;j<factory.references.length;j++)
                    {
                        if(factory.references[j].locationName && factory.references[j].locationName.value == item.name)
                        {
                            item.references.push(factory.references[j]);
                        }
                        
                        if(!factory.references[j].locationName && item.name == "Unnamed")
                        {
                            item.references.push(factory.references[j]);
                        }
                    }

                    factory.condensed.push(item);
                }
                 
            }
            
             
            
        }
        
        function init()
        { 
           
        }
        
        
         
         
          

    }
 
})();