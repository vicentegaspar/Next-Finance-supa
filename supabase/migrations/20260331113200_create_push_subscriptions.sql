create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Policies for push_subscriptions
create policy "Users can view their own push subscriptions"
  on public.push_subscriptions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own push subscriptions"
  on public.push_subscriptions for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own push subscriptions"
  on public.push_subscriptions for delete
  using ( auth.uid() = user_id );

-- An update policy just in case the endpoint rotates keys
create policy "Users can update their own push subscriptions"
  on public.push_subscriptions for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- Create a unique constraint to avoid duplicate endpoints per user
alter table public.push_subscriptions 
add constraint push_subscriptions_endpoint_unique unique (user_id, endpoint);
