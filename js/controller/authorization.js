module
    .controller("authorizationController", ["$scope", "$route", "session", "database", function($scope, $route, session, db) {
        $scope.username = "";
        $scope.password = "";
        var resetValidation = function () {
            $scope.errorString = "";
            $scope.nameError = $scope.passwordError = false;
        };
        resetValidation();

        // check for introduced data
        var checkValidation = function () {
            resetValidation();
            $scope.passwordError = $scope.password === "";
            $scope.nameError = $scope.username === "";
            if ($scope.nameError && $scope.passwordError) {
                $scope.errorString = "Please enter Username and Password!";
                document.getElementById("userField").focus();
            } else if ($scope.nameError) {
                $scope.errorString = "Please enter Username!";
                document.getElementById("userField").focus();
            } else if ($scope.passwordError) {
                $scope.errorString = "Please enter Password!";
                document.getElementById("passwordField").focus();
            }
            return !($scope.passwordError || $scope.nameError);
        };

        $scope.onkey = function ($event) {
            resetValidation();
            if ($event.keyCode === 13) {
                $scope.login();
            }
        };

        $scope.createAccount = function () {
            if (checkValidation()) {
                if (!db.userExistRequest($scope.username)) {
                    session.user = db.createUserRequest($scope.username, $scope.password);
                    $route.reload();
                } else {
                    $scope.nameError = true;
                    $scope.errorString = "User with same login already exist!";
                }
            }
        };

        $scope.login = function () {
            if (checkValidation()) {
                if (session.user = db.userGetByNameAndPassRequest($scope.username, $scope.password)) {
                    $route.reload();
                } else {
                    $scope.errorString = "Invalid login or password!";
                }
            }
        };
    }]);