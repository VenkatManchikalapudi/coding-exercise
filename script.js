var calculateEquationApp = angular.module('calculateEquationMod', []);
calculateEquationApp.directive('calculateEquation', [function () {
    return {
        restrict: 'EA',
        controller: 'calculateEquationCtrl',
        templateUrl: 'calculateEquation.tpl.html',
        scope: {},
        link: function (scope, ele, attrs) {
        }
    }
}]);

calculateEquationApp.controller('calculateEquationCtrl', ['$scope', 'calculateEquationParserSvc', function ($scope, calculateEquationEquationParserSvc) {
    $scope.$watch('txtInput', _.debounce(function (newVal, oldVal) {
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

    function getPortionStr(baseStr, baseIndex, moveIndexBy) {
        var i = baseIndex + moveIndexBy;
        var strSideVal = "";
        var limit = (moveIndexBy == -1) ? 0 : baseStr.length;
        while (i * moveIndexBy <= limit) {
            //move as long as parseable, then stop and return.
            if (!isNaN(baseStr[i])) {
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
        if (bStrContains(equation, operator)) {
            var middleIndex = equation.indexOf(operator);
            var left = parseFloat(getPortionStr(equation, middleIndex, -1));
            var right = parseFloat(getPortionStr(equation, middleIndex, 1));
            var resolvedVal = resolveFunc(left, right);
            equation = replaceStrFunc(equation, left + operator + right, resolvedVal);
        }
        return equation;
    };

    function multiplyNumbers(left, right){
        return left * right;
    }
    function divideNumbers(left, right){
        return left / right;
    }
    function addNumbers(left, right){
        return left + right;
    }

    this.solveStr = function (equation) {
        // format the equation
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
                equation = resolveEquationFunc(equation, "*", multiplyNumbers);
            }else{
                equation = resolveEquationFunc(equation, "/", divideNumbers);
            }
        }
        while (bStrContains(equation, "+")) equation = resolveEquationFunc(equation, "+", addNumbers);
        return !isNaN(equation) ? equation : "Finish the equation";
    };

    function replaceStrFunc(baseStr, splitter, replacement) {
        var splitVal = baseStr.split(splitter);
        return splitVal.join(replacement);
    };

})


