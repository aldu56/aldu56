-- RLS / business-rule test. Fails loudly (raise exception) on any violation.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id, email, raw_user_meta_data, aud, role) values
  ('11111111-1111-1111-1111-111111111111', 'mirror@test.dev', '{"full_name":"Mirror Owner"}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'comb@test.dev', '{"full_name":"Comb Owner"}', 'authenticated', 'authenticated');

do $$ begin
  if (select count(*) from public.profiles) <> 2 then raise exception 'profile trigger failed'; end if;
end $$;

-- grant like Supabase does for the API roles
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant insert on public.contact_messages, public.newsletter_subscribers to anon;

-- ===== user 1 claims a mirror
set local role authenticated;
select set_config('request.jwt.claims', '{\"sub\":\"11111111-1111-1111-1111-111111111111\",\"role\":\"authenticated\"}', true), set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select public.claim_device('elm-demo-0001', 'Vanity');

do $$ declare d uuid; begin
  select id into d from public.devices;
  if d is null then raise exception 'claim failed'; end if;
  -- registry hidden from clients
  if exists (select 1 from public.device_registry) then raise exception 'registry should be invisible'; end if;
  -- skin insert allowed with mirror
  insert into public.skin_analyses (user_id, device_id, overall_score, hydration, oiliness, pores, wrinkles, redness, pigmentation, elasticity, skin_type)
  values (auth.uid(), d, 70, 60, 40, 30, 20, 10, 20, 70, 'normal');
  insert into public.recommendations (user_id, kind, analysis_id, title, body, category) values (auth.uid(), 'skin', gen_random_uuid(), 't', 'b', 'c');
  insert into public.routine_steps (user_id, kind, time_of_day, step_order, title) values (auth.uid(), 'skin', 'morning', 1, 'Cleanse');
end $$;

-- scalp insert must FAIL for a mirror-only customer
do $$ begin
  begin
    insert into public.scalp_analyses (user_id, device_id, overall_score, hydration, oiliness, flaking, sensitivity, density, follicle_health, scalp_type)
    select auth.uid(), id, 70, 60, 40, 30, 20, 60, 70, 'balanced' from public.devices limit 1;
    raise exception 'scalp insert should have been blocked';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.routine_steps (user_id, kind, time_of_day, step_order, title) values (auth.uid(), 'scalp', 'morning', 1, 'x');
    raise exception 'scalp routine should have been blocked';
  exception when insufficient_privilege then null; end;
end $$;

-- orders: only pending, only self
insert into public.orders (user_id, subtotal_cents, total_cents, shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_country)
values (auth.uid(), 100, 100, 'A', 'B', 'C', 'D', 'E');
do $$ begin
  begin
    insert into public.orders (user_id, status, subtotal_cents, total_cents, shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_country)
    values (auth.uid(), 'paid', 100, 100, 'A', 'B', 'C', 'D', 'E');
    raise exception 'paid order insert should be blocked';
  exception when insufficient_privilege then null; end;
end $$;

-- ===== user 2 claims a comb, cannot steal the mirror, cannot read user 1 data
select set_config('request.jwt.claims', '{\"sub\":\"22222222-2222-2222-2222-222222222222\",\"role\":\"authenticated\"}', true), set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select public.claim_device('ELC-DEMO-0001');
do $$ begin
  begin
    perform public.claim_device('ELM-DEMO-0001');
    raise exception 'double claim should fail';
  exception when unique_violation then null; end;
  begin
    perform public.claim_device('ELM-NOPE-0001');
    raise exception 'unknown serial should fail';
  exception when no_data_found then null; end;
  if (select count(*) from public.devices) <> 1 then raise exception 'user 2 sees foreign devices'; end if;
  if exists (select 1 from public.skin_analyses) then raise exception 'user 2 sees foreign analyses'; end if;
  if exists (select 1 from public.orders) then raise exception 'user 2 sees foreign orders'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'user 2 sees foreign profiles'; end if;
  -- comb owner may insert scalp, not skin
  insert into public.scalp_analyses (user_id, device_id, overall_score, hydration, oiliness, flaking, sensitivity, density, follicle_health, scalp_type)
  select auth.uid(), id, 70, 60, 40, 30, 20, 60, 70, 'balanced' from public.devices;
  begin
    insert into public.skin_analyses (user_id, device_id, overall_score, hydration, oiliness, pores, wrinkles, redness, pigmentation, elasticity, skin_type)
    select auth.uid(), id, 70, 60, 40, 30, 20, 10, 20, 70, 'normal' from public.devices;
    raise exception 'skin insert should be blocked for comb owner';
  exception when insufficient_privilege then null; end;
end $$;

-- ===== user 1 releases mirror; history survives; serial becomes claimable
select set_config('request.jwt.claims', '{\"sub\":\"11111111-1111-1111-1111-111111111111\",\"role\":\"authenticated\"}', true), set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select public.release_device((select id from public.devices limit 1));
do $$ begin
  if exists (select 1 from public.devices) then raise exception 'release failed'; end if;
  if (select count(*) from public.skin_analyses) <> 1 then raise exception 'history should survive device removal'; end if;
end $$;

-- ===== anon can write public forms
reset role;
set local role anon;
insert into public.contact_messages (name, email, message) values ('A', 'a@b.co', 'hello there');
insert into public.newsletter_subscribers (email) values ('a@b.co');

reset role;
select 'ALL RLS TESTS PASSED' as result;
rollback;
