/* Copyright start
  MIT License
  Copyright (c) 2025 Fortinet Inc
  Copyright end */
"use strict";
(function () {
  angular
    .module("cybersponse")
    .controller("playbookButtons110Ctrl", playbookButtons110Ctrl);

  playbookButtons110Ctrl.$inject = [
    "$scope",
    "_",
    "currentPermissionsService",
    "FormEntityService",
    "playbookService",
    "$filter",
    "widgetService",
    "API",
    "$resource",
    "widgetBasePath",
    "toaster",
  ];

  function playbookButtons110Ctrl(
    $scope,
    _,
    currentPermissionsService,
    FormEntityService,
    playbookService,
    $filter,
    widgetService,
    API,
    $resource,
    widgetBasePath,
    toaster
  ) {
    $scope.actionButtonPlaybooks = [];
    $scope.widgetBasePath = widgetBasePath;
    $scope.widgetCSS = widgetBasePath + "widgetAssets/playbookButtons.css";
    $scope.$on("formGroup:fieldChange", function (event, entity) {
      entity = entity.module === $scope.entity.name ? entity : undefined;
      renderActionButtons(entity);
    });

    $scope.$on("playbookAction:triggerCompleted", function (event, entity) {
      renderActionButtons(entity);
    });

    $scope.$on("$destroy", function () {
      playbookService.detachPaybookStatusWebsocket(
        $scope.playbookStatusSubscription
      );
    });

    function renderActionButtons() {
      let actionPlaybookList = [];
      let playbookIDs = _.pluck(
        $scope.config.selectedPlaybooksWithRecord,
        "uuid"
      );
      playbookService
        .getPlaybooksData(playbookIDs, [
          "name",
          "triggerStep",
          "steps",
          "recordTags",
        ])
        .then(
          function (results) {
            if (
              results &&
              results["hydra:member"] &&
              results["hydra:member"].length > 0
            ) {
              angular.forEach(
                results["hydra:member"],
                function (playbookRecord) {
                  angular.forEach(
                    $scope.config.selectedPlaybooksWithRecord,
                    function (playbookConfig) {
                      if (playbookConfig.uuid === playbookRecord.uuid) {
                        playbookRecord.icon = playbookConfig.icon;
                        playbookRecord.collectionName =
                          playbookConfig.collectionName;
                        playbookRecord.actionTriggerName =
                          playbookConfig.actionTriggerName;
                        actionPlaybookList.push(playbookRecord);
                      }
                    }
                  );
                }
              );
              createPlaybookButtons(actionPlaybookList);
            } else {
              toaster.error({
                body: "No results found",
              });
            }
          },
          function () {
            toaster.error({
              body: "No results found",
            });
          }
        );
    }

    $scope.getSelectedRows = function () {
      return _.map([$scope.getExecuteRecord], (obj) => obj);
    };

    function createPlaybookButtons(playbooks) {
      var uniquePlaybooks = _.uniq(playbooks, "@id");
      $scope.actionButtonPlaybooks = [];
      angular.forEach(uniquePlaybooks, function (playbook) {
        var triggerStep = _.find(playbook.steps, function (item) {
          return item.uuid === $filter("getEndPathName")(playbook.triggerStep);
        });
        $scope.actionButtonPlaybooks.push({
          id: "btn-action-" + playbook.id,
          icon: playbook.icon || "icon icon-execute",
          text: triggerStep.arguments.title || playbook.name,
          desc:
            (playbook.description || playbook.name) +
            " (" +
            playbook.collectionName +
            ")",
          hide: playbook._hide,
          _subtitleDisplay: playbook.collectionName,
          onClick: function () {
            var isWizardExecution = _.some(
              $scope.config.selectedExecutionWizardPlaybooks,
              function (f) {
                return f.uuid == playbook.uuid;
              }
            );
            if ($scope.config.showExecutionProgress && isWizardExecution) {
              var payload = {
                playbookDetails: playbook,
                selectedRecord: $scope.getExecuteRecord,
              };
              var wizardName = $scope.config.widgetName.replace(/ /g, "+");
              $resource(API.QUERY + "solutionpacks?$search=" + wizardName)
                .save()
                .$promise.then(function (response) {
                  if (
                    response["hydra:member"] &&
                    response["hydra:member"].length > 0
                  ) {
                    $scope.widgetVersion = response["hydra:member"][0].version;
                    $scope.widgetAPIName = response["hydra:member"][0].name;
                    widgetService
                      .launchStandaloneWidget(
                        $scope.widgetAPIName,
                        $scope.widgetVersion,
                        null,
                        null,
                        payload
                      )
                      .then(function () {
                        angular.noop;
                      });
                  }
                });
            } else {
              playbookService.triggerPlaybookAction(
                playbook,
                $scope.getSelectedRows,
                $scope,
                true,
                $scope.entity
              );
            }
          },
        });
      });
    }

    function _init() {
      if (
        !currentPermissionsService.availablePermission("workflows", "execute")
      ) {
        return;
      }
      $scope.entity = FormEntityService.get();
      $scope.getExecuteRecord = $scope.entity.originalData;
      renderActionButtons($scope.entity);
    }
    _init();
  }
})();
