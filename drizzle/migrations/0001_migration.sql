create policy "Admins upload site media" on storage.objects for insert to authenticated
with check (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update site media" on storage.objects for update to authenticated
using (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete site media" on storage.objects for delete to authenticated
using (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins read site media" on storage.objects for select to authenticated
using (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));