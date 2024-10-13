INSERT INTO
  "auth"."users" (
    "instance_id",
    "id",
    "aud",
    "role",
    "email",
    "encrypted_password",
    "email_confirmed_at",
    "invited_at",
    "confirmation_token",
    "confirmation_sent_at",
    "recovery_token",
    "recovery_sent_at",
    "email_change_token_new",
    "email_change",
    "email_change_sent_at",
    "last_sign_in_at",
    "raw_app_meta_data",
    "raw_user_meta_data",
    "is_super_admin",
    "created_at",
    "updated_at",
    "phone",
    "phone_confirmed_at",
    "phone_change",
    "phone_change_token",
    "phone_change_sent_at",
    "email_change_token_current",
    "email_change_confirm_status",
    "banned_until",
    "reauthentication_token",
    "reauthentication_sent_at",
    "is_sso_user",
    "deleted_at",
    "is_anonymous"
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'cf836d11-a91f-4117-b22c-1a6c8674ebc1',
    'authenticated',
    'authenticated',
    'test@test.com',
    '$2a$10$TuX1QlFGUNJncJ672wMJVuJIY/Bz7nWFZsEygItkH3SRoPCG.Y2TG',
    '2024-10-10 10:36:23.928746+00',
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    null,
    '2024-10-10 10:36:23.925439+00',
    '2024-10-10 10:36:23.928869+00',
    null,
    null,
    '',
    '',
    null,
    '',
    '0',
    null,
    '',
    null,
    'false',
    null,
    'false'
  )
;