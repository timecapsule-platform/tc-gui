var SpellingVariantOptions =
{
    name: "Name Variant(s)",
    text: "Show me",
    type: "select",
    bg: "query-blue",
    from:
    [
        {
            name: "Plant Species",
            type: "from",
            text: "of",
            bg: "query-grey",
            icon: "circle-green.svg",
            datasource: $scope.data.plants,
            data: null
        },
        {
            name: "Drug Components",
            type: "from",
            text: "of",
            bg: "query-grey",
            icon: "circle-pink.svg",
            datasource: $scope.data.drugs,
            data: null
        }

    ],
    criteria:
    [
        {
            name: "All",
            type: "criteria",
            bg: "query-purple"
        },
        {
            name: "First Used",
            type: "criteria",
            bg: "query-purple"
        },
        {
            name: "Most Common",
            type: "criteria",
            bg: "query-purple"
        },
        {
            name: "Ambiguous",
            type: "criteria",
            bg: "query-purple"
        }

    ],
    filters:
    [
        {
            name: "Language",
            type: "filter",
            text: "in language",
            bg: "query-grey",
            icon: "circle-red.svg",
            datasource: $scope.data.languages,
            data: null
        },
        {
            name: "Date Period",
            type: "filter",
            text: "during date period",
            bg: "query-grey",
            icon: "circle-cyan.svg"
        },
        {
            name: "Location",
            type: "filter",
            text: "at location",
            bg: "query-grey",
            icon: "circle-orange.svg",
            datasource: $scope.data.locations,
            data: null
        },
        {
            name: "Reference Source",
            type: "filter",
            text: "referenced in",
            bg: "query-grey",
            icon: "circle-yellow.svg",
            datasource: $scope.data.sources,
            data: null
        }
    ],
    extra:
    [
        {
            name: "Language",
            type: "extra",
            bg: "query-red"
        },
        {
            name: "Date Period",
            type: "extra",
            bg: "query-cyan"
        },
        {
            name: "Location",
            type: "extra",
            bg: "query-orange"
        },
        {
            name: "Reference Source",
            type: "extra",
            bg: "query-yellow"
        }

    ]

}