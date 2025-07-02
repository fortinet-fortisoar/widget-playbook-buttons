/* Copyright start
  MIT License
  Copyright (c) 2025 Fortinet Inc
  Copyright end */
  'use strict';
  (function () {
    angular
      .module('cybersponse')
      .controller('editPlaybookButtons110Ctrl', editPlaybookButtons110Ctrl);
  
    editPlaybookButtons110Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', 'FormEntityService', 'currentPermissionsService', 'playbookService', '_'];
  
    function editPlaybookButtons110Ctrl($scope, $uibModalInstance, config, FormEntityService, currentPermissionsService, playbookService, _) {
      $scope.cancel = cancel;
      $scope.save = save;
      $scope.config = config;
      $scope.config.widgetName = 'Playbook Execution Wizard';
      $scope.playbookList = [];
      $scope.toggle = false;
      $scope.playbookButton = playbookButton;
      $scope.addButtonWithRecord = addButtonWithRecord;
      $scope.removeButtonWithRecord = removeButtonWithRecord;
      $scope.resetExecutionProgress = resetExecutionProgress;
      $scope.toggleAdvancedSettings = toggleAdvancedSettings;
      $scope.searchTemplate = searchTemplate;
      let playbookButtonList = [];
      $scope.input = {
        searchText: ''
      };
      if (!$scope.config.selectedPlaybooksWithRecord) {
        $scope.config.selectedPlaybooksWithRecord = [];
      }
  
      function toggleAdvancedSettings() {
        $scope.toggle = !$scope.toggle;
      }
      function playbookButton() {
        $scope.playbookList = angular.copy($scope.config.selectedPlaybooksWithRecord);
      }
  
      function resetExecutionProgress() {
        if ($scope.config.showExecutionProgress === false) {
          $scope.playbookList = [];
          $scope.config.selectedExecutionWizardPlaybooks = [];
        }
      }
  
      function updatePlaybookList(playbook) {
        angular.forEach($scope.modulePlaybooks, function(playbookDetails, index){
          if(playbook.uuid === playbookDetails.uuid) {
            $scope.modulePlaybooks.splice(index, 1);
          }
        });
      }
  
      function addButtonWithRecord(playbook) {
        let playbookDetail = {
          name: playbook.name,
          uuid: playbook.uuid,
          actionTriggerName: playbook.actionTriggerName, 
          collectionName: playbook.collectionName
        };
        playbookButtonList.push(playbook);
        updatePlaybookList(playbook);
        $scope.config.selectedPlaybooksWithRecord.push(playbookDetail);
        $scope.playbookList.push(playbook);
      }
  
      function removeButtonWithRecord(index, action) {
        angular.forEach(playbookButtonList, function(playbookDetail, index){
          if(action.uuid === playbookDetail.uuid) {
            $scope.modulePlaybooks.push(playbookDetail);
            playbookButtonList.splice(index, 1);
          }
        });
        $scope.config.selectedPlaybooksWithRecord.splice(index, 1);
        $scope.config.selectedExecutionWizardPlaybooks = _.reject($scope.config.selectedExecutionWizardPlaybooks, obj => obj.id === action.id);
      }
      function cancel() {
        $uibModalInstance.dismiss('cancel');
      }
  
      function save() {
        if ($scope.editPlaybookButtonsForm.$invalid) {
          $scope.editPlaybookButtonsForm.$setTouched();
          $scope.editPlaybookButtonsForm.$focusOnFirstError();
          return;
        }
        $uibModalInstance.close($scope.config);
      }
      function _init() {
        if (!currentPermissionsService.availablePermission('workflows', 'execute')) {
          return;
        }
        $scope.entity = FormEntityService.get();
        playbookService.getActionPlaybooks($scope.entity, true).then(function (playbooks) {
          $scope.modulePlaybooks = playbooks;
          playbookButtonList = angular.copy($scope.config.selectedPlaybooksWithRecord);
          angular.forEach($scope.config.selectedPlaybooksWithRecord, function(playbook) {
            updatePlaybookList(playbook);
          });
        });
      }
      function searchTemplate(event){
        event.preventDefault();
        event.stopPropagation();
      }
      _init();
    }
  })();