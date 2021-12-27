(function(){

	"use strict";
    
    angular.module("TIMECAPSULE").directive("timeline", timelineDirective);
    
    function timelineDirective()
    {

        return {
                restrict: "E",
                templateUrl: "app/directives/timeline/timeline.template.html",
                scope: 
                { 
                   title : "@",
                   type: "@",
                   references: "="
                },
                link: timelineLink,
                controller: timelineController
     
                };

    }
     
    
     function timelineController($scope,Util,PopupService)
    {
        $scope.popupUrl = 'app/directives/timeline/popup/';
        $scope.popup = PopupService;
        $scope.isMinimized = false;
         
        
        $scope.date =
        {
            from: 2000,
            to: 0
        }
        
        $scope.datePeriod = 
        {
            min: 1500,
            max: 1700,
            options: 
            {
                floor: 1400,
                ceil: 2050
            }
        }
        
        $scope.squares = [ "color1", "color2", "color3", "color4", "color5", "color6", "color7", "color8", "color9", "color10",
                         "color11", "color12", "color13", "color14", "color15" ];
        
        $scope.colors =["#354047", "#6a8a70", "#b58e8b", "#d9b658", "#b397a1", "#5a6a73", "#3e5542", "#6f5351", "#4e6f54", "#378143", "#8d3c61"];
        
        /*************************  Timeline Data *****************************/
        
        // The concepts array 
        $scope.concepts = [];
        
        // Percentages
        $scope.percentages = [];
        
        // Occurences
        $scope.occurences = [];
        
         
        /*************************  Pie chart Data *****************************/
      
        // The concepts array 
        $scope.pieConcepts = [];
        
        // Percentages
        $scope.piePercentages = [];
        
        // Occurences
        $scope.pieOccurences = [];
        
        
        
        /************************** Watchers **********************************/
        
        $scope.$watch(function () { return $scope.references },function()
        {
            
              $scope.concepts = [];
              $scope.occurences = [];
              $scope.percentages = [];
            
              $scope.pieConcepts = [];
              $scope.piePercentages = [];
              $scope.pieOccurences = [];
            
              $scope.buildVisualizationData();
             
            
        },true);
        
       
        
        /************************** Business Logic **********************************/
        
        
        $scope.initTimeline = function()
        {
            for(var i=0;i<$scope.references.length;i++)
            {
                var date = null;
                
                // Set the date (could be 'SourceDate' or 'Date')
                if($scope.type == "Variants" || $scope.type == "Language" || $scope.type == "Source Language" || $scope.type == "Source Location")
                {
                    if($scope.references[i].sourceDate)
                    {
                        date = $scope.references[i].sourceDate.value;
                    }
                }
                
                if(date)
                {
                    if(date < $scope.date.from)
                    {
                        $scope.date.from = date;
                    }
                    else
                    if(date > $scope.date.to)
                    {
                        $scope.date.to = date;
                    }
                }
                
            }
 
            $scope.graph.setWindow($scope.date.from+'-01-01', $scope.date.to+'-01-01');
        }
         
        
        $scope.buildVisualizationData = function()
        {
            //1. Generate the concepts (from the references) for the timeline AND pie chart
            $scope.generateConcepts();
            
            /*********************  A. Build the Timeline  *************************/
              
            //2. Generate Statistics  for the timeline (Count of occurences of concept + Percentage)
            $scope.generateTimelineStatistics();
            
            //3. Focus the timeline
            $scope.initTimeline();
            
             /*********************  B. Build the Pie Chart  *************************/
            
            //4. Generate Statistics  for the pie chart (Count of occurences of concept + Percentage)
            $scope.generatePieChartStatistics();
            
            
        }
        
        $scope.generateConcepts = function()
        {   
            for(var i=0;i<$scope.references.length;i++)
            {
                var concept = null;
                var date = null;
                var pieConcept = null;
                
                // Set the date (could be 'SourceDate' or 'Date')
                if($scope.type == "Variants" || $scope.type == "Language" || $scope.type == "Source Language" || $scope.type == "Source Location")
                {
                    if($scope.references[i].sourceDate)
                    {
                        date = $scope.references[i].sourceDate.value;
                    }
                }
                
                 
                // Name Variants in time
                if($scope.type == "Variants" && $scope.references[i].nameVariant)
                { 
                    pieConcept = $scope.references[i].nameVariant.value;
                    
                    if(date)
                    {
                       concept = $scope.references[i].nameVariant.value; 
                    }
                }
                // Language in time
                else
                if($scope.type == "Language" && $scope.references[i].language)
                { 
                    pieConcept = $scope.references[i].language.value;
                    
                    if(date)
                    {
                       concept = $scope.references[i].language.value;
                    }
                }
                // Source Language in time
                else
                if($scope.type == "Source Language" && $scope.references[i].sourceLanguage)
                { 
                    pieConcept = $scope.references[i].sourceLanguage.value;
                    
                    if(date)
                    {
                       concept = $scope.references[i].sourceLanguage.value;
                    }
                }
                // Location in time
                else
                if($scope.type == "Source Location" && $scope.references[i].sourceLocation)
                { 
                    pieConcept = $scope.references[i].sourceLocation.value;
                    
                    if(date)
                    {
                       concept = $scope.references[i].sourceLocation.value;
                    }

                }
                
                // Add the concept to the concepts list
                if(concept && !Util.exists($scope.concepts,concept))
                {
                     $scope.concepts.push(concept);

                }
                
                // Add the concept to the concepts list
                if(pieConcept && !Util.exists($scope.pieConcepts,pieConcept))
                {
                     $scope.pieConcepts.push(pieConcept);

                }
            }
        }
        
        
        // Add new item to the 2d graph dataset
        $scope.insertGraphData = function(newItem)
        {
            
            if(!$scope.graphData.length)
            {
                $scope.graphData.push(newItem);
            }
            else
            {   var isNew = true;
             
                for(var i=0;i<$scope.graphData.length;i++)
                {
                    if($scope.graphData[i].group == newItem.group && $scope.graphData[i].x == newItem.x)
                    {
                        var isNew = false;
                        $scope.graphData[i].y += 1; 
                    }
                }
               
                if(isNew)
                {
                    $scope.graphData.push(newItem);
                }
                
            }
        }
        
        
        // Generate the data to show in the 2d graph
        $scope.generateGraphData = function()
        {
            // Init DataSet  
            $scope.graphData = [];
           
            
            for(var i=0;i<$scope.references.length;i++)
            { 
                var concept = null;
                var date = null;
                
                // Set the date (could be 'SourceDate' or 'Date')
                if($scope.type == "Variants" || $scope.type == "Language" || $scope.type == "Source Language" || $scope.type == "Source Location")
                {
                    if($scope.references[i].sourceDate)
                    {
                        date = $scope.references[i].sourceDate.value;
                    }
                }
                
                if(date)
                {
                    // Set the Concept according to type
                    // Name Variants
                    if($scope.type == "Variants" && $scope.references[i].nameVariant)
                    {
                        concept = $scope.references[i].nameVariant.value;
                    }
                    else
                    if($scope.type == "Language" && $scope.references[i].language)
                    {
                        concept = $scope.references[i].language.value;
                    }
                    else
                    if($scope.type == "Source Language" && $scope.references[i].sourceLanguage)
                    {
                        concept = $scope.references[i].sourceLanguage.value;
                    }
                    else
                    if($scope.type == "Source Location" && $scope.references[i].sourceLocation)
                    {
                        concept = $scope.references[i].sourceLocation.value;
                    }
                }
                
                if(concept)
                {
                    var graphItem = 
                    { 
                         id: i,
                         x: date+"-01-01", 
                         y: 1, 
                         group: concept
                    };

                    $scope.insertGraphData(graphItem);

                }
            }
            
            
            
        }
        
        // Generate the total occurences of a concept in time and the percentage.
        $scope.generateTimelineStatistics = function()
        {   
            var total = 0;
             
            for(var i=0;i<$scope.concepts.length;i++)
            {
                $scope.occurences[i] = 0;
                $scope.percentages[i] = 0;
            
                for(var j=0;j<$scope.references.length;j++)
                { 
                    var concept = null;
                    var date = null;
                    
                    // Set the date (could be 'SourceDate' or 'Date')
                    if($scope.type == "Variants" || $scope.type == "Language" || $scope.type == "Source Language" || $scope.type == "Source Location")
                    {
                        if($scope.references[j].sourceDate)
                        {
                            date = $scope.references[j].sourceDate.value;
                        }
                    }
                    
                    if(date)
                    {
                         
                        // Set the Concept according to type
                        // Name Variants
                        if($scope.type == "Variants" && $scope.references[j].nameVariant)
                        {
                            concept = $scope.references[j].nameVariant.value;
                        }
                        else
                        if($scope.type == "Language" && $scope.references[j].language)
                        {
                            concept = $scope.references[j].language.value; 
                        }
                        else
                        if($scope.type == "Source Language" && $scope.references[j].sourceLanguage)
                        {
                            concept = $scope.references[j].sourceLanguage.value; 
                        }
                        else
                        if($scope.type == "Source Location" && $scope.references[j].sourceLocation)
                        {
                            concept = $scope.references[j].sourceLocation.value;
                        }


                        if(concept && concept == $scope.concepts[i])
                        {
                           $scope.occurences[i] +=1;

                        }
                    }
                   
                }
                  
            }
             
            // Count the total number of results in this date period
            for(var i=0;i<$scope.occurences.length;i++)
            {
                total += $scope.occurences[i];
            }
            
            
            
            for(var i=0;i<$scope.occurences.length;i++)
            {
                $scope.percentages[i] =  $scope.occurences[i] / total * 100  ; 
            }
            
          
        }
        
        
        
        
        $scope.generatePieChartStatistics = function()
        {   
            var total = 0;
             
            for(var i=0;i<$scope.pieConcepts.length;i++)
            {
                $scope.pieOccurences[i] = 0;
                $scope.piePercentages[i] = 0;
            
                for(var j=0;j<$scope.references.length;j++)
                { 
                    var concept = null;
                     
                         
                    // Set the Concept according to type
                    // Name Variants
                    if($scope.type == "Variants" && $scope.references[j].nameVariant)
                    {
                        concept = $scope.references[j].nameVariant.value;
                    }
                    else
                    if($scope.type == "Language" && $scope.references[j].language)
                    {
                        concept = $scope.references[j].language.value; 
                    }
                    else
                    if($scope.type == "Source Language" && $scope.references[j].sourceLanguage)
                    {
                        concept = $scope.references[j].sourceLanguage.value; 
                    }
                    else
                    if($scope.type == "Source Location" && $scope.references[j].sourceLocation)
                    {
                        concept = $scope.references[j].sourceLocation.value;
                    }


                    if(concept && concept == $scope.pieConcepts[i])
                    {
                       $scope.pieOccurences[i] +=1;

                    }
                     
                   
                }
                  
            }
             
            // Count the total number of results  
            for(var i=0;i<$scope.pieOccurences.length;i++)
            {
                total += $scope.pieOccurences[i];
            }
            
            
            
            for(var i=0;i<$scope.pieOccurences.length;i++)
            {
                $scope.piePercentages[i] =  $scope.pieOccurences[i] / total * 100  ; 
            }
            
          
        }
          
    }
    
    
    
    
    function timelineLink($scope, element, attrs, Util, PopupService)
    {   
        
        
        var graph2dContainer = element[0].getElementsByClassName('graph2d')[0];

        $scope.generateGraphData();
    

        $scope.graphDataset = new vis.DataSet($scope.graphData);

        $scope.graphOptions = 
        {
            start: "1400-01-01",
            end: "1900-01-01",
            shaded: true,
            clickToUse: true,
            interpolation: { enabled: false, parametrization: 'centripetal' },
            defaultGroup: '',
            legend: true 
        };
        
        $scope.graph = new vis.Graph2d(graph2dContainer, $scope.graphDataset, $scope.graphOptions)
         
      
      
      
      /*  TIMELINE
        var timelineContainer = element[0].getElementsByClassName('timeline')[0];
        
        timelineData = [
        { content: 'Achillea millefolium', start: '1617-01-01', type: 'point'},
        {content: 'Millefolium Majus', start: '1619-01-01', type: 'point'},
        {content: 'Duizendblad', start: '1715-01-01', type: 'point'},
        {content: 'Millefolium', start: '1821-01-01', type: 'point'},
        {content: 'Milefolium', start: '1902-01-01', type: 'point'},
        {content: 'Myriophilum', start: '1592-01-01', type: 'point'}
        ];
        
        
        
        var timelineDataset = new vis.DataSet($scope.timelineData);
        

        // Configuration for the Timeline
        var options = {};

        // Create a Timeline
        $scope.timeline = new vis.Timeline(timelineContainer, timelineDataset, options); 
        */
      
      
    }

})();

 
 