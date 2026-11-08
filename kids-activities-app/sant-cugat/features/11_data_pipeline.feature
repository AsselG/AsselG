@mvp @pipeline
Feature: Nightly AI data gathering
  As the product owner
  I want the catalogue refreshed every night at low cost
  So that information stays current without manual work

  Scenario: Nightly run
    When the nightly pipeline runs
    Then it fetches every enabled source in sources config, respecting robots.txt
    And it sends changed pages only to the extraction model
    And it stores a run report with counts: fetched, changed, extracted, published, queued, rejected, cost

  Scenario: Output always matches the schema
    Then every extracted item validates against the item JSON schema
    And invalid outputs are retried once with the higher model and then rejected

  Scenario: Cost guard
    Given the monthly AI budget in site config is reached
    Then the pipeline stops calling AI and only refreshes existing items' freshness checks
    And I get an alert

  Scenario: Golden set accuracy
    Given the golden set of 50 hand-checked pages
    When the extraction prompt or model changes
    Then field accuracy on the golden set must stay at or above the threshold in site config before the change is merged
