-- Add completed column to existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Create index on completed column
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON tasks(completed);

-- Update existing tasks to set completed = true where completed_at is not null
UPDATE tasks SET completed = true WHERE completed_at IS NOT NULL; xq