/** Which feature files the acceptance gate runs now. The owner moves features in as milestones start. */
export const MILESTONE_FEATURES = [
  'features/01_browse_map_and_list.feature',
  'features/02_filters.feature',
  'features/03_item_details.feature',
  'features/04_plan_with_friends.feature',
  'features/07_editor_review_queue.feature',
  'features/08_languages_and_privacy.feature',
  'features/09_pilot_class_groups.feature',
  'features/11_data_pipeline.feature',
  'features/12_find_families_and_playdates.feature',
  'features/13_family_profile_and_friends.feature',
  'features/14_invited_plans_on_map.feature',
  'features/15_casal_planning.feature',
  'features/16_admin_console.feature',
  'features/17_official_feeds.feature',
];

/** Scenarios the gate skips: they need data only the owner can provide. */
export const SKIP_TAGS = 'not @needs-owner-data';
