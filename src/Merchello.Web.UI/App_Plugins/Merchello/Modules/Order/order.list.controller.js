﻿(function (controllers, undefined) {
    
    /**
     * @ngdoc controller
     * @name Merchello.Dashboards.Order.ListController
     * @function
     * 
     * @description
     * The controller for the orders list page
     */
    controllers.OrderListController = function ($scope, assetsService, notificationsService, merchelloInvoiceService, merchelloSettingsService) {

        /**
         * @ngdoc method
         * @name changePage
         * @function
         * 
         * @description
         * Changes the current page.
         */
        $scope.changePage = function (page) {
            $scope.currentPage = page;
            $scope.loadInvoices();
        };

        /**
         * @ngdoc method
         * @name changeSortOrder
         * @function
         * 
         * @description
         * Helper function to set the current sort on the table and switch the 
         * direction if the property is already the current sort column.
         */
        $scope.changeSortOrder = function (propertyToSort) {
            if ($scope.sortProperty == propertyToSort) {
                if ($scope.sortOrder == "asc") {
                    $scope.sortProperty = "-" + propertyToSort;
                    $scope.sortOrder = "desc";
                } else {
                    $scope.sortProperty = propertyToSort;
                    $scope.sortOrder = "asc";
                }
            } else {
                $scope.sortProperty = propertyToSort;
                $scope.sortOrder = "asc";
            }
        };

        /**
         * @ngdoc method
         * @name init
         * @function
         * 
         * @description
         * Method called on intial page load.  Loads in data from server and sets up scope.
         */
        $scope.init = function () {
            $scope.setVariables();
        	$scope.loadInvoices();
	        $scope.loadSettings();
        };

        /**
         * @ngdoc method
         * @name limitChanged
         * @function
         * 
         * @description
         * Helper function to set the amount of items to show per page for the paging filters and calculations
         */
        $scope.limitChanged = function (newVal) {
            $scope.limitAmount = newVal;
            $scope.page = 0;
            $scope.loadInvoices($scope.filterText);
        };

        /**
         * @ngdoc method
         * @name loadInvoices
         * @function
         * 
         * @description
         * Load the invoices, either filtered or not, dependingon teh current page, and status of the filterText variable.
         */
        $scope.loadInvoices = function(filterText) {
            var page = $scope.currentPage;
            var perPage = $scope.limitAmount;
            var sortBy, sortDirection;
            // TODO: Replace hardwired values with values provided by clicked-upon options on list in markup
            if ($scope.sortProperty.indexOf('-') > -1) {
                sortBy = $scope.sortProperty.split('-')[1].toLowerCase();
                sortDirection = 'Ascending';
            } else {
                sortBy = $scope.sortProperty.toLowerCase();
                sortDirection = 'Descending';
            }
            $scope.filterText = filterText;
            var promiseInvoices;
            if (filterText === undefined) {
                filterText = '';
            }
            if (filterText === '') {
                var listQuery = new merchello.Models.ListQuery({
                    currentPage: page,
                    itemsPerPage: perPage,
                    sortBy: sortBy,
                    sortDirection: sortDirection
                });
                console.info(listQuery);
                promiseInvoices = merchelloInvoiceService.getAll(listQuery);
            } else {
                promiseInvoices = merchelloInvoiceService.getFiltered(filterText, page, perPage);
            }
            promiseInvoices.then(function(response) {
                var queryResult = new merchello.Models.QueryResult(response);
                $scope.invoices = _.map(queryResult.items, function(invoice) {
                    return new merchello.Models.Invoice(invoice);
                });
                $scope.loaded = true;
                $scope.preValuesLoaded = true;
                if ($scope.selectedOrderCount > 0) {
                    $scope.selectAllOrders = true;
                    $scope.updateBulkActionDropdownStatus(true);
                }
                $scope.maxPages = queryResult.totalPages;
            }, function (reason) {
                notificationsService.error("Failed To Load Invoices", reason.message);
            });
        };

        /**
         * @ngdoc method
         * @name loadSettings
         * @function
         * 
         * @description
         * Load the settings from the settings service to get the currency symbol
         */
        $scope.loadSettings = function () {
            var currencySymbolPromise = merchelloSettingsService.getCurrencySymbol();
            currencySymbolPromise.then(function (currencySymbol) {
                $scope.currencySymbol = currencySymbol;

            }, function (reason) {
                notificationsService.error("Settings Load Failed", reason.message);
            });
            var settingsPromise = merchelloSettingsService.getAllSettings();
            settingsPromise.then(function (settingsFromServer) {
                $scope.settings = settingsFromServer;
            });
        };

        /**
         * @ngdoc method
         * @name setVariables
         * @function
         * 
         * @description
         * Sets the $scope variables.
         */
        $scope.setVariables = function () {
            $scope.currentPage = 0;
            $scope.filterText = '';
            $scope.invoices = [];
            $scope.limitAmount = '100';
            $scope.maxPages = 0;
            $scope.orderIssues = [];
            $scope.selectAllOrders = false;
            $scope.selectedOrderCount = 0;
            $scope.settings = {};
            $scope.sortOrder = "desc";
            $scope.sortProperty = "-invoiceNumber";
            $scope.visible = {};
            $scope.visible.bulkActionDropdown = false;
        };

        /**
         * @ngdoc method
         * @name setVariables
         * @function
         * 
         * @description
         * Sets the $scope variables.
         */
        $scope.updateBulkActionDropdownStatus = function (toggle, key) {
            var i, shouldShowDropdown = false;
            $scope.selectedOrderCount = 0;
            if (toggle) {
                $scope.selectAllOrders = !$scope.selectAllOrders;
            }
            for (i = 0; i < $scope.invoices.length; i++) {
                if (toggle) {
                    $scope.invoices[i].selected = $scope.selectAllOrders;
                } else {
                    if ($scope.invoices[i].key === key) {
                        $scope.invoices[i].selected = !$scope.invoices[i].selected;
                    }
                }
                if ($scope.invoices[i].selected) {
                    shouldShowDropdown = true;
                    $scope.selectedOrderCount += 1;
                }
            }
            $scope.visible.bulkActionDropdown = shouldShowDropdown;
        };

        $scope.init();

    };

    angular.module("umbraco").controller("Merchello.Dashboards.Order.ListController", ['$scope', 'assetsService', 'notificationsService', 'merchelloInvoiceService', 'merchelloSettingsService', merchello.Controllers.OrderListController]);

}(window.merchello.Controllers = window.merchello.Controllers || {}));
