var calculateEquationApp = angular.module('calculateEquationMod', []);
calculateEquationApp.directive('calculateEquation', [function () {
    return {
        restrict: 'E',
        controller: 'calculateEquationCtrl',
        templateUrl: 'calculateEquation.tpl.html',
        scope: {},
        link: function (scope, ele, attrs) {
        }
    }
}]);

calculateEquationApp.controller('calculateEquationCtrl', ['$scope', 'calculateEquationParserSvc', function ($scope, calculateEquationEquationParserSvc) {
    $scope.$watch('txtInput', _.debounce(function (newVal, oldVal) {
        console.log(newVal);
        if ($scope.calculateEquationForm.$valid) {
            if (newVal !== oldVal) {
                $scope.$apply(function () {
                    $scope.output = calculateEquationEquationParserSvc.solveStr(newVal, $scope);
                })
            }
        }
    }, 1000));
}]);

calculateEquationApp.service('calculateEquationParserSvc', function () {

    function bStrContains(baseStr, splitter) {
        return baseStr.indexOf(splitter) > -1;
    };

    function getPortionStr(baseStr, baseIndex, moveIndexBy, minus) {
        var i = baseIndex + moveIndexBy;
        var strSideVal = "";
        var limit = (moveIndexBy == -1) ? 0 : baseStr.length;
        while (i * moveIndexBy <= limit) {
            //move as long as parseable, then stop and return.
            if (!isNaN(baseStr[i], minus)) {
                if (moveIndexBy == 1) strSideVal = strSideVal + baseStr[i];
                else strSideVal = baseStr[i] + strSideVal;
                i += moveIndexBy;
            } else {
                return strSideVal;
            }
        }
        return strSideVal;
    };

    function resolveEquationFunc(equation, operator, resolveFunc) {
        //minus = (typeof minus !== 'undefined');
        if (bStrContains(equation, operator)) {
            var middleIndex = equation.indexOf(operator);
            var left = getPortionStr(equation, middleIndex, -1);
            var right = getPortionStr(equation, middleIndex, 1);
            equation = replaceStrFunc(equation, left + operator + right, resolveFunc(left, right));
        }
        return equation;
    };

    this.solveStr = function (equation) {
        // format the equation
        equation = equation.toLowerCase();
        equation = replaceStrFunc(equation, " ", "");
        equation = replaceStrFunc(equation, "-", "+-");
        equation = replaceStrFunc(equation, "--", "+");

        while (bStrContains(equation, "*") || bStrContains(equation, "/")){
        // solve multiplication followed by division and the addition/substraction
            var doMultiplyFirst = true;
            if (equation.indexOf("*") < equation.indexOf("/")) {
                doMultiplyFirst = (bStrContains(equation, "*"));
            } else {
                doMultiplyFirst = !(bStrContains(equation, "/"));
            }

            if(doMultiplyFirst){
                equation = resolveEquationFunc(equation, "*", function (leftStr, rightStr) {
                    return parseFloat(leftStr) * parseFloat(rightStr);
                });
            }else{
                equation = resolveEquationFunc(equation, "/", function (leftStr, rightStr) {
                    return parseFloat(leftStr) / parseFloat(rightStr);
                });
            }
        }
        while (bStrContains(equation, "+")) equation = resolveEquationFunc(equation, "+", function (l, r) {
            return parseFloat(l) + parseFloat(r);
        });
        return !isNaN(equation) ? equation : "Finish the equation";
    };

    function replaceStrFunc(baseStr, splitter, replacement) {
        var splitVal = baseStr.split(splitter);
        return splitVal.join(replacement);
    };

})


