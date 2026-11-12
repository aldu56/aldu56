-- Demo serial numbers for local development and QA.
-- In production, the manufacturing system inserts real serials into device_registry
-- (see scripts/register-serials.mjs).
insert into public.device_registry (serial, device_type)
select 'ELM-DEMO-' || lpad(g::text, 4, '0'), 'mirror'::public.device_type from generate_series(1, 50) g
on conflict do nothing;

insert into public.device_registry (serial, device_type)
select 'ELC-DEMO-' || lpad(g::text, 4, '0'), 'comb'::public.device_type from generate_series(1, 50) g
on conflict do nothing;
