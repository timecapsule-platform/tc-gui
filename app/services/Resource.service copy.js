(function () {
  "use strict";

  angular.module("TIMECAPSULE").factory("Resource", Resource);

  Resource.$inject = [
    "$http",
    "Global",
    "Util",
    "ErrorHandler",
    "QueryFactory",
    "DBpediaFactory",
    "PlantsFactory",
  ];

  function Resource(
    $http,
    Global,
    Util,
    ErrorHandler,
    QueryFactory,
    DBpediaFactory,
    PlantsFactory
  ) {
    var factory = {};

    // All loading elements
    factory.isLoading = {
      page: false,
      create: false,
      edit: false,
      delete: false,
      dbpedia: false,
      variants: false,
      pDrugs: false,
      sources: false,
      references: false,
      uses: false,
    };

    factory.name = "";
    factory.type = null;

    factory.qf = QueryFactory;

    factory.references = [];
    factory.variants = [];
    factory.plants = [];
    factory.drugs = [];
    factory.sources = [];

    factory.location = { name: null, latitude: null, longtitude: null };
    factory.source = { name: null, language: null, date: null };

    factory.Get = Get;
    factory.Clear = Clear;
    factory.GetPlantInfo = GetPlantInfo;
    factory.GetPlantNameVariants = GetPlantNameVariants;
    factory.GetPlantNameOfVariant = GetPlantNameOfVariant;

    factory.GetResourceInfo = GetResourceInfo;
    factory.GetConceptNameVariants = GetConceptNameVariants;

    factory.init = init;

    return factory;

    function Clear() {
      factory.references = [];
      factory.variants = [];
      factory.plants = [];
      factory.drugs = [];
      factory.sources = [];
    }

    function Get(name, type, concept) {
      // Clear the previous Resource
      Clear();

      factory.name = name;
      factory.type = type;

      console.log("type:");
      console.log(type);

      if (type == "VARIANT") {
        // this.GetPlantNameOfVariant(name);
        this.GetResourceInfo(name);

        //factory.plant = getPlantNameForDBpedia(name);
        //getPlantDBpediaInfo(name);
      } else if (type == "PLANT") {
        // DBPedia Information
        //factory.plant = getPlantNameForDBpedia(name);
        //getPlantDBpediaInfo(name);

        this.GetResourceInfo(name);
      } else if (type == "DRUG") {
        this.GetResourceInfo(name);
      }
    }

    /*********************************************************************************************************/
    /************************************       RESOURCE (PLANT OR DRUG)          **************************************/

    /*********************************************************************************************************/

    function GetConceptNameVariants(name) {
      var sparql = "";

      sparql += "SELECT  ?name  ";
      sparql += "WHERE { ";
      sparql += "?p  " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?nv " + Global.ns + "nameVariant ?name. ";

      sparql += " } ORDER BY ASC(?name) ";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        if (!result.error) {
          var rawVariants = result.results.bindings;

          for (var i = 0; i < rawVariants.length; i++) {
            if (rawVariants[i].name) {
              var variant = rawVariants[i].name.value;
              if (!Util.exists(factory.variants, variant)) {
                factory.variants.push(variant);
              }
            }
          }
        }
      });
    }

    function GetResourceInfo(name) {
      var sparql = "";

      sparql +=
        "SELECT DISTINCT  ?name ?conceptName ?drugName ?drugVariant ?plantName ?plantVariant ?lineNumber ?barcode ?id   ?locationName ?latitude ?longtitude ?referenceSourceName ?referenceSourceDate ?referenceSourceLanguage ";
      sparql += "WHERE { ";
      //sparql += '?p a ' + Global.ns + 'Plant. ';
      //sparql += '?p  ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
      sparql += "?c " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?c " + Global.ns + "name ?conceptName. ";
      sparql += "?nv " + Global.ns + "nameVariant ?name. ";
      sparql += "?nv " + Global.ns + 'nameVariant "' + name + '"^^xsd:string. ';

      sparql += "OPTIONAL{  ?p a ex:Plant. ?p ex:hasNameVariant ?nv }.";
      //sparql += 'bind( IF(bound(?p), "PLANT", "DRUG") as ?conceptType).';

      sparql += "?reference " + Global.ns + "refersTo ?nv. ";
      sparql += "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
      sparql +=
        "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";
      sparql += "OPTIONAL {";
      sparql += " ?reference " + Global.ns + "refersLocation ?location.";
      sparql += " ?location " + Global.ns + "name ?locationName.";
      sparql += "OPTIONAL {";
      sparql += " ?location " + Global.ns + "latitude ?latitude.";
      sparql += " ?location " + Global.ns + "longtitude ?longtitude.";
      sparql += " }. ";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql += " ?referenceSource " + Global.ns + "hasReference ?reference.";
      sparql += " ?referenceSource " + Global.ns + "name ?referenceSourceName.";
      sparql +=
        "OPTIONAL { ?referenceSource " +
        Global.ns +
        "language ?referenceSourceLanguage. }.";
      sparql +=
        "OPTIONAL { ?referenceSource " +
        Global.ns +
        "date ?referenceSourceDate. }.";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql +=
        " ?drugReference " + Global.ns + "referredToBeProducedBy ?reference.";
      sparql += " ?drugReference " + Global.ns + "refersTo ?drugNameVariant.";
      sparql += " ?drugNameVariant " + Global.ns + "nameVariant ?drugVariant.";
      sparql += " ?drug " + Global.ns + "hasNameVariant ?drugNameVariant.";
      sparql += " ?drug " + Global.ns + "name ?drugName.";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql +=
        " ?reference " + Global.ns + "referredToBeProducedBy ?plantReference.";
      sparql += " ?plantReference " + Global.ns + "refersTo ?plantNameVariant.";
      sparql +=
        " ?plantNameVariant " + Global.ns + "nameVariant ?plantVariant.";
      sparql += " ?plant " + Global.ns + "hasNameVariant ?plantNameVariant.";
      sparql += " ?plant " + Global.ns + "name ?plantName.";
      sparql += " }. ";

      sparql += " } ORDER BY ASC(?name) LIMIT 100 OFFSET 0";

      console.log(sparql);

      factory.isLoading = true;

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        factory.isLoading = false;

        if (!result.error) {
          factory.references = result.results.bindings;

          if (factory.references.length) {
            factory.conceptName = factory.references[0].conceptName.value;
            factory.GetConceptNameVariants(factory.conceptName);
          }

          for (var i = 0; i < factory.references.length; i++) {
            //
            // PRODUCES DRUGS
            //
            if (factory.references[i].drugVariant) {
              var drug = {
                name: factory.references[i].drugName.value,
                variants: [],
              };

              var variant = factory.references[i].drugVariant.value;

              var index = Util.conceptExists(factory.drugs, drug);

              if (index == -1) {
                drug.variants.push(variant);
                factory.drugs.push(drug);
              } else {
                if (!Util.exists(factory.drugs[index].variants, variant)) {
                  factory.drugs[index].variants.push(variant);
                }
              }
            }

            //
            // PRODUCED BY PLANT
            //
            if (factory.references[i].plantVariant) {
              var plant = {
                name: factory.references[i].plantName.value,
                variants: [],
              };

              var variant = factory.references[i].plantVariant.value;

              var index = Util.conceptExists(factory.plants, plant);

              if (index == -1) {
                plant.variants.push(variant);
                factory.plants.push(plant);
              } else {
                if (!Util.exists(factory.plants[index].variants, variant)) {
                  factory.plants[index].variants.push(variant);
                }
              }
            }

            if (factory.references[i].referenceSourceName) {
              var source = factory.references[i].referenceSourceName.value;
              if (!Util.exists(factory.sources, source)) {
                factory.sources.push(source);
              }
            }
          }
        }
      });
    }

    /*********************************************************************************************************/
    /************************************       PLANT SPECIES           **************************************/

    /*********************************************************************************************************/

    function isPlant() {
      return true;
    }

    function GetPlantNameOfVariant(variant) {
      PlantsFactory.GetPlantOfVariant(variant).then(function (result) {
        if (!result.error) {
          factory.Get(variant, "PLANT", result.plantName);
        } else {
          ErrorHandler.handleErrorCode(result.code);
        }
      });
    }

    // Creates an object with the plant name, plant family
    function getPlantNameForDBpedia(name, author) {
      var plant = {};
      plant.name = name;

      // Remove the author
      if (author) {
        plant.name = name.replace(author, "");
      }

      var words = plant.name.split(" ");

      plant.family = words[0];

      if (words[1]) {
        plant.name = words[0] + " " + words[1];
      } else {
        plant.name = words[0];
      }

      return plant;
    }

    function parseDBpediaResult(result) {
      factory.dbpediaURL = null;
      factory.abstract = null;
      factory.thumb = null;

      if (result.results.bindings.length > 0) {
        if (result.results.bindings[0].resource) {
          factory.dbpediaURL = result.results.bindings[0].resource.value;
        }
        if (result.results.bindings[0].abstract) {
          factory.abstract = result.results.bindings[0].abstract.value;
        }
        if (result.results.bindings[0].thumb) {
          factory.thumb = result.results.bindings[0].thumb.value;
        }
      } else {
        getPlantDBpediaInfo(factory.plant.family);
      }
    }

    function getPlantDBpediaInfo(plantName) {
      var query = "";

      query += "SELECT ?resource ?abstract ?thumb ";
      query += "WHERE {";
      query += '?resource rdfs:label "' + plantName + '"@en.';
      query += "?resource  <http://dbpedia.org/ontology/abstract> ?abstract.";
      query += "?resource  <http://dbpedia.org/ontology/thumbnail> ?thumb.";
      query += 'FILTER langMatches(lang(?abstract), "en")';
      query += "}";

      DBpediaFactory.Query(query).then(function (result) {
        if (!result.error) {
          parseDBpediaResult(result);
        }
      });
    }

    function GetPlantNameVariants(name) {
      var sparql = "";

      sparql += "SELECT  ?name  ";
      sparql += "WHERE { ";
      sparql += "?p a " + Global.ns + "Plant. ";
      sparql += "?p  " + Global.ns + 'name "' + name + '"^^xsd:string. ';
      sparql += "?p " + Global.ns + "hasNameVariant ?nv. ";
      sparql += "?nv " + Global.ns + "nameVariant ?name. ";

      sparql += " } ORDER BY ASC(?name) ";

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        if (!result.error) {
          var rawVariants = result.results.bindings;

          for (var i = 0; i < rawVariants.length; i++) {
            if (rawVariants[i].name) {
              var variant = rawVariants[i].name.value;
              if (!Util.exists(factory.variants, variant)) {
                factory.variants.push(variant);
              }
            }
          }
        }
      });
    }

    function GetPlantInfo(name) {
      var sparql = "";

      sparql +=
        "SELECT  ?name ?lineNumber ?barcode ?id  ?drugName ?locationName ?latitude ?longtitude ?referenceSourceName ?referenceSourceDate ?referenceSourceLanguage ";
      sparql += "WHERE { ";
      //sparql += '?p a ' + Global.ns + 'Plant. ';
      //sparql += '?p  ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
      //sparql += '?p ' + Global.ns + 'hasNameVariant ?nv. ';
      sparql += "?nv " + Global.ns + "nameVariant ?name. ";
      sparql += "?nv " + Global.ns + 'nameVariant "' + name + '"^^xsd:string. ';
      sparql += "?reference " + Global.ns + "refersTo ?nv. ";
      sparql += "OPTIONAL { ?nv " + Global.ns + "language ?language.  }. ";
      sparql +=
        "OPTIONAL { ?reference " + Global.ns + "lineNumber ?lineNumber.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "barcode ?barcode.  }. ";
      sparql += "OPTIONAL { ?reference " + Global.ns + "id ?id.  }. ";
      sparql += "OPTIONAL {";
      sparql += " ?reference " + Global.ns + "refersLocation ?location.";
      sparql += " ?location " + Global.ns + "name ?locationName.";
      sparql += "OPTIONAL {";
      sparql += " ?location " + Global.ns + "latitude ?latitude.";
      sparql += " ?location " + Global.ns + "longtitude ?longtitude.";
      sparql += " }. ";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql += " ?referenceSource " + Global.ns + "hasReference ?reference.";
      sparql += " ?referenceSource " + Global.ns + "name ?referenceSourceName.";
      sparql +=
        "OPTIONAL { ?referenceSource " +
        Global.ns +
        "language ?referenceSourceLanguage. }.";
      sparql +=
        "OPTIONAL { ?referenceSource " +
        Global.ns +
        "date ?referenceSourceDate. }.";
      sparql += " }. ";

      sparql += "OPTIONAL {";
      sparql +=
        " ?drugReference " + Global.ns + "referredToBeProducedBy ?reference.";
      sparql += " ?drugReference " + Global.ns + "refersTo ?drugNameVariant.";
      sparql += " ?drugNameVariant " + Global.ns + "nameVariant ?drugName.";
      sparql += " }. ";

      sparql += " } ORDER BY ASC(?name) ";

      factory.isLoading = true;

      QueryFactory.ExecuteQuery(sparql).then(function (result) {
        factory.isLoading = false;

        if (!result.error) {
          var rawReferences = result.results.bindings;
          factory.references = [];

          // Eliminating duplicate references
          for (var i = 0; i < rawReferences.length; i++) {
            if (!Util.referenceExists(factory.references, rawReferences[i])) {
              factory.references.push(rawReferences[i]);
            }
          }

          for (var i = 0; i < factory.references.length; i++) {
            if (factory.references[i].drugName) {
              var drug = factory.references[i].drugName.value;
              if (!Util.exists(factory.drugs, drug)) {
                factory.drugs.push(drug);
              }
            }

            if (factory.references[i].referenceSourceName) {
              var source = factory.references[i].referenceSourceName.value;
              if (!Util.exists(factory.sources, source)) {
                factory.sources.push(source);
              }
            }
          }
        }
      });
    }

    /****************************************** END OF PLANT SPECIES  **********************************************/

    function init() {}
  }
})();
