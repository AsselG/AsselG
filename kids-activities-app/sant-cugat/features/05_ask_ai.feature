@phase2
Feature: Ask for a plan in plain words
  As a busy parent
  I want to type what I need in my own words
  So that I get 2-3 good options quickly

  Scenario: The answer uses only the catalogue
    When I ask "Saturday morning, kids 4 and 7, raining, under 20 euros"
    Then I get between 1 and 3 suggestions
    And every suggestion links to an item page in the catalogue
    And the answer never mentions a place that is not in the catalogue

  Scenario: Same language as the question
    When I ask in Catalan
    Then the answer is in Catalan

  Scenario: Nothing fits
    When I ask for something the catalogue does not have
    Then the answer says it found nothing and suggests the closest filters instead

  Scenario: Abuse and cost limits
    When the same visitor sends more questions than the daily limit in site config
    Then they see "Try again tomorrow" and no AI call is made
