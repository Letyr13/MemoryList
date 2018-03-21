var module = angular.module("app", ['ngRoute'])
    // factory to share access to current user, in order to change it from another controller
    .factory("session", ["database", function (db) {
        var localStorageUserKey = "memoryList_user";
        var _user = null;
        return {
            clear: function () {
                window.sessionStorage.removeItem(localStorageUserKey);
                _user = null;
            },
            // save username and password for auto re-authentication
            push: function () {
                // 1. we don't need to cache any other data
                // 2. use id would be better at the first glance, but in that case user can change it by himself if browser data and login as someone else... if he were really lucky
                if (_user !== null) {
                    window.sessionStorage.setItem(localStorageUserKey, JSON.stringify({
                        username: _user.username,
                        password: _user.password
                    }));
                }
            },
            // get user information from sessionStorage. done every time when $route start "routing" (.run() function in our case)
            pop: function () {
                var userData = JSON.parse(window.sessionStorage.getItem(localStorageUserKey));
                _user = (userData !== null) ? db.userGetByNameAndPassRequest(userData.username, userData.password) : null;
            },
            get user () {
                return _user;
            },
            // auto save/delete of user information from session storage
            set user (value) {
                if (_user = value) {
                    this.push();
                } else {
                    this.clear();
                }
            }
        };
    }])
    .service("database", function () {
        // =================================================================//
        // ===== THIS CODE WOULD NOT BE NEEDED IF THE APP USE REAL DB ===== //
        //
        // HACK - creating data base on the local machine
        // when you reload page, data that was taken from sessionStorage, synchronize you with server-database in order to authenticate current user (just like cookie)
        // and that's good, it works, but we DON'T have server database
        // so when you reload page this "script db" recreates also
        // that mean all your changes are lost
        // for example:
        // 1. you add task in the list and push the button "add"
        // 2. script get sessionData (about who this user)
        // 3. update database row with sessionData and task that you add
        // 4. reload page
        // 5. whole db recreated, even if sessionData keeps user information
        // 6. you see old list
        // ...I hope I'll be able to explain that later
        var localStorageDBKey = "memoryList_db",
            // small api to work with localStorage db
            db_api = (function () {
                var _length = Number(window.localStorage.getItem(localStorageDBKey + "length"));
                return {
                    get length () {
                        return _length;
                    },
                    get: function (i) {
                        return JSON.parse(window.localStorage.getItem(localStorageDBKey + "user_" + i));
                    },
                    set: function (i, record) {
                        window.localStorage.setItem(localStorageDBKey + "user_" + i, JSON.stringify(record));
                    },
                    push: function (record) {
                        window.localStorage.setItem(
                            localStorageDBKey + "user_" + _length,
                            JSON.stringify(Object.assign({id: Math.round(Number.MAX_VALUE * Math.random())}, record)) // FIXME using of random number as id! (chance of collision)
                        );
                        window.localStorage.setItem(localStorageDBKey + "length", ++_length);
                    },
                    delete: function (record) {
                        // not the fastest function in the world...
                        for (var i = 0; i < _length; i++) {
                            if (this.get(i).id === record.id) {
                                for (var j = i + 1; j < _length; i++, j++) {
                                    window.localStorage.setItem(localStorageDBKey + "user_" + i, window.localStorage.getItem(localStorageDBKey + "user_" + j));
                                }
                                window.localStorage.removeItem(localStorageDBKey + "user_" + i);
                                window.localStorage.setItem(localStorageDBKey + "length", --_length);
                                return;
                            }
                        }
                    },
                    drop: function () {
                        for (var i = 0; i < _length; i++) {
                            window.localStorage.removeItem(localStorageDBKey + "user_" + i);
                        }
                        window.localStorage.setItem(localStorageDBKey + "length", _length = 0);
                    }
                };
            })();
        // if data base wasn't created on the computer earlier
        if (!Boolean(window.localStorage.getItem(localStorageDBKey + "exist"))) {
            // then we create initial db in the local storage
            // this code will execute only once. And after cache clearing also
            var initial_db = [
                {
                    username: 'user',
                    password: 'open',
                    tasks: ["Купить хлеба", "Выгулять собаку", "Релизнуть HL3"]
                }, {
                    username: 'admin',
                    password: 'root',
                    tasks: ["Начать бегать по утрам", "Пройти медобследование в автошколу"]
                }, {
                    username: 'login',
                    password: 'password',
                    tasks: ["Покушать"]
                }
            ];
            for (var i = 0; i < initial_db.length; i++) {
                db_api.push(initial_db[i]);
            }
            window.localStorage.setItem(localStorageDBKey + "exist", true);
        }
        // ===== THIS CODE WOULD NOT BE NEEDED IF THE APP USE REAL DB ===== //
        // =================================================================//

        this.userExistRequest = function (username) {
            for (var i = 0; i < db_api.length; i++) {
                if (db_api.get(i).username === username) {
                    return true;
                }
            }
            return false;
        };
        this.userGetByNameAndPassRequest = function (username, password) {
            for (var i = 0; i < db_api.length; i++) {
                var db_user_copy = db_api.get(i);
                if (db_user_copy.username === username && db_user_copy.password === password) {
                    return db_user_copy;
                }
            }
            return null;
        };
        this.addTaskRequest = function (id, task) {
            for (var i = 0; i < db_api.length; i++) {
                var db_user_copy = db_api.get(i);
                if (db_user_copy.id === id) {
                    db_user_copy.tasks.push(task);
                    db_api.set(i, db_user_copy);
                    return true;
                }
            }
            return false;
        };
        this.removeTaskRequest = function (id, number) {
            for (var i = 0; i < db_api.length; i++) {
                var db_user_copy = db_api.get(i);
                if (db_user_copy.id === id) {
                    if (number < db_user_copy.tasks.length) {
                        db_user_copy.tasks.splice(number, 1);
                        db_api.set(i, db_user_copy);
                        return true;
                    }
                    return false;
                }
            }
            return false;
        };
        this.createUserRequest = function (username, password) {
            var newUser = {
                username: username,
                password: password,
                tasks: []
            };
            db_api.push(newUser);
            return newUser;
        };
    })
    // constants and configs
    .config (['$routeProvider', function ($routeProvider) {
        // TODO find out what mean "#!" in url
        $routeProvider
            .when('/', {
                templateUrl: 'js/view/list.html',
                controller: 'listController'
            })
            .when('/authorization', {
                templateUrl: 'js/view/authorization.html',
                controller: 'authorizationController'
            })
            .when('/list', {
                templateUrl: 'js/view/list.html',
                controller: 'listController'
            })
            .otherwise({
                redirectTo: '/'
            })
        ;
    }])
    .run(['$rootScope', '$location', 'session', function ($rootScope, $location, session) {
        $rootScope.$on("$routeChangeStart", function () {
            // TODO remove to the $route functions! ($decorator?)
            session.pop();
            if (session.user === null) {
                $location.path("/authorization");
            } else {
                $location.path("/");
            }
        });
    }]);

