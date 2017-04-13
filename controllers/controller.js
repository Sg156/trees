var myApp = angular.module('dupTrees', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
    console.log("Hello World from controller");


var refresh = function() {
  $http.get('/dupTrees').success(function(response) {
    //console.log("I got the data I requested");
    $scope.duplicateTrees = response;
    $scope.tree = "";
  });
};

refresh();


$scope.edit = function(id) {
  $http.get('/dupTrees/' + id).success(function(response) {
      console.log(response);
    $scope.tree = response;
  });
};  

$scope.update = function() {
  console.log($scope.tree._id);
  $http.put('/dupTrees/' + $scope.tree._id, $scope.tree).success(function(response) {
    refresh();
  })
};

$scope.deselect = function() {
  $scope.tree = "";
}

}]);