/*
  # Activity Tracker Database Schema

  1. New Tables
    - `activity_events`
      - `id` (uuid, primary key) - Unique event identifier
      - `timestamp` (timestamptz) - When the event occurred
      - `event_type` (text) - Type of event: 'app_open', 'app_close', 'screenshot', 'screen_recording_start', 'screen_recording_stop', 'share'
      - `app_package_name` (text) - Android package name (e.g., com.example.app)
      - `app_name` (text) - Human-readable app name
      - `device_id` (text) - Unique device identifier for tracking
      - `metadata` (jsonb) - Additional event-specific data
      - `created_at` (timestamptz) - Database record creation time

    - `app_metadata`
      - `id` (uuid, primary key) - Unique identifier
      - `package_name` (text, unique) - Android package name
      - `app_name` (text) - Human-readable app name
      - `icon_url` (text) - Optional URL to app icon
      - `first_seen` (timestamptz) - First time this app was detected
      - `last_seen` (timestamptz) - Last time this app was detected
      - `event_count` (integer) - Total number of events for this app

  2. Indexes
    - Index on activity_events.timestamp for date-based sorting
    - Index on activity_events.event_type for filtering by action
    - Index on activity_events.app_package_name for app-specific queries
    - Index on activity_events.device_id for per-device filtering
    - Composite index on (device_id, timestamp) for efficient pagination

  3. Security
    - Enable RLS on both tables
    - Add policies for device-specific data access
*/

-- Create activity_events table
CREATE TABLE IF NOT EXISTS activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  app_package_name text NOT NULL,
  app_name text NOT NULL DEFAULT '',
  device_id text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create app_metadata table
CREATE TABLE IF NOT EXISTS app_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name text UNIQUE NOT NULL,
  app_name text NOT NULL DEFAULT '',
  icon_url text,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  event_count integer DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_events_timestamp ON activity_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_event_type ON activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_package ON activity_events(app_package_name);
CREATE INDEX IF NOT EXISTS idx_activity_events_device_id ON activity_events(device_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_device_timestamp ON activity_events(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_app_metadata_package ON app_metadata(package_name);

-- Enable Row Level Security
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_events
-- Allow all operations for now since there's no user authentication
-- In production, you'd want to restrict by device_id or user_id
CREATE POLICY "Allow public read access to activity_events"
  ON activity_events FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to activity_events"
  ON activity_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to activity_events"
  ON activity_events FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from activity_events"
  ON activity_events FOR DELETE
  USING (true);

-- Create policies for app_metadata
CREATE POLICY "Allow public read access to app_metadata"
  ON app_metadata FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to app_metadata"
  ON app_metadata FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to app_metadata"
  ON app_metadata FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from app_metadata"
  ON app_metadata FOR DELETE
  USING (true);

-- Create a function to update app_metadata when new events are inserted
CREATE OR REPLACE FUNCTION update_app_metadata()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO app_metadata (package_name, app_name, last_seen, event_count)
  VALUES (NEW.app_package_name, NEW.app_name, NEW.timestamp, 1)
  ON CONFLICT (package_name) 
  DO UPDATE SET
    app_name = EXCLUDED.app_name,
    last_seen = EXCLUDED.last_seen,
    event_count = app_metadata.event_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update app_metadata
DROP TRIGGER IF EXISTS trigger_update_app_metadata ON activity_events;
CREATE TRIGGER trigger_update_app_metadata
  AFTER INSERT ON activity_events
  FOR EACH ROW
  EXECUTE FUNCTION update_app_metadata();