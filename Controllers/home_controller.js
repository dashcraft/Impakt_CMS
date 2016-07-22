(function () {
    'use strict';

    angular
        .module('app')
        .controller('home_controller', function home_controller($scope, $state, $http, $log) {
			console.log("Home controller loaded");
			
			$scope.login = function(user) {
				$http.post("/users/login", user)
					.success(function(data, status){
						console.log('success');
						$state.go('mainState');
					})
					.error(function (data, status, headers, config, statusTxt) {
						console.log("Error: " + data);
						console.log(config);
						$scope.error = true;
					});
			};
			
        });
})();
