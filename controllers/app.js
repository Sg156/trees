
'use strict';
var app = angular.module('trees', ['ngAnimate','ngTouch', 'ui.grid','ui.grid.edit','ui.grid.resizeColumns',
'ui.grid.moveColumns',  'ui.grid.pagination','ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter','ui.grid.cellNav', 'ui.grid.validate']);



app.controller('MainCtrl', ['$scope', '$http', '$window', 'uiGridConstants', 'uiGridValidateService', 'mapConditionFilter', 'mapSpeciesFilter', function ($scope, $http, $window, uiGridConstant, uiGridValidateService, mapConditionFilter, mapSpeciesFilter) {

$scope.highlightFilteredHeader = function( row, rowRenderIndex, col, colRenderIndex ) {
    if( col.filters[0].term ){
      return 'header-filtered';
    } else {
      return '';
    }
  };

  $scope.gridOptions = {
columnDefs: [

      { field: 'Id'},
      { field: 'Address',headerCellClass: $scope.highlightFilteredHeader},
      { field: 'Street'},
      { field: 'Side' },
      { field: 'Site', type: 'number'},
      { field: 'Species', filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters"><div my-custom-dropdown></div></div>', 
        filter: { 
          options: [
             {id: 1, value: 'Acer Rubrum'}, 
             {id: 2, value: 'Vacant Planting Site'},
             {id: 3, value: 'Fraxinus spp.'}]  
        } ,editableCellTemplate: 'ui-grid/dropdownEditor',
      editDropdownValueLabel: 'Species',cellFilter: 'mapSpecies', editDropdownOptionsArray: [
      { id: 1, Species: 'Acer Rubrum' },
      { id: 2, Species: 'Vacant Planting Site' },
      { id: 3, Species: 'Fraxinus spp.' }
    ],
   validators: {
         required: true,compareSpecies: ''
   }, 
   cellTemplate: 'ui-grid/cellTitleValidator'

 },
      { field: 'Dbh', type: 'number',validators: {
         required: true,compareDbh: ''
   }, 
   cellTemplate: 'ui-grid/cellTitleValidator' },
      { 
        field: 'Condition', filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters"><div my-custom-dropdown></div></div>', 
        filter: { 
          options: [
            {id:1,value:'Good'},
            {id:2,value:'Fair' },
            {id:3,value:'Poor'},
            {id:4,value:'Dead'},
            {id:5,value:'N/A'}
           ]  
        },
   validators: {
         required: true,compareCondition: ''
   }, 
   cellTemplate: 'ui-grid/cellTitleValidator' 
        ,editableCellTemplate: 'ui-grid/dropdownEditor',
      editDropdownValueLabel: 'Condition',cellFilter: 'mapCondition', editDropdownOptionsArray: [
            {id:1,Condition:'Good'},
            {id:2,Condition:'Fair' },
            {id:3,Condition:'Poor'},
            {id:4,Condition:'Dead'},
            {id:5,Condition:'N/A'}
    ]  }
    
      ],
    enableCellEdit: true,
    enableGridMenu: true,
    enableSelectAll: true,
    enableFiltering: true,
    enableColumnReordering: true,
    enableColumnResizing: true,
    paginationPageSizes: [2, 3, 7],
    paginationPageSize: 4,
    exporterCsvFilename: 'myFile.csv',
    exporterPdfDefaultStyle: {fontSize: 9},
    exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
    exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
    exporterPdfHeader: { text: "My Header", style: 'headerStyle' },
    exporterPdfFooter: function ( currentPage, pageCount ) {
      return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
    },
    exporterPdfCustomFormatter: function ( docDefinition ) {
      docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
      docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
      return docDefinition;
    },
    exporterPdfOrientation: 'portrait',
    exporterPdfPageSize: 'LETTER',
    exporterPdfMaxGridWidth: 500,
    exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    onRegisterApi: function(gridApi){
      $scope.gridApi = gridApi;

      gridApi.validate.on.validationFailed($scope,function(rowEntity, colDef, newValue, oldValue){
            $window.alert('Please Make sure that DBH>0 Condition!=N/A and Non Vacant Species' );
          });

      gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
        
        if(newValue!=oldValue)
        {
          console.log(colDef.name);
        if(colDef.name!='Species' && colDef.name!='Dbh' && colDef.name!='Condition')
        {
          console.log(colDef.name+" N "+newValue+ " V"+rowEntity._id);
          postData(rowEntity._id, colDef.name,newValue);   
        }
       
        }
          });
          
    }
};

uiGridValidateService.setValidator('compareSpecies', 
  function (argument){
    return function (oldValue, newValue, rowEntity, colDef) {
      if (!newValue) {
          return true; // We should not test for existence here
        } else {
           if(newValue===2)
           {
             if(rowEntity.Condition===5 && parseInt(rowEntity.Dbh)===0)
             {
              //var condition = mapConditionFilter(rowEntity.Condition);
                var species = mapSpeciesFilter(rowEntity.Species);
                //  rowEntity.Species = species;
                 newValue = species;


               console.log(colDef.name+" N "+newValue+ " V"+rowEntity._id);
                postData(rowEntity._id, colDef.name,newValue);   
              
               return true;
             }
             else
             {
               return false;
             }
           } 
           else
           { 
             if(rowEntity.Condition!=5 && parseInt(rowEntity.Dbh)>0)
             {
                var species = mapSpeciesFilter(rowEntity.Species);
                
                 newValue = species;

               console.log(colDef.name+" N "+newValue+ " V"+rowEntity._id);
              
              postData(rowEntity._id, colDef.name,newValue);   
               return true;
             }
             else
             {
             return false;
             }
           }
      }
    };
  }
  
);

uiGridValidateService.setValidator('compareDbh', 
  function (argument){
    return function (oldValue, newValue, rowEntity, colDef) {
      if (!newValue) {
          return true; // We should not test for existence here
        } else {
           if(parseInt(rowEntity.Dbh)==0)
           {
             if(rowEntity.Condition===5 && parseInt(rowEntity.Species)===2)
             {
               console.log(colDef.name+" N "+newValue+ " V"+rowEntity._id);
              postData(rowEntity._id, colDef.name,newValue);   
               return true;
             }
             else
             {
               return false;
             }
           } 
           else if(parseInt(rowEntity.Dbh)>0)
           { 
             if(rowEntity.Condition!=5 && parseInt(rowEntity.Species)!=2)
             {
               console.log(colDef.name+" N "+newValue+ " V"+rowEntity._id);
              
              postData(rowEntity._id, colDef.name,newValue);   
               return true;
             }
             else
             {
             return false;
             }
           }
           else
           {
        //postData(rowEntity._id, colDef.name,newValue);

           }
      }
    };
  }
  
);



uiGridValidateService.setValidator('compareCondition', 
  function (argument){
    return function (oldValue, newValue, rowEntity, colDef) {
      if (!newValue) {
          return true; // We should not test for existence here
        } else {
           if(newValue===5)
           {
             if(parseInt(rowEntity.Species)===2 && parseInt(rowEntity.Dbh)===0)
             {
               var condition = mapConditionFilter(rowEntity.Condition);
                
                 newValue = condition;
               console.log(colDef.name+" N "+newValue+ " V "+rowEntity._id);
                postData(rowEntity._id, colDef.name,newValue);   
              
               return true;
             }
             else
             {
               return false;
             }
           } 
           else
           { 
             if(parseInt(rowEntity.Species)!=2 && parseInt(rowEntity.Dbh)>0)
             {
                var condition = mapConditionFilter(rowEntity.Condition);
                //  var species = mapSpeciesFilter(rowEntity.Species);
                //  rowEntity.Species = species;
                 newValue = condition;

               console.log(colDef.name+" N "+newValue+ " V "+rowEntity._id);
              
            postData(rowEntity._id, colDef.name,newValue);   
               return true;
             }
             else
             {
             return false;
             }
           }
      }
    };
  }
  
);



var postData = function(id,column,value) {
    $http.put('/trees/' + id,{Col:column,Val:value}).success(function (response) {
        refresh();
    })
};
var refresh = function () {
    $http.get('/trees')
.success(function (data) {
    var i;
    for (i = 0; i < data.length; i++) {
        if (data[i].Species === 'Acer Rubrum') {
            data[i].Species = 1;
        }
        if (data[i].Species === 'Vacant Planting Site') {
            data[i].Species = 2;
        }
        if (data[i].Species === 'Fraxinus spp.') {
            data[i].Species = 3;
        }
        if (data[i].Condition === 'Good') {
            data[i].Condition = 1;
        }
        if (data[i].Condition === 'Fair') {
            data[i].Condition = 2;
        }
        if (data[i].Condition === 'Poor') {
            data[i].Condition = 3;
        }
        if (data[i].Condition === 'Dead') {
            data[i].Condition = 4;
        }
        if (data[i].Condition === 'N/A') {
            data[i].Condition = 5;
        }
        
    }
    
    $scope.gridOptions.data = data;
});

}

refresh();
}])
.directive('myCustomDropdown', function() {
  return {
    template: '<select class="form-control" ng-model="colFilter.term" ng-options="option.id as option.value for option in colFilter.options"></select>'
  };
})

.filter('mapCondition', function() {
  var conditionHash = {
   1:'Good',
   2:'Fair' ,
   3:'Poor',
   4:'Dead',
   5:'N/A'
  };

  return function(input) {
    if (!input){
      return '';
    } else {
      return conditionHash[input];
    }
  };
})

.filter('mapSpecies', function() {
  var speciesHash = {
   1:'Acer Rubrum',
   2:'Vacant Planting Site' ,
   3:'Fraxinus spp.'
  };

  return function(input) {
    if (!input){
      return '';
    } else {
      return speciesHash[input];
    }
  };
});









