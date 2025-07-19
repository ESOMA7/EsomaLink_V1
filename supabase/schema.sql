-- Create interventions table
CREATE TABLE IF NOT EXISTS interventions (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    numeros TEXT NOT NULL,
    fecha DATE NOT NULL,
    caso TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('Pendiente', 'En Proceso', 'Resuelto')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- Create policies for interventions table
CREATE POLICY "Allow all operations on interventions" ON interventions
    FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_interventions_updated_at
    BEFORE UPDATE ON interventions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();