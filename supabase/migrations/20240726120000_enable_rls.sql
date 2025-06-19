-- Enable RLS for all tables
alter table "public"."users" enable row level security;
alter table "public"."payments" enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own data" on "public"."users";
drop policy if exists "Users can insert their own data" on "public"."users";
drop policy if exists "Users can view their own payments" on "public"."payments";

-- Policies for the "users" table
create policy "Users can view their own data"
on "public"."users" for select
using (auth.uid() = id);

create policy "Users can insert their own data"
on "public"."users" for insert
with check (auth.uid() = id);

-- Policies for the "payments" table
create policy "Users can view their own payments"
on "public"."payments" for select
using (auth.uid() = user_id);

-- Note: Inserts into the "payments" table are handled by the Stripe webhook
-- which uses the service_role_key and bypasses RLS.
-- Therefore, no insert policy is needed for users. 