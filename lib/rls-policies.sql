-- Row Level Security (RLS) Policies for Ternakin
-- These policies ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_activities ENABLE ROW LEVEL SECURITY;

-- Note: feed_ingredients table is global reference data, so no RLS needed

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Farms policies
CREATE POLICY "Users can view own farms" ON farms
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own farms" ON farms
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own farms" ON farms
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own farms" ON farms
  FOR DELETE USING (auth.uid() = owner_id);

-- Livestock batches policies
CREATE POLICY "Users can view livestock batches from own farms" ON livestock_batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = livestock_batches.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert livestock batches to own farms" ON livestock_batches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = livestock_batches.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update livestock batches from own farms" ON livestock_batches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = livestock_batches.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete livestock batches from own farms" ON livestock_batches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = livestock_batches.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

-- Feed types policies
CREATE POLICY "Users can view feed types from own farms" ON feed_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = feed_types.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert feed types to own farms" ON feed_types
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = feed_types.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update feed types from own farms" ON feed_types
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = feed_types.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete feed types from own farms" ON feed_types
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = feed_types.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

-- Feed recipes policies
CREATE POLICY "Users can view feed recipes from own farms" ON feed_recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feed_types 
      JOIN farms ON farms.id = feed_types.farm_id
      WHERE feed_types.id = feed_recipes.feed_type_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert feed recipes to own feed types" ON feed_recipes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM feed_types 
      JOIN farms ON farms.id = feed_types.farm_id
      WHERE feed_types.id = feed_recipes.feed_type_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update feed recipes from own farms" ON feed_recipes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM feed_types 
      JOIN farms ON farms.id = feed_types.farm_id
      WHERE feed_types.id = feed_recipes.feed_type_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete feed recipes from own farms" ON feed_recipes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM feed_types 
      JOIN farms ON farms.id = feed_types.farm_id
      WHERE feed_types.id = feed_recipes.feed_type_id 
      AND farms.owner_id = auth.uid()
    )
  );

-- Feeding schedules policies
CREATE POLICY "Users can view feeding schedules from own farms" ON feeding_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM livestock_batches 
      JOIN farms ON farms.id = livestock_batches.farm_id
      WHERE livestock_batches.id = feeding_schedules.batch_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert feeding schedules to own batches" ON feeding_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM livestock_batches 
      JOIN farms ON farms.id = livestock_batches.farm_id
      WHERE livestock_batches.id = feeding_schedules.batch_id 
      AND farms.owner_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM feed_types 
      JOIN farms ON farms.id = feed_types.farm_id
      WHERE feed_types.id = feeding_schedules.feed_type_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update feeding schedules from own farms" ON feeding_schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM livestock_batches 
      JOIN farms ON farms.id = livestock_batches.farm_id
      WHERE livestock_batches.id = feeding_schedules.batch_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete feeding schedules from own farms" ON feeding_schedules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM livestock_batches 
      JOIN farms ON farms.id = livestock_batches.farm_id
      WHERE livestock_batches.id = feeding_schedules.batch_id 
      AND farms.owner_id = auth.uid()
    )
  );

-- Financial transactions policies
CREATE POLICY "Users can view financial transactions from own farms" ON financial_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = financial_transactions.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert financial transactions to own farms" ON financial_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = financial_transactions.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update financial transactions from own farms" ON financial_transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = financial_transactions.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete financial transactions from own farms" ON financial_transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = financial_transactions.farm_id 
      AND farms.owner_id = auth.uid()
    )
  );

-- Livestock activities policies
CREATE POLICY "Users can view livestock activities from own farms" ON livestock_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM livestock_batches 
      JOIN farms ON farms.id = livestock_batches.farm_id
      WHERE livestock_batches.id = livestock_activities.batch_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert livestock activities to own batches" ON livestock_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM livestock_batches 
      JOIN farms ON farms.id = livestock_batches.farm_id
      WHERE livestock_batches.id = livestock_activities.batch_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update livestock activities from own farms" ON livestock_activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM livestock_batches 
      JOIN farms ON farms.id = livestock_batches.farm_id
      WHERE livestock_batches.id = livestock_activities.batch_id 
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete livestock activities from own farms" ON livestock_activities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM livestock_batches 
      JOIN farms ON farms.id = livestock_batches.farm_id
      WHERE livestock_batches.id = livestock_activities.batch_id 
      AND farms.owner_id = auth.uid()
    )
  );

-- Allow all users to read feed_ingredients (global reference data)
CREATE POLICY "Anyone can view feed ingredients" ON feed_ingredients
  FOR SELECT USING (true);
