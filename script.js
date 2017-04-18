var vibrentApp = angular.module('vibrentMod', []);
vibrentApp.directive('vibrentChallenge', [function () {
    return {
        restrict: 'E',
        controller: 'vibrentChallengeCtrl',
        templateUrl: 'vibrentChallenge.tpl.html',
        scope: {},
        link: function (scope, ele, attrs) {
        }
    }
}]);

vibrentApp.controller('vibrentChallengeCtrl', ['$scope', 'vibrentEquationParserSvc', function ($scope, vibrentEquationParserSvc) {
    $scope.$watch('txtInput', _.debounce(function (newVal, oldVal) {
        if ($scope.vibrentChallengeForm.$valid) {
            if (newVal !== oldVal) {
                $scope.$apply(function () {
                    $scope.output = vibrentEquationParserSvc.solveStr(newVal, $scope);
                })
            }
        }
    }), 1000);
}]);

vibrentApp.service('vibrentEquationParserSvc', function () {
    //https://www.apptic.me/blog/evaluating-mathematical-expression-javascript.php
    function replaceAll(haystack, needle, replace) {
        return haystack.split(needle).join(replace);
    } // replace all fx;

    function strContain(haystack, needle) {
        return haystack.indexOf(needle) > -1;
    } // custom true/false contains

    function isParseable(n, minus) {
        return (!isNaN(n) || (n == "-" && !minus) || n == ".");
    } // determine if char should be added to side

    function getSide(haystack, middle, direction, minus) {
        var i = middle + direction;
        var term = "";
        var limit = (direction == -1) ? 0 : haystack.length; // set the stopping point, when you have gone too far
        while (i * direction <= limit) { // while the current position is >= 0, or <= upper limit
            if (isParseable(haystack[i], minus)) {
                if (direction == 1) term = term + haystack[i];
                else term = haystack[i] + term;
                i += direction;
            } else {
                return term;
            }
        }
        return term;
    } // general fx to get two terms of any fx (multiply, add, etc)

    function allocFx(eq, symbol, alloc, minus) {
        minus = (typeof minus !== 'undefined'); // sometimes we want to capture minus signs, sometimes not
        if (strContain(eq, symbol)) {
            var middleIndex = eq.indexOf(symbol);
            var left = getSide(eq, middleIndex, -1, minus);
            var right = getSide(eq, middleIndex, 1, false);
            eq = replaceAll(eq, left + symbol + right, alloc(left, right));
        }
        return eq;
    } // fx to generically map a symbol to a function for parsing

    this.solveStr = function (eq, scope) {
        eq = reformat(eq);
        while (strContain(eq, "*") || strContain(eq, "/")) {
            var multiply = true;
            if (eq.indexOf("*") < eq.indexOf("/")) {
                multiply = (strContain(eq, "*"));
            } else {
                multiply = !(strContain(eq, "/"));
            }
            eq = (multiply) ? allocFx(eq, "*", function (l, r) {
                return parseFloat(l) * parseFloat(r);
            }) : allocFx(eq, "/", function (l, r) {
                return parseFloat(l) / parseFloat(r);
            });
        }
        while (strContain(eq, "+")) eq = allocFx(eq, "+", function (l, r) {
            return parseFloat(l) + parseFloat(r);
        });
        return isParseable(eq) ? eq : "Finish the equation";
    };

    function reformat(s) {
        s = s.toLowerCase();
        s = replaceAll(s, "-(", "-1*(");
        s = replaceAll(s, ")(", ")*(");
        s = replaceAll(s, " ", "");
        s = replaceAll(s, "-", "+-");
        s = replaceAll(s, "--", "+");
        s = replaceAll(s, "++", "+");
        s = replaceAll(s, "(+", "(");
        for (var i = 0; i < 10; i++) {
            s = replaceAll(s, i + "(", i + "*" + "(");
        }
        while(s.charAt(0) == "+") s = s.substr(1);
        return s;
    } // standardize string format

})


