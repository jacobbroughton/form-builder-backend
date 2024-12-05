export function SQL_getMyForms(sort: string) {
  return `
      with public as (
      select * from forms
      where created_by_id = $1
      and is_deleted = false
      --order by modified_at, created_at desc
    ) ,
    draft as (
      select * from draft_forms
        where created_by_id = $1
        and is_published = false
        and is_deleted = false
        --order by modified_at desc, created_at desc
    )
     
    select * from (
      select 
        id, 
        --draft_id, 
        title, 
        description, 
        passkey, 
        is_deleted, 
        --published_by_id,
        published_at relevant_dt, 
        created_by_id, 
        created_at, 
        modified_by_id, 
        modified_at,
        false is_draft
      from public 
      union all 
      select 
        id, 
        title, 
        description, 
        passkey, 
        --is_published, 
        is_deleted, 
        created_at relevant_dt,
        created_by_id,
        created_at, 
        modified_by_id, 
        modified_at,
        true is_draft
        from draft
    ) combined
     order by ${
       sort === "alphabetical-a-z"
         ? "combined.title asc"
         : sort === "alphabetical-z-a"
         ? "combined.title desc"
         : sort === "date-new-old"
         ? "combined.modified_at desc, combined.created_at desc"
         : sort === "date-old-new"
         ? "combined.modified_at asc, combined.created_at asc"
         : "combined.modified_at asc, combined.created_at asc"
     }
    `;
}

export function SQL_getPublicForms(sort: string) {
  return `
    select 
      a.id,
      a.draft_id,
      a.title,
      a.description,
      a.passkey,
      a.privacy_id,
      a.is_deleted,
      a.published_by_id,
      a.published_at relevant_dt,
      a.created_by_id,
      a.created_at,
      a.modified_by_id,
      a.modified_at
    from forms a
    --inner join form_submissions b
    --on a.id != b.form_id
    --and b.id != (
    --  select id from form_submissions
    --  where form_id = b.form_id
    --  order by created_at desc
    --  limit 1
    --)
    where is_deleted = false
    and privacy_id = 1 -- public
     and a.created_by_id <> $1
     --and b.created_by_id <> $1
     order by ${
       sort === "alphabetical-a-z"
         ? "title asc"
         : sort === "alphabetical-z-a"
         ? "title desc"
         : sort === "date-new-old"
         ? "modified_at desc, created_at desc"
         : sort === "date-old-new"
         ? "modified_at asc, created_at asc"
         : "modified_at asc, created_at asc"
     }
    `;
}

export function SQL_getAnsweredForms(sort: string) {
  return `
    select 
      a.id,
      a.draft_id,
      a.title,
      a.description,
      a.passkey,
      a.privacy_id,
      a.is_deleted,
      a.published_by_id,
      b.created_at relevant_dt,
      a.created_by_id,
      a.created_at,
      a.modified_by_id,
      a.modified_at
    from forms a
    inner join form_submissions b
    on a.id = b.form_id
    and b.id = (
      select id from form_submissions
      where form_id = b.form_id
      order by created_at desc
      limit 1
    )
    where a.is_deleted = false
      and b.created_by_id = $1
      and a.created_by_id <> $1
      order by ${
        sort === "alphabetical-a-z"
          ? "a.title asc"
          : sort === "alphabetical-z-a"
          ? "a.title desc"
          : sort === "date-new-old"
          ? "b.created_at desc"
          : sort === "date-old-new"
          ? "b.created_at asc"
          : "b.created_at asc"
      }
  `;
}

export const SQL_getDraftForms = `
  select * from draft_forms
  where created_by_id = $1
  and is_published = false
  and is_deleted = false
  order by modified_at desc, created_at desc
`;

export const SQL_getDraftFormById = `
  select a.*, 
  b.picture created_by_profile_picture,
  b.username created_by_username 
  from draft_forms a
  inner join users b
  on a.created_by_id = b.id
  where a.id = $1
  and a.is_deleted = false
`;

export const SQL_getDraftFormInputs = `select a.*, 
  b.name input_type_name,
  b.description input_type_description
  from draft_author_inputs a
  inner join input_types b
  on a.input_type_id = b.id
  where draft_form_id = $1
  and is_deleted = false
`;

export const SQL_getDraftInputPropertyValues = `
  select a.*, 
  b.* from draft_author_input_property_values a
  inner join input_properties b
  on a.property_id = b.id
  inner join draft_author_inputs c 
  on a.created_input_id = c.id
  where c.draft_form_id = $1
`;

export const SQL_getDraftMultipleChoiceOptions = `
  select a.* from draft_author_multiple_choice_options a
  inner join draft_author_inputs b
  on a.input_id = b.id
  where b.draft_form_id = $1
`;

export const SQL_getDraftLinearScales = `
  select a.* from draft_author_linear_scales a
  inner join draft_author_inputs b
  on a.input_id = b.id
  where b.draft_form_id = $1
`;

export const SQL_getPublishedLinearScales2 = `
  select * from author_linear_scales a
  inner join author_inputs b
  on a.input_id = b.id
  left join submitted_linear_scale_values c
  on a.input_id = c.input_id
  where b.form_id = $1
`;

export const SQL_getPublishedLinearScale = `
  select * from author_linear_scales
  where input_id = $1
`;

export const SQL_getPublishedMultipleChoiceOptions = `
  select * from author_multiple_choice_options
  where input_id = $1
`;

export const SQL_getPublishedForm = `
  select a.*, 
  b.needs_passkey,
  (
    select count(*) from form_submissions
    where form_id = $1
  ) num_responses,
  c.picture created_by_profile_picture,
  c.username created_by_username
  from forms a
  inner join privacy_options b
  on a.privacy_id = b.id
  inner join users c
  on a.created_by_id = c.id
  where a.id = $1
  limit 1
`;

export const SQL_getPasskeyAttempts = `
  select * from passkey_attempts
  where form_id = $1
  and user_id = $2
  and is_valid = true
`;

export function SQL_getPublishedFormInputsWithAnswers(submissionId: string | null) {
  return (
    `
      select a.*, 
      b.name input_type_name,
      b.description input_type_description
      ${submissionId ? ", c.value existing_answer" : ""}
      from author_inputs a
      inner join input_types b
      on a.input_type_id = b.id
      left join submitted_input_values c
      on a.id = c.created_input_id
      where form_id = $1
      and is_deleted = false
      and is_active = true
    ` +
    (submissionId ? "and c.submission_id = $2" : "") +
    `
      order by a.id asc
    `
  );
}

export const SQL_getPublishedFormInputsWithoutAnswers = `
  select a.*, 
  b.name input_type_name,
  b.description input_type_description,
  '' existing_answer
  from author_inputs a
  inner join input_types b
  on a.input_type_id = b.id
  where form_id = $1
  and is_deleted = false
  and is_active = true
  order by a.id asc
`;

export const SQL_getPublishedFormInputPropertyValues = `
  select a.*, 
  b.* from author_input_property_values a
  inner join input_properties b
  on a.property_id = b.id
  inner join author_inputs c 
  on a.created_input_id = c.id
  where c.form_id = $1
`;

export function SQL_getManyPublishedMultipleChoiceOptions(submissionId: string | null) {
  return (
    `
      select a.*,
      (
        case when $2::uuid is not null and $3::uuid is not null then (
          select exists (
            select 1 from submitted_multiple_choice_options a2
            where a2.option_id = a.id
            and a2.user_id = $2
          )
        )
        else false
        end
      ) checked 
      from author_multiple_choice_options a
      inner join author_inputs b
      on a.input_id = b.id
      left join submitted_multiple_choice_options c
      on b.id = c.input_id
      where b.form_id = $1
    ` +
    (submissionId ? "and c.submission_id = $3" : "") +
    `
      order by a.id asc
    `
  );
}

export const SQL_getManyPublishedMultipleChoiceOptions2 = `
  select a.id,
  a.input_id,
  a.label,
  (
    select exists (
      select 1 from submitted_multiple_choice_options a2
      where a2.option_id = a.id
      and a2.input_id = a.input_id
      and a2.submission_id = c.submission_id
      and a2.user_id = c.user_id
    )
  ) checked ,
    a.is_deleted,
  c.submission_id,
  c.user_id submitted_by_id
  from author_multiple_choice_options a
  inner join author_inputs b
  on a.input_id = b.id
  left join submitted_multiple_choice_options c
  on c.input_id = a.input_id  -- Ensure options are correctly tied to inputs
  and c.submission_id in (
    select submission_id from form_submissions where form_id = b.form_id
  )
  where b.form_id = $1
  order by id asc
`;

export function SQL_getPublishedLinearScales(submissionId: string | null) {
  return (
    `
      select a.*
      ${submissionId ? ", c.value existing_value" : ""}
      from author_linear_scales a
      inner join author_inputs b
      on a.input_id = b.id
      left join submitted_linear_scale_values c
      on b.id = c.input_id
      where b.form_id = $1
    ` + (submissionId ? "and c.submission_id = $2" : "")
  );
}

export const SQL_getFormCreatorId = `
select created_by_id from forms
where id = $1
limit 1  
`;

export const SQL_getPublishedFormInputs = `
  select * from author_inputs 
  where form_id = $1
  order by id asc
`;

export const SQL_getSubmittedInputs = `
  select a.*, 
  b.form_id, 
  b.metadata_question, 
  b.metadata_description,
  b.is_required,
  c.name input_type_name 
  from submitted_input_values a
  inner join author_inputs b
  on a.created_input_id = b.id
  inner join input_types c
  on b.input_type_id = c.id
  where form_id = $1
  order by a.created_input_id asc
`;

export const SQL_getSubmissionsWithUserInfo = `
  select a.*, b.email, b.username from form_submissions a
  inner join users b
  on a.created_by_id = b.id
  where form_id = $1
`;

export const SQL_getAllPrivacyOptions = `
  select * from privacy_options  
`;

export const SQL_getAllInputProperties = `
  select * from input_properties 
`;

export const SQL_getDefaultInputPropertyOptions = `
  select a.*,
  b.input_type_id input_type_id from input_property_options a
  inner join input_properties b
  on b.id = a.property_id
`;

export const SQL_getExistingFormDraftInputs = `
  select a.*, 
  b.name input_type_name, 
  b.description input_type_description,
  (
    select cast(count(*) as integer) from draft_author_input_property_values
    where created_input_id = a.id\
    and value is not null and value != ''
  ) num_custom_properties
  from draft_author_inputs a
  inner join input_types b
  on a.input_type_id = b.id
  where a.draft_form_id = $1
  order by a.id asc
`;

export const SQL_getExistingDraftForm = `
  select * from draft_forms
  where created_by_id = $1
  and description = ''
  and title = 'Untitled'
  and modified_at is null
  and is_published = false
  and is_deleted = false
  order by created_at desc
  limit 1
`;

export const SQL_getFormSubmissions = `
      select * from form_submissions
      where form_id = $1
      and created_by_id = $2
      order by created_at desc
    `;

export const SQL_getLatestFormSubmission = `
  select id from form_submissions 
  where form_id = $1
  and created_by_id = $2
  order by created_at desc
  limit 1
`;

export const SQL_getSubmittedInputValues = `
  select * from submitted_input_values
  where created_by_id = $1
  and submission_id = $2
  order by created_at desc
`;

export const SQL_getSubmittedMultipleChoiceOptions = `
  select * from submitted_multiple_choice_options
  where submission_id = $1
`;

export const SQL_getInputInfo = `
  select a.*, 
  b.name input_type_name,
  b.description input_type_description 
  from author_inputs a
  inner join input_types b
  on a.input_type_id = b.id
  where a.id = $1
  and a.created_by_id = $2
  limit 1
`;

export const SQL_getInputProperties = `
  select a.*, 
  b.* from author_input_property_values a
  inner join input_properties b
  on a.property_id = b.id
  inner join author_inputs c 
  on a.created_input_id = c.id
  where c.id = $1
`;

export const SQL_getSingleDraftInput = `
  select * from draft_author_inputs
  where id = $1
  and created_by_id = $2
  limit 1
`;

export const SQL_getPropertiesForDraftInput = `
  select a.*, 
  b.* from draft_author_input_property_values a
  inner join input_properties b
  on a.property_id = b.id
  inner join draft_author_inputs c 
  on a.created_input_id = c.id
  where c.id = $1
`;

export const SQL_getAllActiveDraftForms = `
  select * from draft_forms
  where created_by_id = $1
  and is_deleted = false
  and is_published = false
`;

export const SQL_getSingleInputType = `
  select * from input_types
  where id = $1
  limit 1
`;

export const SQL_getAllDefaultInputTypes = `
  select * from input_types
`;

export const SQL_renewDraftForm = `
  update draft_forms
  set created_at = now()
  where id = $1
  returning *
`;

export const SQL_insertNewDraftForm = `
  insert into draft_forms (
    title,
    description,
    passkey,
    is_published,
    created_by_id,
    created_at,
    modified_by_id,
    modified_at
  ) values (
    'Untitled',
    '',
    '',
    false,
    $1,
    now(),
    null,
    null
  )
  returning *
`;

export const SQL_updateDraftForm = `
  update draft_forms
  set 
    title = $1,
    description = $2,
    passkey = $3,
    can_resubmit = $4,
    modified_by_id = $5,
    privacy_id = $6,
    modified_at = now()
  where id = $7
  returning *
`;

export const SQL_updatePublishedForm = `
  update forms
  set 
    title = $1,
    description = $2,
    passkey = $3,
    privacy_id = $4,
    modified_by_id = $5,
    modified_at = now()
  where id = $6
  returning *
`;

export const SQL_addInputToDraftForm = `
with inserted as (
  insert into draft_author_inputs
    (
    input_type_id,
    draft_form_id,
    metadata_question,
    metadata_description,
    is_active,
    is_required,
    created_at,
    created_by_id,
    modified_by_id,
    modified_at
  ) values (
    $1,
    $2,
    $3,
    $4,
    true,
    $5,
    now(),
    $6,
    null,
    null
  ) returning * 
)
select a.*,
b.name input_type_name
from inserted a
join input_types b
on a.input_type_id = b.id
`;

export const SQL_addInputToPublishedForm = `
with inserted as (
  insert into author_inputs
  (
    draft_input_id,
    input_type_id,
    form_id,
    metadata_question,
    metadata_description,
    is_active,
    is_required,
    published_at,
    published_by_id,
    created_at,
    created_by_id,
    modified_by_id,
    modified_at
  ) values (
    $1,
    $2,
    $3,
    $4,
    $5,
    true,
    $6,
    now(),
    $7,
    now(),
    $7,
    null,
    null
  ) returning * 
)
select a.*,
b.name input_type_name
from inserted a
join input_types b
on a.input_type_id = b.id
`;

export const SQL_addDraftMultipleChoiceOption = `
  insert into draft_author_multiple_choice_options (
    input_id,
    label,
    created_by_id
  ) values (
    $1, 
    $2,
    $3
  )
`;

export const SQL_addPublishedMultipleChoiceOption = `
  insert into author_multiple_choice_options (
    input_id,
    label,
    created_by_id
  ) values (
    $1, 
    $2,
    $3
  )
`;

export const SQL_addDraftLinearScale = `
  insert into draft_author_linear_scales (
    input_id,
    min,
    max,
    created_by_id
  ) values (
    $1,
    $2,
    $3,
    $4
  )
`;

export const SQL_addDraftInputProperty = `
  insert into draft_author_input_property_values
  (
    created_input_id, 
    property_id, 
    input_type_id, 
    value,
    created_at,
    created_by_id, 
    modified_by_id, 
    modified_at
  ) values (
    $1,
    $2,
    $3,
    $4,
    now(),
    $5,
    null,
    null
  ) 
`;

export const SQL_addPublishedInputProperty = `
  insert into author_input_property_values
  (
    created_input_id, 
    property_id, 
    input_type_id, 
    value,
    published_at,
    published_by_id,
    created_at,
    created_by_id, 
    modified_by_id, 
    modified_at
  ) values (
    $1,
    $2,
    $3,
    $4,
    now(),
    $5,
    now(),
    $5,
    null,
    null
  ) 
`;

export const SQL_updatePublishedInput = `
  update author_inputs
  set metadata_question = $1,
  metadata_description = $2,
  is_active = $3,
  is_required = $4,
  modified_by_id = $5,
  modified_at = now()
  where id = $6
  returning *
`;

export const SQL_updateDraftInput = `
  update draft_author_inputs
  set metadata_question = $1,
  metadata_description = $2,
  is_active = $3,
  is_required = $4,
  modified_by_id = $5,
  modified_at = now()
  returning *
`;

export function SQL_updateActiveStatusOnInput(isDraft: boolean) {
  return `
      update ${isDraft ? "draft_author_inputs" : "author_inputs"} 
      set is_active = $1
      where id = $2
      returning *
    `;
}

export const SQL_getPublishedFormByDraftId = `
  select * from forms
  where draft_id = $1
`;

export const SQL_publishDraftForm = `
  insert into forms (
    draft_id,
    title,
    description,
    passkey,
    privacy_id,
    is_deleted,
    can_resubmit,
    published_by_id,
    published_at,
    created_by_id,
    created_at,
    modified_by_id,
    modified_at
  )
  select
    a.id,
    a.title,
    a.description,
    a.passkey,
    a.privacy_id,
    false,
    a.can_resubmit,
    $2,
    now(),
    a.created_by_id,
    a.created_at,
    null,
    null
  from draft_forms a
  where a.id = $1
  returning *
`;

export const updatePublishedStatusOfDraftForm = `
  update draft_forms
  set is_published = true
  where id = $1
`;

export const SQL_publishDraftInputs = `
  insert into author_inputs (
    draft_input_id,
    input_type_id,
    form_id,
    metadata_question ,
    metadata_description,
    is_active,
    is_deleted,
    is_required,
    published_at,
    published_by_id,
    created_at,
    created_by_id,
    modified_by_id,
    modified_at
  )
  select
    a.id,
    a.input_type_id,
    $1,
    a.metadata_question,
    a.metadata_description,
    a.is_active,
    a.is_deleted,
    a.is_required,
    now(),
    $2,
    a.created_at,
    a.created_by_id,
    a.modified_by_id,
    a.modified_at
  from draft_author_inputs a
  where a.draft_form_id = $3
  returning *
`;

export const SQL_publishDraftInputProperties = `
  insert into author_input_property_values (
    created_input_id,
    property_id,
    input_type_id,
    value,
    published_at,
    published_by_id,
    created_at,
    created_by_id,
    modified_by_id,
    modified_at
  )
  select
    $1,
    a.property_id,
    a.input_type_id,
    a.value,
    now(),
    $2,
    a.created_at,
    a.created_by_id,
    null,
    null
  from draft_author_input_property_values a
  inner join draft_author_inputs b
  on a.created_input_id = b.id
  inner join draft_forms c
  on b.draft_form_id = c.id
  where c.id = $3
  and b.id = $4
`;

export const publishLinearScales = `
insert into author_linear_scales (
  input_id,
  min,
  max,
  created_at,
  created_by_id
)
select
  $1,
  a.min,
  a.max,
  now(),
  $2
from draft_author_linear_scales a
inner join draft_author_inputs b
on a.input_id = b.id
inner join draft_forms c
on b.draft_form_id = c.id
where c.id = $3
and b.id = $4
`;

export const SQL_publishMultipleChoiceOptions = `
  insert into author_multiple_choice_options (
    input_id,
    label,
    created_at,
    created_by_id
  )
  select
    $1,
    a.label,
    now(),
    $2
  from draft_author_multiple_choice_options a
  inner join draft_author_inputs b
  on a.input_id = b.id
  inner join draft_forms c
  on b.draft_form_id = c.id
  where c.id = $3
  and b.id = $4
`;

export const SQL_addPasskeyAttempt = `
  insert into passkey_attempts (
    form_id,
    user_id,
    is_valid
  ) values (
    $1, 
    $2,
    $3
  )
`;

export const SQL_deleteDraftForm = `
  update draft_forms
  set is_deleted = true
  where id = $1
  returning *
`;

export const SQL_deletePublishedForm = `
  update forms
  set is_deleted = true
  where id = $1
  returning *
`;

export const SQL_deletePublishedInput = `
  update author_inputs
  set is_deleted = true
  where id = $1
  returning *
`;

export const SQL_addNewFormSubmission = `
  insert into form_submissions (
    form_id,
    created_at,
    created_by_id
  ) values (
    $1,
    now(),
    $2 
  )
  returning *
`;

export const SQL_submitLinearScale = `
  insert into submitted_linear_scale_values (
    input_id,
    submission_id,
    linear_scale_id,
    value,
    user_id
  ) values (
    $1,
    $2,
    (select id from author_linear_scales where input_id = $1 limit 1),
    $3,
    $4
  )
`;

export const SQL_submitMultipleChoiceOption = `
    insert into submitted_multiple_choice_options (
      input_id,
      submission_id,
      option_id,
      user_id
    ) values (
      $1,
      $2,
      $3,
      $4
    )
  `;

export const SQL_submitInputValue = `
    insert into submitted_input_values
    (
      submission_id,
      created_input_id, 
      value, 
      created_at, 
      created_by_id
    )
    values
    (
      $1,
      $2, 
      $3, 
      now(), 
      $4
    ) returning *;
  `;

export const SQL_addFormView = `
  insert into views (
    form_id,
    user_id
  ) values (
    $1,
    $2
  )
`;

export const SQL_getRecentFormViews = `
  select 
  a.form_id,
  max(a.created_at) as max_created_at,
  b.title,
  c.picture profile_picture
  from views a
  inner join forms b
  on a.form_id = b.id
  inner join users c 
  on b.created_by_id = c.id
  where a.user_id = $1
  and b.is_deleted = false
  group by a.form_id, b.title, c.picture
  order by max_created_at desc
  limit 10
`;
