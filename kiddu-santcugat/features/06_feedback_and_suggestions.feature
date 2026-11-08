@mvp
Feature: Families correct and suggest information
  As a parent
  I want to report wrong information and suggest new places
  So that the catalogue gets better for everyone

  Scenario: Report wrong information
    Given I am on an item page
    When I tap "Something is wrong" and choose "Closed permanently"
    Then I see "Thanks, we'll check it"
    And the item goes to the review queue with my reason

  Scenario: Item with several reports is hidden until reviewed
    Given an item receives more "wrong information" reports than the threshold in site config
    Then it is hidden from the public site until an editor reviews it

  Scenario: Suggest a new place or event
    When I paste a link or write a name in "Suggest something"
    Then the AI pipeline extracts a draft item from it
    And the draft goes to the review queue, never directly to the public site
