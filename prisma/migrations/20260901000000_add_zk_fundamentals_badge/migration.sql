-- The ZK Fundamentals course badge

INSERT INTO "Badge" (id, name, description, image_path, category, requirements)
VALUES (
  '2blockchainAcademy-7zk-fundamentals',
  'ZK Fundamentals',
  'Completed the ZK Fundamentals course',
  'TODO_BADGE_IMAGE_URL',
  'academy',
  ARRAY[
    '{"id":"zk-fundamentals-complete","type":"course","points":100,"unlocked":false,"course_id":"zk-fundamentals","hackathon":null,"description":"Complete the ZK Fundamentals course"}'::jsonb
  ]
)
ON CONFLICT (id) DO UPDATE SET
  name         = EXCLUDED.name,
  description  = EXCLUDED.description,
  image_path   = EXCLUDED.image_path,
  category     = EXCLUDED.category,
  requirements = EXCLUDED.requirements;
