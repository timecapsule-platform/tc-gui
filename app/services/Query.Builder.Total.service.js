(function () {
  "use strict";

  angular.module("TIMECAPSULE").factory("QueryBuilderTotal", QueryBuilderTotal);

  QueryBuilderTotal.$inject = ["$http", "Global", "ErrorHandler"];

  function QueryBuilderTotal($http, Global, ErrorHandler) {
    var factory = {};

    factory.query = {};

    factory.ns = Global.ns;

    // The query options [input from GUI]
    factory.options = null;

    factory.BuildQuery = BuildQuery;
    factory.ClearQuery = ClearQuery;
    factory.GenerateQueryCode = GenerateQueryCode;
    factory.GenerateSparql = GenerateSparql;

    factory.init = init;

    return factory;

    function ClearQuery() {
      this.query = {};
    }

    function GenerateQueryCode() {
      this.query.code = "";

      if (this.options.criteria) this.query.code += this.options.criteria.code;
      if (this.options.select) this.query.code += this.options.select.code;
      // Don't need from code
      //  if(this.options.from)
      //    this.query.code += this.options.from.code;
    }

    function BuildQuery(queryOptions, offset, limit) {
      this.options = queryOptions;

      // Generate the query code to match a query to SPARQL
      this.GenerateQueryCode();

      // Generate the SPARQL query using the query code + options
      this.GenerateSparql(offset, limit);

      // console.log("CODE: ",this.query.code);
      //  console.log("SPARQL \n",this.query.sparql);
    }

    function getFilter(filterName) {
      for (var i = 0; i < factory.options.filters.length; i++) {
        if (factory.options.filters[i].name == filterName) return i;
      }

      return -1;
    }

    //
    //
    // Generate the SPARQL Query to be executed
    //
    //
    function GenerateSparql(offset, limit) {
      // Init the Query
      this.query.sparql = "";
      this.query.offset = offset;
      this.query.limit = limit;

      this.query.networkPlantPart = null;
      this.query.networkPlant = null;

      // The graphs in FROM
      var fromGraphs = "";
      fromGraphs +=
        " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/brahms> ";
      fromGraphs +=
        " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/snippendaal> ";
      fromGraphs +=
        " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/thesaurus> ";
      fromGraphs +=
        " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/economicBotany> ";
      fromGraphs +=
        " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/radar> ";
      fromGraphs +=
        " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/chrono> ";

      //
      // SPARQL Query Patterns
      //

      // Case 01: SELECT [ALL] [Name Variants]
      if (this.query.code === "01") {
        // This is to show the correct results format
        this.query.resultFormat = "VARIANT";

        // This is the resource type to load when clicking the item (plant, drug etc)
        if (this.options.from) {
          if (this.options.from.code == 1) {
            this.query.resourceType = "PLANT";
            this.query.resourceName = this.options.from.data.name;
            this.query.resourceConcept = this.options.from.data.plantName;
          } else if (this.options.from.code == 2) {
            this.query.resourceType = "DRUG";
            this.query.resourceName = this.options.from.data.name;
            this.query.resourceConcept = this.options.from.data.drugName;
          }
        }

        this.query.sparql +=
          "SELECT  ?nameVariant  ?lineNumber ?barcode ?id ?language ?sourceName ?sourceLanguage ?sourceDate ?sourceLocation ?slatitude ?slongitude ?nameYear ";
        this.query.sparql += fromGraphs;
        this.query.sparql += "WHERE { ";
        //this.query.sparql += '?nv a ' + Global.ns + 'NameVariant. ';
        this.query.sparql += "?concept " + Global.ns + "hasNameVariant ?nv. ";
        //From Dataset
        if (this.options.from) {
          if (this.options.from.data.plantName) {
            this.query.sparql +=
              "?concept " +
              Global.ns +
              'name "' +
              this.options.from.data.plantName +
              '"^^xsd:string.';
          } else if (this.options.from.data.drugName) {
            this.query.sparql +=
              "?concept " +
              Global.ns +
              'name "' +
              this.options.from.data.drugName +
              '"^^xsd:string.';
          }
        }
        this.query.sparql += "?nv " + Global.ns + "nameVariant ?nameVariant. ";
        this.query.sparql +=
          "OPTIONAL { ?nv " + Global.ns + "year ?nameYear. }. ";
        this.query.sparql += "?reference " + Global.ns + "refersTo ?nv. ";

        this.query.sparql +=
          "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?source " + Global.ns + "hasReference ?reference.";
        this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "language ?sourceLanguage. }.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "year ?sourceDate. }.";
        this.query.sparql += "OPTIONAL { ";
        this.query.sparql +=
          " { ?source " +
          Global.ns +
          "hasLocation ?slocation. } UNION { ?source " +
          Global.ns +
          "refersLocation ?slocation. } ";
        this.query.sparql +=
          "?slocation " + Global.ns + "name ?sourceLocation ";
        this.query.sparql += " }. ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL { ";
        this.query.sparql += " {  ";
        this.query.sparql += "?source " + Global.ns + "hasLocation ?sPoint. ";
        this.query.sparql += " } UNION  {  ";
        this.query.sparql +=
          "?source " + Global.ns + "refersLocation ?sPoint. ";
        this.query.sparql += " }. ";
        this.query.sparql += "?sPoint " + Global.ns + "latitude ?slatitude. ";
        this.query.sparql += "?sPoint " + Global.ns + "longitude ?slongitude. ";
        this.query.sparql += " }. ";

        /*
        this.query.sparql += 'OPTIONAL { ';
        this.query.sparql += ' ?reference ' + Global.ns + 'refersUse ?u. ';
        this.query.sparql += ' ?u ' + Global.ns + 'description ?use. ';
        this.query.sparql += ' }. ';
        
      
        this.query.sparql += 'OPTIONAL {';
        this.query.sparql += ' ?reference ' + Global.ns + 'refersLocation ?location.';
        this.query.sparql += ' ?location ' + Global.ns + 'name ?locationName. ';
        this.query.sparql += 'OPTIONAL { ?location '+ Global.ns + 'locationType ?locationType. }. ';
        this.query.sparql += 'OPTIONAL {';
        this.query.sparql += ' ?location ' + Global.ns + 'latitude ?latitude.';
        this.query.sparql += ' ?location ' + Global.ns + 'longitude ?longitude.';
        this.query.sparql += ' }. '; 
        this.query.sparql += ' }. ';
       
       
        this.query.sparql += 'OPTIONAL {';
        this.query.sparql += ' ?drugReference ' + Global.ns + 'referredToBeProducedBy ?reference.';
        this.query.sparql += ' ?drugReference ' + Global.ns + 'refersTo ?drugNameVariant.';
        this.query.sparql += ' ?drugNameVariant ' + Global.ns + 'nameVariant ?pDrug.';
        this.query.sparql += ' }. ';
       
        this.query.sparql += 'OPTIONAL {';
        this.query.sparql += ' ?reference ' + Global.ns + 'referredToBeProducedBy ?plantReference.';
        this.query.sparql += ' ?plantReference ' + Global.ns + 'refersTo ?plantNameVariant.';
        this.query.sparql += ' ?plantNameVariant ' + Global.ns + 'nameVariant ?pPlant.';
        this.query.sparql += ' }. ';
        */

        /*
        // Language Filter
        var index = getFilter('Language'); 
        if( index != -1 )
        {
            this.query.sparql += ' ?source ' + Global.ns + 'hasReference ?reference.';
            this.query.sparql += ' ?source ' + Global.ns + 'language ?sourceLanguage. ';
            this.query.sparql += ' FILTER ( ?sourceLanguage = "'+this.options.filters[index].data.name+'"^^xsd:string). ';
        }
        */

        // Language Filter
        var index = getFilter("Language");
        if (index != -1) {
          this.query.sparql += " ?nv " + Global.ns + "language ?language.";
          this.query.sparql +=
            ' FILTER ( ?language = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Location Filter
        var index = getFilter("Publication Location");
        if (index != -1) {
          this.query.sparql +=
            "?source " + Global.ns + "hasReference ?reference. ";
          this.query.sparql +=
            " { ?source " + Global.ns + "hasLocation ?slocation. } ";
          this.query.sparql += " UNION ";
          this.query.sparql +=
            " { ?source " + Global.ns + "refersLocation ?slocation. } ";
          this.query.sparql +=
            "?slocation " + Global.ns + "name ?sourceLocation ";
          this.query.sparql +=
            ' FILTER ( ?sourceLocation = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Reference Source Filter
        var index = getFilter("Reference Source");
        if (index != -1) {
          this.query.sparql +=
            " ?source " + Global.ns + "hasReference ?reference.";
          this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
          this.query.sparql +=
            ' FILTER ( ?sourceName = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        var index = getFilter("Date Period");
        if (index != -1) {
          this.query.sparql += "?source " + Global.ns + "year ?sourceDate. ";
          this.query.sparql +=
            "FILTER( ?sourceDate >  " +
            this.options.filters[index].data.yearFrom +
            " ). ";
          this.query.sparql +=
            "FILTER( ?sourceDate <  " +
            this.options.filters[index].data.yearTo +
            " ). ";
        }

        this.query.sparql += " } GROUP BY ?nameVariant ";
        this.query.sparql += " OFFSET " + this.query.offset;
        this.query.sparql += " LIMIT  " + this.query.limit;
      }
      // Case 02: SELECT [ALL] [Drug Components]
      else if (this.query.code === "02") {
        // This is to show the correct results format
        this.query.resultFormat = "DRUG";

        // This is the resource type to load when clicking the item (plant, drug etc)
        this.query.resourceType = "DRUG";

        this.query.sparql +=
          "SELECT ?name ?nameVariant ?pPlant ?lineNumber ?barcode ?id ?language ?sourceName ?sourceLanguage ?sourceDate ?sourceLocation ?slatitude ?slongitude ?use ?familyName ?ppart ";
        this.query.sparql += fromGraphs;
        this.query.sparql += "WHERE { ";
        this.query.sparql += "?dc a " + Global.ns + "DrugComponent. ";
        this.query.sparql += "?dc " + Global.ns + "name ?name. ";
        this.query.sparql += "?dc " + Global.ns + "hasNameVariant ?nv. ";
        this.query.sparql += "?nv " + Global.ns + "nameVariant ?nameVariant. ";
        this.query.sparql += "?reference " + Global.ns + "refersTo ?nv. ";

        this.query.sparql +=
          "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?source " + Global.ns + "hasReference ?reference.";
        this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "language ?sourceLanguage. }.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "year ?sourceDate. }.";
        this.query.sparql += "OPTIONAL { ";
        this.query.sparql +=
          " { ?source " +
          Global.ns +
          "hasLocation ?slocation. } UNION { ?source " +
          Global.ns +
          "refersLocation ?slocation. } ";
        this.query.sparql +=
          "?slocation " + Global.ns + "name ?sourceLocation ";
        this.query.sparql += " }. ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL { ";
        this.query.sparql += " {  ";
        this.query.sparql += "?source " + Global.ns + "hasLocation ?sPoint. ";
        this.query.sparql += " } UNION  {  ";
        this.query.sparql +=
          "?source " + Global.ns + "refersLocation ?sPoint. ";
        this.query.sparql += " }. ";
        this.query.sparql += "?sPoint " + Global.ns + "latitude ?slatitude. ";
        this.query.sparql += "?sPoint " + Global.ns + "longitude ?slongitude. ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL { ";
        this.query.sparql += " ?reference " + Global.ns + "refersUse ?u. ";
        this.query.sparql += " ?u " + Global.ns + "description ?use. ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL { ";
        this.query.sparql += "?reference " + Global.ns + "isMadeFrom ?part. ";
        this.query.sparql += "?part " + Global.ns + "name ?ppart ";
        this.query.sparql += " }. ";

        /*
        this.query.sparql += 'OPTIONAL {';
        this.query.sparql += ' ?reference ' + Global.ns + 'referredToBeProducedBy ?plantReference.';
        this.query.sparql += ' ?plantReference ' + Global.ns + 'refersTo ?plantNv.';
        this.query.sparql += ' ?plantSpecies ' + Global.ns + 'hasNameVariant ?plantNv.';
        this.query.sparql += ' ?plantSpecies ' + Global.ns + 'name ?pPlant. ';
        this.query.sparql += ' ?plantSpecies ' + Global.ns + 'hasFamily ?plantFamily.';
        this.query.sparql += ' ?plantFamily ' + Global.ns + 'name ?familyName '; 
        this.query.sparql += ' }. ';
        */

        // Plant Species Filter
        var index = getFilter("Plant Species");
        if (index != -1) {
          this.query.networkPlant = this.options.filters[index].data.name;

          this.query.sparql +=
            " ?reference " +
            Global.ns +
            "referredToBeProducedBy ?plantReference.";
          this.query.sparql +=
            " ?plantReference " + Global.ns + "refersTo ?plantNv.";
          this.query.sparql +=
            " ?plantNv " + Global.ns + "nameVariant ?plantNameVariant.";
          this.query.sparql +=
            ' FILTER ( ?plantNameVariant = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Plant Family Filter
        var index = getFilter("Plant Family");
        if (index != -1) {
          this.query.sparql +=
            " ?reference " +
            Global.ns +
            "referredToBeProducedBy ?plantReference.";
          this.query.sparql +=
            " ?plantReference " + Global.ns + "refersTo ?plantNameVariant.";
          this.query.sparql +=
            " ?plantSpecies " + Global.ns + "hasNameVariant ?plantNameVariant.";
          this.query.sparql +=
            " ?plantSpecies " + Global.ns + "hasFamily ?plantFamily.";
          this.query.sparql +=
            " ?plantFamily " + Global.ns + "name ?familyName. ";
          this.query.sparql +=
            ' FILTER ( ?familyName = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Location Filter
        var index = getFilter("Location");
        if (index != -1) {
          this.query.sparql +=
            "?reference " + Global.ns + "refersLocation ?location. ";
          this.query.sparql +=
            "?localtion " + Global.ns + "name ?locationName. ";
          this.query.sparql +=
            ' FILTER ( ?locationName = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Plant Part Filter
        var index = getFilter("Plant Part");
        if (index != -1) {
          this.query.networkPlantPart = this.options.filters[index].data.name;

          this.query.sparql += "?reference " + Global.ns + "isMadeFrom ?part. ";
          this.query.sparql += "?part " + Global.ns + "name ?ppart. ";
          this.query.sparql +=
            ' FILTER ( ?ppart = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Reference Source Filter
        var index = getFilter("Reference Source");
        if (index != -1) {
          this.query.sparql +=
            " ?source " + Global.ns + "hasReference ?reference.";
          this.query.sparql += " ?source " + Global.ns + "name ?sourceName. ";
          this.query.sparql +=
            ' FILTER ( ?sourceName = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        var index = getFilter("Date Period");
        if (index != -1) {
          this.query.sparql += "?source " + Global.ns + "year ?sourceDate. ";
          this.query.sparql +=
            "FILTER( ?sourceDate >  " +
            this.options.filters[index].data.yearFrom +
            " ). ";
          this.query.sparql +=
            "FILTER( ?sourceDate <  " +
            this.options.filters[index].data.yearTo +
            " ). ";
        }

        this.query.sparql += " } GROUP BY ?name ";

        this.query.sparql += " OFFSET " + this.query.offset;
        this.query.sparql += " LIMIT  " + this.query.limit;
      }
      // Case 03: SELECT [ALL] [Reference Sources]
      else if (this.query.code === "03") {
        // This is to show the correct results format
        this.query.resultFormat = "SOURCE";

        // This is the resource type to load when clicking the item (plant, drug etc)
        this.query.resourceType = "SOURCE";

        this.query.sparql +=
          "SELECT DISTINCT ?sourceName ?lineNumber ?barcode ?id  ?sourceLanguage ?sourceDate ?sourceAuthor ?sourceLocation ?slatitude ?slongitude ?sourceUrl ?sourceDescription ?sourceType ";
        this.query.sparql += fromGraphs;
        this.query.sparql += "WHERE { ";
        this.query.sparql += "?source a " + Global.ns + "ReferenceSource. ";

        if (this.options.from) {
          this.query.sparql +=
            "?nv " +
            Global.ns +
            'nameVariant "' +
            this.options.from.data.name +
            '"^^xsd:string.';
          this.query.sparql += "?reference " + Global.ns + "refersTo ?nv. ";
          this.query.sparql +=
            "?source " + Global.ns + "hasReference ?reference. ";

          this.query.sparql +=
            "OPTIONAL { ?reference " +
            Global.ns +
            "lineNumber ?lineNumber.  }. ";
          this.query.sparql +=
            "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
          this.query.sparql +=
            "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";
        }

        this.query.sparql += "?source " + Global.ns + "name ?sourceName. ";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "language ?sourceLanguage. }. ";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "year ?sourceDate. }. ";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "url ?sourceUrl. }. ";
        this.query.sparql +=
          "OPTIONAL { ?source " +
          Global.ns +
          "description ?sourceDescription. }. ";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "type ?sourceType. }. ";
        this.query.sparql +=
          "OPTIONAL { ?source " +
          Global.ns +
          "hasAuthor ?a. ?a " +
          Global.ns +
          "name ?sourceAuthor }. ";

        this.query.sparql += "OPTIONAL { ";
        this.query.sparql +=
          " { ?source " +
          Global.ns +
          "hasLocation ?slocation. } UNION { ?source " +
          Global.ns +
          "refersLocation ?slocation. } ";
        this.query.sparql +=
          "?slocation " + Global.ns + "name ?sourceLocation ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL { ";
        this.query.sparql += " {  ";
        this.query.sparql += "?source " + Global.ns + "hasLocation ?sPoint. ";
        this.query.sparql += " } UNION  {  ";
        this.query.sparql +=
          "?source " + Global.ns + "refersLocation ?sPoint. ";
        this.query.sparql += " }. ";
        this.query.sparql += "?sPoint " + Global.ns + "latitude ?slatitude. ";
        this.query.sparql += "?sPoint " + Global.ns + "longitude ?slongitude. ";
        this.query.sparql += " }. ";

        // Language Filter
        var index = getFilter("Language");
        if (index != -1) {
          this.query.sparql +=
            " ?source " + Global.ns + "language ?sourceLanguage ";
          this.query.sparql +=
            ' FILTER ( ?sourceLanguage = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Location Filter
        var index = getFilter("Publication Location");
        if (index != -1) {
          this.query.sparql +=
            "?source " + Global.ns + "hasReference ?reference. ";
          this.query.sparql +=
            " { ?source " + Global.ns + "hasLocation ?slocation. } ";
          this.query.sparql += " UNION ";
          this.query.sparql +=
            " { ?source " + Global.ns + "refersLocation ?slocation. } ";
          this.query.sparql +=
            "?slocation " + Global.ns + "name ?sourceLocation ";
          this.query.sparql +=
            ' FILTER ( ?sourceLocation = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        this.query.sparql += " } ";
        this.query.sparql += " OFFSET " + this.query.offset;
        this.query.sparql += " LIMIT  " + this.query.limit;
      }

      // Case 04: SELECT [ALL] [Plant Species]
      else if (this.query.code === "04") {
        // This is to show the correct results format
        this.query.resultFormat = "PLANT";

        // This is the resource type to load when clicking the item (plant, drug etc)
        this.query.resourceType = "PLANT";

        this.query.sparql +=
          "SELECT DISTINCT ?plantName ?nameVariant  ?familyName ?genusName ?pDrug ?lineNumber ?barcode ?id ?language ?locationName ?latitude ?longitude ?sourceName ?sourceLanguage ?sourceDate ?use ";
        this.query.sparql += fromGraphs;
        this.query.sparql += "WHERE { ";
        this.query.sparql += "?plant a " + Global.ns + "Plant. ";
        this.query.sparql += "?plant " + Global.ns + "name ?plantName. ";
        this.query.sparql += "?plant " + Global.ns + "hasNameVariant ?nv. ";
        this.query.sparql += "?nv " + Global.ns + "nameVariant ?nameVariant. ";
        this.query.sparql += "?reference " + Global.ns + "refersTo ?nv. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql += " ?plant " + Global.ns + "hasFamily ?family.";
        this.query.sparql += " ?family " + Global.ns + "name ?familyName.";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql += " ?plant " + Global.ns + "hasGenus ?genus.";
        this.query.sparql += " ?genus " + Global.ns + "name ?genusName.";
        this.query.sparql += " }. ";

        this.query.sparql +=
          "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

        this.query.sparql += "OPTIONAL { ";
        this.query.sparql += " ?reference " + Global.ns + "refersUse ?u. ";
        this.query.sparql += " ?u " + Global.ns + "description ?use. ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?reference " + Global.ns + "refersLocation ?location.";
        this.query.sparql += " ?location " + Global.ns + "name ?locationName.";
        this.query.sparql += "OPTIONAL {";
        this.query.sparql += " ?location " + Global.ns + "latitude ?latitude.";
        this.query.sparql +=
          " ?location " + Global.ns + "longitude ?longitude.";
        this.query.sparql += " }. ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?source " + Global.ns + "hasReference ?reference.";
        this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "language ?sourceLanguage. }.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "year ?sourceDate. }.";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?drugReference " + Global.ns + "referredToBeProducedBy ?reference.";
        this.query.sparql +=
          " ?drugReference " + Global.ns + "refersTo ?drugNv.";
        this.query.sparql += " ?drug a " + Global.ns + "DrugComponent. ";
        this.query.sparql += " ?drug " + Global.ns + "hasNameVariant ?drugNv.";
        this.query.sparql += " ?drug " + Global.ns + "name ?pDrug.";
        this.query.sparql += " }. ";

        var index = getFilter("Drug Component");
        if (index != -1) {
          this.query.sparql +=
            " ?drugReference " +
            Global.ns +
            "referredToBeProducedBy ?reference.";
          this.query.sparql +=
            " ?drugReference " + Global.ns + "refersTo ?drugNv.";
          this.query.sparql += " ?drug a " + Global.ns + "DrugComponent. ";
          this.query.sparql +=
            " ?drug " + Global.ns + "hasNameVariant ?drugNv.";
          this.query.sparql += " ?drug " + Global.ns + "name ?pDrug.";
          this.query.sparql +=
            ' FILTER ( ?pDrug = "' +
            this.options.filters[index].data.drugName +
            '"^^xsd:string). ';
        }

        var index = getFilter("Date Period");
        if (index != -1) {
          this.query.sparql += "?source " + Global.ns + "year ?sourceDate. ";
          this.query.sparql +=
            "FILTER( ?sourceDate >  " +
            this.options.filters[index].data.yearFrom +
            " ). ";
          this.query.sparql +=
            "FILTER( ?sourceDate <  " +
            this.options.filters[index].data.yearTo +
            " ). ";
        }

        this.query.sparql += " } ";
        this.query.sparql += " OFFSET " + this.query.offset;
        this.query.sparql += " LIMIT  " + this.query.limit;
      }
      // Case 05: SELECT [ALL] [Locations]
      else if (this.query.code === "05") {
        // This is to show the correct results format
        this.query.resultFormat = "LOCATION";

        // This is the resource type to load when clicking the item (plant, drug etc)
        this.query.resourceType = "LOCATION";

        this.query.sparql +=
          "SELECT DISTINCT ?locationName ?type ?lineNumber ?barcode ?id  ?latitude ?longitude ?sourceName ?sourceLanguage ?sourceDate ";
        this.query.sparql += fromGraphs;
        this.query.sparql += "WHERE { ";

        this.query.sparql += "?concept " + Global.ns + "hasNameVariant ?nv. ";
        this.query.sparql += "?reference " + Global.ns + "refersTo ?nv. ";

        //From Dataset
        if (this.options.from) {
          if (this.options.from.code == 1) {
            this.query.sparql +=
              "?concept " +
              Global.ns +
              'name "' +
              this.options.from.data.plantName +
              '"^^xsd:string. ';
          } else if (this.options.from.code == 2) {
            this.query.sparql +=
              "?concept " +
              Global.ns +
              'name "' +
              this.options.from.data.drugName +
              '"^^xsd:string. ';
          }
        }

        this.query.sparql +=
          "?reference " + Global.ns + "refersLocation ?location. ";

        this.query.sparql += "OPTIONAL { ";
        this.query.sparql += " ?location " + Global.ns + "name ?locationName. ";
        this.query.sparql += " }. ";

        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?source " + Global.ns + "hasReference ?reference.";
        this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "language ?sourceLanguage. }.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "date ?sourceDate. }.";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?reference " + Global.ns + "refersLocation ?point. ";
        this.query.sparql +=
          " OPTIONAL{ ?reference " +
          Global.ns +
          "locationPropertyType ?type. }.";
        this.query.sparql += " ?point " + Global.ns + "latitude ?latitude.";
        this.query.sparql += " ?point " + Global.ns + "longitude ?longitude.";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?reference " + Global.ns + "refersSpecimen ?sp. ";
        this.query.sparql += " ?sp " + Global.ns + "refersLocation ?loc. ";
        this.query.sparql += " ?loc " + Global.ns + "latitude ?latitude.";
        this.query.sparql += " ?loc " + Global.ns + "longitude ?longitude.";
        this.query.sparql += " }. ";

        this.query.sparql += " } ";
        this.query.sparql += " OFFSET " + this.query.offset;
        this.query.sparql += " LIMIT  " + this.query.limit;
      }
      //
      // CASES THAT REQUIRE REASONING
      //
      // Case 11: SELECT [FIRST USED] [Name Variant]
      else if (this.query.code === "11") {
        // This is to show the correct results format
        this.query.resultFormat = "VARIANT";

        // This is the resource type to load when clicking the item (plant, drug etc)
        if (this.options.from) {
          if (this.options.from.code == 1) {
            this.query.resourceType = "PLANT";
            this.query.resourceName = this.options.from.data.name;
            this.query.resourceConcept = this.options.from.data.plantName;
          } else if (this.options.from.code == 2) {
            this.query.resourceType = "DRUG";
            this.query.resourceName = this.options.from.data.name;
            this.query.resourceConcept = this.options.from.data.drugName;
          }
        }

        this.query.sparql +=
          "SELECT  ?nameVariant ?pPlant ?pDrug ?lineNumber ?barcode ?id ?language ?use ?locationName ?locationType ?latitude ?longitude ?sourceName ?sourceLanguage ?sourceDate ?sourceLocation  ";
        this.query.sparql += fromGraphs;
        this.query.sparql += "WHERE { ";
        //this.query.sparql += '?nv a ' + Global.ns + 'NameVariant. ';
        this.query.sparql += "?concept " + Global.ns + "hasNameVariant ?nv. ";
        //From Dataset
        if (this.options.from) {
          if (this.options.from.data.plantName) {
            this.query.sparql +=
              "?concept " +
              Global.ns +
              'name "' +
              this.options.from.data.plantName +
              '"^^xsd:string.';
          } else if (this.options.from.data.drugName) {
            this.query.sparql +=
              "?concept " +
              Global.ns +
              'name "' +
              this.options.from.data.drugName +
              '"^^xsd:string.';
          }
        }
        this.query.sparql += "?nv " + Global.ns + "nameVariant ?nameVariant. ";
        this.query.sparql += "?reference " + Global.ns + "refersTo ?nv. ";

        this.query.sparql +=
          "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

        this.query.sparql +=
          "OPTIONAL { ?reference " +
          Global.ns +
          "refersUse ?u. ?u " +
          Global.ns +
          "description ?use  }. ";

        this.query.sparql +=
          " ?source " + Global.ns + "hasReference ?reference.";
        this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
        this.query.sparql += " ?source " + Global.ns + "year ?sourceDate.  ";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "language ?sourceLanguage. }.";
        this.query.sparql += "OPTIONAL { ";
        this.query.sparql +=
          "?source " + Global.ns + "hasLocation ?slocation. ";
        this.query.sparql +=
          "?slocation " + Global.ns + "name ?sourceLocation ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?drugReference " + Global.ns + "referredToBeProducedBy ?reference.";
        this.query.sparql +=
          " ?drugReference " + Global.ns + "refersTo ?drugNameVariant.";
        this.query.sparql +=
          " ?drugNameVariant " + Global.ns + "nameVariant ?pDrug.";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?reference " +
          Global.ns +
          "referredToBeProducedBy ?plantReference.";
        this.query.sparql +=
          " ?plantReference " + Global.ns + "refersTo ?plantNameVariant.";
        this.query.sparql +=
          " ?plantNameVariant " + Global.ns + "nameVariant ?pPlant.";
        this.query.sparql += " }. ";

        // Language Filter
        var index = getFilter("Language");
        if (index != -1) {
          this.query.sparql += " ?nv " + Global.ns + "language ?language.";
          this.query.sparql +=
            ' FILTER ( ?language = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Location Filter
        var index = getFilter("Publication Location");
        if (index != -1) {
          this.query.sparql +=
            "?source " + Global.ns + "hasLocation ?location. ";
          this.query.sparql +=
            "?location " +
            Global.ns +
            'name "' +
            this.options.filters[index].data.name +
            '"^^xsd:string.';
        }

        // Reference Source Filter
        var index = getFilter("Reference Source");
        if (index != -1) {
          this.query.sparql +=
            " ?source " + Global.ns + "hasReference ?reference.";
          this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
          this.query.sparql +=
            ' FILTER ( ?sourceName = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        var index = getFilter("Date Period");
        if (index != -1) {
          this.query.sparql += "?source " + Global.ns + "year ?sourceDate. ";
          this.query.sparql +=
            "FILTER( ?sourceDate >  " +
            this.options.filters[index].data.yearFrom +
            " ). ";
          this.query.sparql +=
            "FILTER( ?sourceDate <  " +
            this.options.filters[index].data.yearTo +
            " ). ";
        }

        this.query.sparql += " } ORDER BY ASC(?sourceDate) ";
        this.query.sparql += " LIMIT 1";
        this.query.sparql += " OFFSET  0";
      }
      // Case 31: SELECT [MOST COMMON] [Name Variant]
      else if (this.query.code === "31") {
        // This is to show the correct results format
        this.query.resultFormat = "VARIANT";

        // This is the resource type to load when clicking the item (plant, drug etc)
        if (this.options.from) {
          if (this.options.from.code == 1) {
            this.query.resourceType = "PLANT";
            this.query.resourceName = this.options.from.data.name;
            this.query.resourceConcept = this.options.from.data.plantName;
          } else if (this.options.from.code == 2) {
            this.query.resourceType = "DRUG";
            this.query.resourceName = this.options.from.data.name;
            this.query.resourceConcept = this.options.from.data.drugName;
          }
        }

        this.query.sparql +=
          "SELECT DISTINCT COUNT(DISTINCT ?reference) AS ?variantCount  ?nameVariant ";
        this.query.sparql += fromGraphs;
        this.query.sparql += "WHERE { ";
        //this.query.sparql += '?nv a ' + Global.ns + 'NameVariant. ';
        this.query.sparql += "?concept " + Global.ns + "hasNameVariant ?nv. ";
        //From Dataset
        if (this.options.from) {
          if (this.options.from.data.plantName) {
            this.query.sparql +=
              "?concept " +
              Global.ns +
              'name "' +
              this.options.from.data.plantName +
              '"^^xsd:string.';
          } else if (this.options.from.data.drugName) {
            this.query.sparql +=
              "?concept " +
              Global.ns +
              'name "' +
              this.options.from.data.drugName +
              '"^^xsd:string.';
          }
        }
        this.query.sparql += "?nv " + Global.ns + "nameVariant ?nameVariant. ";
        this.query.sparql += "?reference " + Global.ns + "refersTo ?nv. ";

        this.query.sparql +=
          "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
        this.query.sparql +=
          "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";

        this.query.sparql +=
          "OPTIONAL { ?reference " +
          Global.ns +
          "refersUse ?u. ?u " +
          Global.ns +
          "description ?use  }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?reference " + Global.ns + "refersLocation ?location.";
        this.query.sparql += " ?location " + Global.ns + "name ?locationName. ";
        this.query.sparql +=
          "OPTIONAL { ?location " +
          Global.ns +
          "locationType ?locationType. }. ";
        this.query.sparql += "OPTIONAL {";
        this.query.sparql += " ?location " + Global.ns + "latitude ?latitude.";
        this.query.sparql +=
          " ?location " + Global.ns + "longitude ?longitude.";
        this.query.sparql += " }. ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?source " + Global.ns + "hasReference ?reference.";
        this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "language ?sourceLanguage. }.";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "year ?sourceDate. }.";
        this.query.sparql += "OPTIONAL { ";
        this.query.sparql +=
          "?source " + Global.ns + "hasLocation ?slocation. ";
        this.query.sparql +=
          "?slocation " + Global.ns + "name ?sourceLocation ";
        this.query.sparql += " }. ";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?drugReference " + Global.ns + "referredToBeProducedBy ?reference.";
        this.query.sparql +=
          " ?drugReference " + Global.ns + "refersTo ?drugNameVariant.";
        this.query.sparql +=
          " ?drugNameVariant " + Global.ns + "nameVariant ?pDrug.";
        this.query.sparql += " }. ";

        this.query.sparql += "OPTIONAL {";
        this.query.sparql +=
          " ?reference " +
          Global.ns +
          "referredToBeProducedBy ?plantReference.";
        this.query.sparql +=
          " ?plantReference " + Global.ns + "refersTo ?plantNameVariant.";
        this.query.sparql +=
          " ?plantNameVariant " + Global.ns + "nameVariant ?pPlant.";
        this.query.sparql += " }. ";

        // Language Filter
        var index = getFilter("Language");
        if (index != -1) {
          this.query.sparql += " ?nv " + Global.ns + "language ?language.";
          this.query.sparql +=
            ' FILTER ( ?language = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Location Filter
        var index = getFilter("Publication Location");
        if (index != -1) {
          this.query.sparql +=
            "?source " + Global.ns + "hasReference ?reference. ";
          this.query.sparql +=
            "?source " + Global.ns + "hasLocation ?location. ";
          this.query.sparql +=
            "?location " +
            Global.ns +
            'name "' +
            this.options.filters[index].data.name +
            '"^^xsd:string.';
        }

        // Reference Source Filter
        var index = getFilter("Reference Source");
        if (index != -1) {
          this.query.sparql +=
            " ?source " + Global.ns + "hasReference ?reference.";
          this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
          this.query.sparql +=
            ' FILTER ( ?sourceName = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        var index = getFilter("Date Period");
        if (index != -1) {
          this.query.sparql += "?source " + Global.ns + "year ?sourceDate. ";
          this.query.sparql +=
            "FILTER( ?sourceDate >  " +
            this.options.filters[index].data.yearFrom +
            " ). ";
          this.query.sparql +=
            "FILTER( ?sourceDate <  " +
            this.options.filters[index].data.yearTo +
            " ). ";
        }

        this.query.sparql += " } GROUP BY ?nameVariant ";
        this.query.sparql += " ORDER BY DESC(?variantCount) ";
        this.query.sparql += " LIMIT 10";
        this.query.sparql += " OFFSET  0";
      }
      // Case 41: SELECT [AMBIGUOUS] [Name Variant]
      else if (this.query.code === "41") {
        // This is to show the correct results format
        this.query.resultFormat = "VARIANT";

        // This is the resource type to load when clicking the item (plant, drug etc)
        if (this.options.from) {
          if (this.options.from.code == 1) {
            this.query.resourceType = "PLANT";
            this.query.resourceName = this.options.from.data.name;
            this.query.resourceConcept = this.options.from.data.plantName;
          } else if (this.options.from.code == 2) {
            this.query.resourceType = "DRUG";
            this.query.resourceName = this.options.from.data.name;
            this.query.resourceConcept = this.options.from.data.drugName;
          }
        }

        this.query.sparql +=
          "SELECT DISTINCT ?nameVariant ?ambiguous1 ?ambiguous2 ";
        this.query.sparql += fromGraphs;
        this.query.sparql += "WHERE { ";
        //this.query.sparql += '?nv a ' + Global.ns + 'NameVariant. ';
        this.query.sparql += "?c1 " + Global.ns + "name ?ambiguous1. ";
        this.query.sparql += "?c1 " + Global.ns + "hasNameVariant ?nv. ";
        this.query.sparql += "?c2 " + Global.ns + "name ?ambiguous2. ";
        this.query.sparql += "?c2 " + Global.ns + "hasNameVariant ?nv. ";

        this.query.sparql += "?nv " + Global.ns + "nameVariant ?nameVariant. ";
        this.query.sparql += "?reference " + Global.ns + "refersTo ?nv. ";
        //From Dataset
        if (this.options.from) {
          if (this.options.from.data.name) {
            this.query.sparql +=
              "?nv " +
              Global.ns +
              'nameVariant "' +
              this.options.from.data.name +
              '"^^xsd:string.';
          }
        }

        this.query.sparql += " FILTER(?ambiguous1 > ?ambiguous2). ";

        // Language Filter
        var index = getFilter("Language");
        if (index != -1) {
          this.query.sparql += " ?nv " + Global.ns + "language ?language.";
          this.query.sparql +=
            ' FILTER ( ?language = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Location Filter
        var index = getFilter("Publication Location");
        if (index != -1) {
          this.query.sparql +=
            "?source " + Global.ns + "hasReference ?reference. ";
          this.query.sparql +=
            "?source " + Global.ns + "hasLocation ?location. ";
          this.query.sparql +=
            "?location " +
            Global.ns +
            'name "' +
            this.options.filters[index].data.name +
            '"^^xsd:string.';
        }

        // Reference Source Filter
        var index = getFilter("Reference Source");
        if (index != -1) {
          this.query.sparql +=
            " ?source " + Global.ns + "hasReference ?reference.";
          this.query.sparql += " ?source " + Global.ns + "name ?sourceName.";
          this.query.sparql +=
            ' FILTER ( ?sourceName = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        var index = getFilter("Date Period");
        if (index != -1) {
          this.query.sparql += "?source " + Global.ns + "year ?sourceDate. ";
          this.query.sparql +=
            "FILTER( ?sourceDate >  " +
            this.options.filters[index].data.yearFrom +
            " ). ";
          this.query.sparql +=
            "FILTER( ?sourceDate <  " +
            this.options.filters[index].data.yearTo +
            " ). ";
        }

        this.query.sparql += " } ";
        this.query.sparql += " LIMIT 300";
        this.query.sparql += " OFFSET  0";
      }
      // Case 13: SELECT [FIRST] [Reference Sources]
      else if (this.query.code === "13") {
        // This is to show the correct results format
        this.query.resultFormat = "SOURCE";

        // This is the resource type to load when clicking the item (plant, drug etc)
        this.query.resourceType = "SOURCE";

        this.query.sparql +=
          "SELECT DISTINCT ?sourceName ?lineNumber ?barcode ?id  ?sourceLanguage ?sourceDate ?sourceAuthor ?sourceLocation ?sourceUrl ?sourceDescription ?sourceType ";
        this.query.sparql += fromGraphs;
        this.query.sparql += "WHERE { ";
        this.query.sparql += "?source a " + Global.ns + "ReferenceSource. ";

        if (this.options.from) {
          this.query.sparql +=
            "?nv " +
            Global.ns +
            'nameVariant "' +
            this.options.from.data.name +
            '"^^xsd:string.';
          this.query.sparql += "?reference " + Global.ns + "refersTo ?nv. ";
          this.query.sparql +=
            "?source " + Global.ns + "hasReference ?reference. ";

          this.query.sparql +=
            "OPTIONAL { ?reference " +
            Global.ns +
            "lineNumber ?lineNumber.  }. ";
          this.query.sparql +=
            "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
          this.query.sparql +=
            "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";
        }

        this.query.sparql += "?source " + Global.ns + "name ?sourceName. ";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "language ?sourceLanguage. }. ";
        this.query.sparql += " ?source " + Global.ns + "year ?sourceDate.  ";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "url ?sourceUrl. }. ";
        this.query.sparql +=
          "OPTIONAL { ?source " +
          Global.ns +
          "description ?sourceDescription. }. ";
        this.query.sparql +=
          "OPTIONAL { ?source " + Global.ns + "type ?sourceType. }. ";
        this.query.sparql +=
          "OPTIONAL { ?source " +
          Global.ns +
          "hasAuthor ?a. ?a " +
          Global.ns +
          "name ?sourceAuthor }. ";

        this.query.sparql += "OPTIONAL { ";
        this.query.sparql +=
          "?source " + Global.ns + "hasLocation ?slocation. ";
        this.query.sparql += "?slocation " + Global.ns + "name ?sourceLocation";
        this.query.sparql += " }. ";

        // Language Filter
        var index = getFilter("Language");
        if (index != -1) {
          this.query.sparql +=
            " ?source " + Global.ns + "language ?sourceLanguage ";
          this.query.sparql +=
            ' FILTER ( ?sourceLanguage = "' +
            this.options.filters[index].data.name +
            '"^^xsd:string). ';
        }

        // Location Filter
        var index = getFilter("Publication Location");
        if (index != -1) {
          this.query.sparql +=
            "?source " + Global.ns + "hasReference ?reference. ";
          this.query.sparql +=
            "?source " + Global.ns + "hasLocation ?location. ";
          this.query.sparql +=
            "?location " +
            Global.ns +
            'name "' +
            this.options.filters[index].data.name +
            '"^^xsd:string.';
        }

        this.query.sparql += " } ORDER BY ASC(?sourceDate) ";
        this.query.sparql += " LIMIT 1";
        this.query.sparql += " OFFSET  0";
      }

      // Undefined Query Pattern
      else {
        this.query.sparql = false;
      }
    }

    function init() {}
  }
})();
