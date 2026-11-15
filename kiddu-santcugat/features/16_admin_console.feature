@mvp @admin
Feature: Admin console for AI-gathered events and activities
  As the editor of Kiddu Sant Cugat
  I want one place to see what the AI gathered, fix it and publish it
  So that families only see correct information

  Scenario: Only editors can open the admin console
    When someone who is not an editor opens the admin console
    Then they see a page that does not exist
    When I log in to the admin console with a wrong key
    Then I am told the key is wrong
    When I log in to the admin console with the admin key
    Then I see the admin dashboard

  Scenario: The dashboard shows how the gathering is going
    Given the pipeline has queued drafts from the Sant Cugat sources
    And I am logged in as editor
    When I open the admin dashboard
    Then I see the last run with its counts and its AI cost
    And I see how many drafts wait for review
    And I see the AI spend this month against the budget in site config
    And I see each source with its status, including sources blocked by robots.txt

  Scenario: Facts the AI could not find in the source are flagged
    Given the pipeline has queued drafts from the Sant Cugat sources
    And I am logged in as editor
    When I open the draft "Teatre de prova"
    Then it is flagged "Date not found in the source"
    And its confidence is below the auto-publish threshold

  Scenario: A draft needs a location before it can be published
    Given the pipeline has queued drafts from the Sant Cugat sources
    And I am logged in as editor
    When I try to publish the draft "Taller de titelles" without a location
    Then I am told it needs a location for the map
    When I choose the known place "Biblioteca de prova" and publish
    Then families see "Taller de titelles" on the public site with its source link and the AI label

  Scenario: Rejected events are not queued again
    Given the pipeline has queued drafts from the Sant Cugat sources
    And I am logged in as editor
    When I reject the draft "Hora del conte" with the reason "Cancelled by the library"
    And the pipeline runs again after the page changed
    Then "Hora del conte" is not in the review queue
    And families do not see "Hora del conte"

  Scenario: Unpublish an item
    Given the pipeline has queued drafts from the Sant Cugat sources
    And I am logged in as editor
    And I published the draft "Concert familiar"
    When I unpublish "Concert familiar"
    Then families do not see "Concert familiar"
