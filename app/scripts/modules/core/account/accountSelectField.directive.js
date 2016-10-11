'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.account.accountSelectField.directive', [
    require('./account.service.js'),
  ])
  .directive('accountSelectField', function() {
    return {
      restrict: 'E',
      templateUrl: require('./accountSelectField.directive.html'),
      controller: 'AccountSelectFieldCtrl',
      controllerAs: 'vm',
      scope: {},
      bindToController: {
        accounts: '=',
        component: '=',
        field: '@',
        provider: '=',
        loading: '=',
        onChange: '&',
        labelColumns: '@',
        labelAlign: '@',
        readOnly: '=',
        multiselect: '='
      },
    };
  })
  .controller('AccountSelectFieldCtrl', function($scope, $q, accountService) {
    this.mergedAccounts = [];

    let groupAccounts = (accounts) => {
      if (!accounts || !accounts.length) {
        return;
      }
      let accountsAreObjects = accounts[0].name;
      let getAccountDetails = this.provider ? accountService.getAllAccountDetailsForProvider(this.provider) : $q.when([]);
      if (!this.provider && accountsAreObjects) {
        let providers = _.uniq(_.map(accounts, 'type'));
        getAccountDetails = $q.all(providers.map(accountService.getAllAccountDetailsForProvider))
          .then((details) => _.flatten(details));
      }

      getAccountDetails.then((details) => {
        let accountNames = accountsAreObjects ? _.map(accounts, 'name') : accounts;
        this.mergedAccounts = accountNames;
        if (accountNames) {
          this.primaryAccounts = accountNames.sort();
        }
        if (accountNames && accountNames.length && details.length) {
          this.primaryAccounts = accountNames.filter(function(account) {
            return details.some((detail) => detail.name === account && detail.primaryAccount);
          }).sort();
          this.secondaryAccounts = _.xor(accountNames, this.primaryAccounts).sort();
          this.mergedAccounts = _.flatten([this.primaryAccounts, this.secondaryAccounts]);
        }
      });
    };

    this.groupBy = (account) => {
      if (this.secondaryAccounts && this.secondaryAccounts.includes(account)) {
        return '---------------';
      }

      if (this.primaryAccounts.includes(account)) {
        return undefined;
      }
    };

    $scope.$watch(() => this.accounts, groupAccounts);
  });
