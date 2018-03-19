angular.module(module_name)
    .controller("authorizationController", ["$scope", "current", function($scope, current) {
        $scope.current = current;

        $scope.name = "";
        $scope.password = "";

        $scope.nameError = false;
        $scope.passwordError = false;
        $scope.checkAuthorization = function (name, password) {
            // request to db
            var registered_users = db.requestUsers();

            // check if this user exist
            for (var i = 0; i < registered_users.length; i++) {
                if (registered_users[i].name === name && registered_users[i].password === password) {
                    return registered_users[i];
                }
            }
            return null;
        };

        $scope.login = function () {
            // check for introduced data
            $scope.nameError = $scope.name === "";
            $scope.passwordError = $scope.password === "";

            // check for registration
            if (!$scope.nameError && !$scope.passwordError && (current.user = $scope.checkAuthorization($scope.name, $scope.password))) {
                // TODO save current user in cookie or something
                // ...

                // change url
                // location.replace("index/list");
                // TODO BUT I don't know how to run Index.html without .htaccess file

                current.template = "js/view/list.html";
            }

        };
    }]);