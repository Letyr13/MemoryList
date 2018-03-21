module
    .controller("listController", ["$scope", "$route", "session", "database", function($scope, $route, session, db) {
        $scope.user = session.user;
        $scope.task = "";

        $scope.onkey = function ($event) {
            if ($event.keyCode === 13) {
                $scope.addTask();
            }
        };

        $scope.addTask = function (task) {
            // check validation
            if ($scope.task !== "") {
                // update session
                session.user.tasks.push(task);
                // update data base
                db.addTaskRequest(session.user.id, task);
                // update view
                $scope.task = "";
                // tasks list update automatically
            }
            document.getElementById("task").focus();
        };

        $scope.removeTask = function (number) {
            // update session
            session.user.tasks.splice(number, 1);
            // update data base
            db.removeTaskRequest(session.user.id, number);
        };

        $scope.logout = function () {
            session.clear();
            $route.reload();
        };

        document.getElementById("task").focus();
    }]);