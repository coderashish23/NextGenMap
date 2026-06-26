-- Indoor Wayfinder - Database Schema
-- Run this in your Supabase project SQL editor

-- Buildings
CREATE TABLE buildings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) NOT NULL,
  name       text NOT NULL DEFAULT 'My Building',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own buildings"
  ON buildings FOR ALL
  USING (auth.uid() = user_id);

-- Floors
CREATE TABLE floors (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id       uuid REFERENCES buildings(id) ON DELETE CASCADE NOT NULL,
  floor_number      int NOT NULL,
  label             text NOT NULL DEFAULT '',
  width             float NOT NULL DEFAULT 800,
  height            float NOT NULL DEFAULT 600,
  image_url         text,
  scale_px_per_meter float NOT NULL DEFAULT 10,
  sort_order        int NOT NULL DEFAULT 0
);
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage floors of their buildings"
  ON floors FOR ALL
  USING (
    EXISTS (SELECT 1 FROM buildings WHERE buildings.id = floors.building_id AND buildings.user_id = auth.uid())
  );

-- Rooms / Points of Interest
CREATE TABLE rooms (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id  uuid REFERENCES floors(id) ON DELETE CASCADE NOT NULL,
  name      text NOT NULL,
  type      text NOT NULL DEFAULT 'room' CHECK (type IN ('room', 'corridor', 'stairs', 'elevator', 'entrance', 'restroom')),
  x         float NOT NULL,
  y         float NOT NULL,
  width     float NOT NULL DEFAULT 40,
  height    float NOT NULL DEFAULT 40,
  polygon   jsonb
);
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rooms of their buildings"
  ON rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM floors
      JOIN buildings ON buildings.id = floors.building_id
      WHERE floors.id = rooms.floor_id AND buildings.user_id = auth.uid()
    )
  );

-- Connections (edges for pathfinding graph)
CREATE TABLE connections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_room_id  uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  to_room_id    uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  type          text NOT NULL DEFAULT 'walk' CHECK (type IN ('walk', 'stairs', 'elevator')),
  bidirectional boolean NOT NULL DEFAULT true
);
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage connections of their buildings"
  ON connections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      JOIN floors ON floors.id = rooms.floor_id
      JOIN buildings ON buildings.id = floors.building_id
      WHERE rooms.id = connections.from_room_id AND buildings.user_id = auth.uid()
    )
  );

-- QR Anchors
CREATE TABLE anchors (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id  uuid REFERENCES floors(id) ON DELETE CASCADE NOT NULL,
  label     text NOT NULL,
  x         float NOT NULL,
  y         float NOT NULL,
  heading   float NOT NULL,
  qr_data   text UNIQUE NOT NULL
);
ALTER TABLE anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage anchors of their buildings"
  ON anchors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM floors
      JOIN buildings ON buildings.id = floors.building_id
      WHERE floors.id = anchors.floor_id AND buildings.user_id = auth.uid()
    )
  );

-- Navigation sessions
CREATE TABLE nav_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) NOT NULL,
  building_id       uuid REFERENCES buildings(id) NOT NULL,
  current_floor_id  uuid REFERENCES floors(id),
  current_x         float NOT NULL DEFAULT 0,
  current_y         float NOT NULL DEFAULT 0,
  current_heading   float NOT NULL DEFAULT 0,
  destination_room_id uuid REFERENCES rooms(id),
  started_at        timestamptz DEFAULT now(),
  ended_at          timestamptz
);
ALTER TABLE nav_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own nav sessions"
  ON nav_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Auto-create building for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.buildings (user_id, name)
  VALUES (NEW.id, 'My Building');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX idx_floors_building_id ON floors(building_id);
CREATE INDEX idx_rooms_floor_id ON rooms(floor_id);
CREATE INDEX idx_connections_from_room_id ON connections(from_room_id);
CREATE INDEX idx_connections_to_room_id ON connections(to_room_id);
CREATE INDEX idx_anchors_floor_id ON anchors(floor_id);
CREATE INDEX idx_nav_sessions_user_id ON nav_sessions(user_id);
