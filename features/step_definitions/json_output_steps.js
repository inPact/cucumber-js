var jsonOutputSteps = function jsonOutputSteps() {
  var assert = require('assert');

  function findStep(features, scenarioPredicate, stepPredicate){
    var scenario = findScenario(features, scenarioPredicate);
    var found = null
    scenario.steps.forEach(function(step){
      if (stepPredicate(step)){
        found = step;
      };
    });
    if (found === null){
      throw new Error('Could not find step matching predicate');
    }
    return found;
  }

  function findScenario(features, predicate, errorMessage){
    var found = null;
    features.forEach(function(feature) {
      feature.elements.forEach(function(element, index){
        if (element.type === 'scenario' && predicate(element, index)){
          found = element;
        }
      });
    });
    if (found === null){
      throw new Error('Could not find scenario matching predicate');
    }
    return found;
  }

  this.Then(/^it runs (\d+) scenarios$/, function (count) {
    var features = JSON.parse(this.lastRun.stdout);
    assert.equal(parseInt(count), features[0].elements.length)
  });

  this.Then(/^the scenario "([^"]*)" has the steps$/, function (name, table) {
    var features = JSON.parse(this.lastRun.stdout);
    var scenario = findScenario(features, function(element) {
      return element.name === name;
    });
    var stepNames = scenario.steps.map(function(step){
      return [step.name];
    });
    assert.deepEqual(stepNames, table.rows())
  });

  this.Then(/^the step "([^"]*)" has status (failed|passed|pending)(?: with "([^"]*)")?$/, function (name, status, errorMessage) {
    var features = JSON.parse(this.lastRun.stdout);
    var step = findStep(features, function(element){
      return true;
    }, function(step) {
      return step.name === name;
    });
    if (step.result.status !== status){
      throw new Error("Expected '" + name + "' to have status '" + status + "', but it had status: " +
                      step.result.status);
    }
    if (errorMessage && step.result.error_message.indexOf('Error: ' + errorMessage) === -1) {
      throw new Error("Expected '" + name + "' to have an error_message containing '" +
                      errorMessage + "'\n" + "Got:\n" + step.result.error_message);
    }
  });

  this.Then(/^the (first|second) scenario has the steps$/, function (cardinal, table) {
    var scenarioIndex = cardinal === 'first' ? 0 : 1;
    var features = JSON.parse(this.lastRun.stdout);
    var scenario = findScenario(features, function(element, index) {
      return index === scenarioIndex;
    });
    var stepNames = scenario.steps.map(function(step){
      return [step.name];
    });
    assert.deepEqual(stepNames, table.rows())
  });

  this.Then(/^the (first|second) scenario has the step "([^"]*)" with the doc string$/, function (cardinal, name, docString) {
    var features = JSON.parse(this.lastRun.stdout);
    var scenarioIndex = cardinal === 'first' ? 0 : 1;
    var step = findStep(features, function(element, index){
      return index === scenarioIndex;
    }, function(step) {
      return step.name === name;
    });
    assert.equal(step.doc_string.value, docString)
  });

  this.Then(/^the (first|second) scenario has the step "([^"]*)" with the table$/, function (cardinal, name, table) {
    var features = JSON.parse(this.lastRun.stdout);
    var scenarioIndex = cardinal === 'first' ? 0 : 1;
    var step = findStep(features, function(element, index){
      return index === scenarioIndex;
    }, function(step) {
      return step.name === name;
    });
    var expected = table.raw().map(function(row) {
      return {cells: row};
    });
    assert.deepEqual(step.rows, expected);
  });

  this.Then(/^the (first|second) scenario has the name "([^"]*)"$/, function (cardinal, name) {
    var scenarioIndex = cardinal === 'first' ? 0 : 1;
    var features = JSON.parse(this.lastRun.stdout);
    var scenario = findScenario(features, function(element, index) {
      return index === scenarioIndex;
    });
    assert.equal(scenario.name, name);
  });

};

module.exports = jsonOutputSteps;