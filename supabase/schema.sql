-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES (Linked to Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONTACTS (Clients/Leads)
create table contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete set null, -- Agent owner
  first_name text,
  last_name text,
  email text,
  phone text,
  lead_source text, -- 'Campana' from Excel
  status text default 'New Lead', -- 'New Lead', 'Contacted', 'Qualified', 'Offer', 'Closed', 'Archived'
  last_contacted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tags text[] default '{}'
);

-- PROPERTIES (Inventory)
create table properties (
  id uuid default uuid_generate_v4() primary key,
  address text not null,
  city text,
  price numeric,
  type text, -- 'Apartment', 'House', 'Land'
  listing_status text default 'Active',
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DEALS (Transactions - Mapped to Excel 'Sales' tab)
create table deals (
  id uuid default uuid_generate_v4() primary key,
  contact_id uuid references contacts(id),
  property_id uuid references properties(id),
  
  -- Core Transaction Data
  deal_date date,                 -- 'Fecha'
  property_description text,      -- 'Property' (Fallback if not linked to properties table)
  client_name text,               -- 'Client' (Fallback/Legacy name)
  deal_type text,                 -- 'Type' (Reventa, Alquiler, etc.)
  status text,                    -- 'Status' (Pagado, Pendiente)
  
  -- Financials
  volume numeric,                 -- 'Volume'
  commission_pct numeric,         -- '% De Comision'
  commission_gross numeric,       -- 'Comision antes Split'
  split_details text,             -- 'Split'
  commission_net numeric,         -- 'Comision Neta'
  payment_date date,              -- 'Fecha de Pago'
  
  -- Marketing & Reporting
  campaign_source text,           -- 'Campana'
  campaign_cost numeric,          -- 'Inversion de campana'
  first_contact_date date,        -- 'Primer Contacto'
  closing_date date,              -- 'Cierre'
  closing_cycle_days integer,     -- 'Ciclo de Cierre'
  comments text,                  -- 'Comentarios'
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INTERACTIONS (Calls, Emails, Meetings)
create table interactions (
  id uuid default uuid_generate_v4() primary key,
  contact_id uuid references contacts(id) on delete cascade not null,
  type text not null, -- 'Call', 'Email', 'Meeting', 'Note'
  summary text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references profiles(id)
);

-- TASKS (Calendar Sync)
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  due_date timestamp with time zone,
  is_completed boolean default false,
  contact_id uuid references contacts(id),
  assigned_to uuid references profiles(id),
  google_event_id text, -- ID for Google Calendar Sync
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AUTOMATIONS
create table automations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  trigger_event text not null, -- 'contact_created', 'status_changed'
  conditions jsonb default '{}', -- e.g. { "source": "Facebook" }
  actions jsonb default '[]', -- e.g. [{ "type": "create_task", "title": "Call Lead" }]
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SMARTLISTS (Saved Filters)
create table smartlists (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  filters jsonb not null, -- e.g. { "status": "New Lead", "days_since_contact": 3 }
  user_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table contacts enable row level security;
alter table deals enable row level security;
alter table interactions enable row level security;
alter table tasks enable row level security;

-- Policies (Simple 'authenticated users can read everything' for MVP single-tenant)
create policy "Allow auth users to view profiles" on profiles for select to authenticated using (true);
create policy "Allow auth users to view contacts" on contacts for select to authenticated using (true);
create policy "Allow auth users to insert contacts" on contacts for insert to authenticated with check (true);
create policy "Allow auth users to update contacts" on contacts for update to authenticated using (true);

create policy "Allow auth users to view deals" on deals for select to authenticated using (true);
create policy "Allow auth users to insert deals" on deals for insert to authenticated with check (true);

-- (Repeat similar policies for other tables as needed for MVP)
