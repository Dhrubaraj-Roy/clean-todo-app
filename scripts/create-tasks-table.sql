-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('past', 'present', 'future')),
  position DOUBLE PRECISION NOT NULL,
  details JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);

-- Create an index on status for faster filtering
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);

-- Create an index on position for faster ordering
CREATE INDEX IF NOT EXISTS tasks_position_idx ON tasks(position);

-- Create an index on completed for faster filtering
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON tasks(completed);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);