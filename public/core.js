let calendarApp = angular.module('calendarGen', ['720kb.datepicker', 'angularMoment', 'ui.calendar']);

calendarApp.controller('mainController', ['$scope', '$http', '$q', 'moment', function($scope, $http, $q, moment) {

	//initial input variables
	$scope.startDate = moment(new Date()).format("DD-MM-YYYY");
	$scope.totalDays = "";
	$scope.countryCode = "";

	$scope.generateCalendarList = function(startFrom, totalDays, countryCode) {
		
		getCountryHolidays($scope.countryCode).then(
			response => {
				//Calculating end date for the calendars
				const startDate = moment(startFrom, "DD-MM-YYYY");
				const endDate = startDate.clone().add(totalDays, "day");
				const diffStart = moment([startDate.year(), startDate.month()+1, startDate.day()+1]);
				const diffEnd = moment([endDate.year(), endDate.month()+1, endDate.day()+1]);
				const monthsQty = Math.ceil(diffEnd.diff(diffStart, 'months', true)+1); // calculates how many months are going to be rendered
				$scope.holidays = response.dataReady;

				let calendarList = []; //generating months list for the calendars
				for(let i = 0; i < monthsQty; i++) {
					let newCalendar = {};
					let monthCounter = i > 0 ? startDate.clone().add(i, 'month') : startDate;
					newCalendar.fromDate = i > 0 ? monthCounter.clone().startOf('month') : startDate;
					if(endDate.month() == monthCounter.month())
						newCalendar.toDate = endDate;
					else
						newCalendar.toDate = monthCounter.clone().endOf('month');
					calendarList.push(newCalendar);
				}

				$scope.calendarList = calendarList;
			}
		);
	};

	function getCountryHolidays(countryCode) {
		try {
			return $http.get("/getHolidays/"+countryCode).then(function (success){
				$scope.holidays = [];
				if(success.status == 200) {
					let holidaysList = Object.values(success.data.holidays);
					for(let key in holidaysList) {
						let current = holidaysList[key][0];
						$scope.holidays.push(buildHolidayEvent(current));
					}
				}
				success.dataReady = $scope.holidays;
				return success;
			}, function (error){
				console.error(error);
			});
		} catch (error){ console.error(error); }
	};

	function buildHolidayEvent(holiday){
		let e = {};
		e.title = holiday.name;
		e.start = moment(holiday.date, "YYYY-MM-DD")._d;
		e.end = moment(holiday.observed, "YYYY-MM-DD")._d;
		return e;
	}

}]);


//calendar directive for the rendered widget
calendarApp.directive('calendarWidget', function () {
    return {
        restrict: 'E', 
        scope: {
            calendarParams: '=',
            holidays: '='
        },
        template: '<div class = "container"><div ui-calendar="uiConfig.calendar" class="span8 calendar" ng-model="eventSources" ng-if="eventSources.length > 0"></div></div>',
        link: function ($scope, element, attrs) {
        	const dateConfig = $scope.calendarParams;
        	const startDate = dateConfig.fromDate.format("YYYY-MM-DD");
        	const endDate = dateConfig.toDate.add(1, "day").format("YYYY-MM-DD");
        	$scope.eventSources = [$scope.holidays];

        	//full calendar config object
			$scope.uiConfig = {
		      calendar:{
		        height: 350,
		        editable: true,
		        header:{
		          left: '',
		          center: 'title',
		          right: ''
		        },
		        validRange: {
		        	start: startDate,
		        	end: endDate
		    	}
		      }
    		};
        } 
    }
});