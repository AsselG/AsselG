@mvp
Feature: Editor controls what gets published
  As the editor (Assel or an AFA volunteer)
  I want to approve AI-gathered items
  So that families can trust the site

  Scenario: High-confidence items publish automatically only if allowed
    Given auto-publish is "on" in site config
    And the AI extracted an item with confidence above the auto-publish threshold
    And its source page is reachable
    Then the item is published and marked "auto"

  Scenario: Low-confidence items wait for review
    Given the AI extracted an item with confidence below the threshold
    Then the item is in the review queue and not public

  Scenario: Editor approves, edits or rejects
    Given I am logged in as editor
    When I open the review queue
    Then I see each draft next to its source text
    And I can approve, edit fields, or reject with a reason

  Scenario: Duplicates are merged
    Given two drafts describe the same event at the same place and time
    Then the queue shows them as one item with two sources

  Scenario: Blocklisted sources are never ingested
    Given a source domain is in the blocklist in sources config
    Then no item from that domain enters the queue
