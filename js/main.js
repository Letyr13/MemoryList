// some kind of data base
var db = (function () {
    // initial data base
    var user_db = [
        {
            id: 0,
            name: 'user',
            password: 'open'
        },
        {
            id: 1,
            name: 'admin',
            password: 'root'
        },
        {
            id: 2,
            name: 'login',
            password: 'password'
        }
    ];

    return {
        requestUsers: function () {
            return user_db;
        }

        //...and others db functions
    }
})();

// constants and configs
var module_name = "app";

angular.module(module_name, [])
    // factory to share access to template, in order to change it from another controller
    .factory("current", function () {
        var current = {
            template: '',
            user: null,
            changeTemplate: function (url) {

                // This dynamic loading of controllers and views...
                // ...at least it should be
                // but it's not work, so I just load controllers all at once it head
                // thanks god views are able to load

                // TODO correct it
                /*// adding controller script through head tag
                //var head = document.getElementsByTagName('head')[0],
                var head = document.body,
                    script = document.createElement('script');
                script.src = "js/controller/" + url[0] + ".js";
                script.onload = function () {
                    // here controller must take initiative with other url arguments
                    // and also this is the place for cleaning and view loading
                };
                script.onerror = function () {
                    // open 404 page
                };
                // start the loading
                head.appendChild(script);*/

                // TODO controller must call view loading, but I don't know how to do that
                current.template = "js/view/" + url[0] + ".html";
            }
        };
        return current;
    })
    .controller("main", ["$scope", "current", function ($scope, current) {
        $scope.current = current;

        $scope.parseUrl = function () {
            var routes = {
                "": ["authorization"],
                "index": ["authorization"],
                "index/authorization": ["authorization"],
                "index/list": ["list"]
            };
            // kind of url parsing...
            // TODO look for better ways

            // DEBUG
            return ["authorization"];

            return routes[location.href];
        };

        $scope.current.changeTemplate($scope.parseUrl());
    }]);

