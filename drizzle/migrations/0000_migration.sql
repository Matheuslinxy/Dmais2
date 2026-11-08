create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own roles" on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- First account created becomes the administrator
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_first_admin after insert on auth.users
for each row execute function public.handle_first_admin();

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where role = 'admin') $$;
grant execute on function public.admin_exists() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- SERVICES
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  icon text not null default 'square',
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "Public reads active services" on public.services for select to anon, authenticated using (active or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert services" on public.services for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update services" on public.services for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete services" on public.services for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger services_touch before update on public.services for each row execute function public.touch_updated_at();

-- PORTFOLIO
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'outros',
  image_url text,
  video_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.portfolio_items to anon, authenticated;
grant insert, update, delete on public.portfolio_items to authenticated;
grant all on public.portfolio_items to service_role;
alter table public.portfolio_items enable row level security;
create policy "Public reads published work" on public.portfolio_items for select to anon, authenticated using (published or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert work" on public.portfolio_items for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update work" on public.portfolio_items for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete work" on public.portfolio_items for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger portfolio_touch before update on public.portfolio_items for each row execute function public.touch_updated_at();

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  text text not null,
  rating int not null default 5,
  source text not null default 'Avaliação pública do Google',
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "Public reads visible reviews" on public.reviews for select to anon, authenticated using (visible or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert reviews" on public.reviews for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update reviews" on public.reviews for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete reviews" on public.reviews for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger reviews_touch before update on public.reviews for each row execute function public.touch_updated_at();

-- SITE SETTINGS (single row)
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'Dmais Comunicação Visual',
  logo_url text,
  primary_color text not null default '#22E06B',
  hero_eyebrow text not null default '',
  hero_title text not null default '',
  hero_text text not null default '',
  about_title text not null default '',
  about_text text not null default '',
  about_bullets text[] not null default '{}',
  services_intro text not null default '',
  portfolio_intro text not null default '',
  cta_title text not null default '',
  cta_text text not null default '',
  whatsapp text not null default '',
  phone_display text not null default '',
  address text not null default '',
  city text not null default '',
  instagram_handle text not null default '',
  instagram_url text not null default '',
  maps_url text not null default '',
  google_rating text not null default '',
  google_reviews_count text not null default '',
  instagram_posts text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

insert into public.site_settings (id, hero_eyebrow, hero_title, hero_text, about_title, about_text, about_bullets, services_intro, portfolio_intro, cta_title, cta_text, whatsapp, phone_display, address, city, instagram_handle, instagram_url, maps_url, google_rating, google_reviews_count, instagram_posts)
values (1,
 'Comunicação visual em Goiânia',
 'Sua marca em destaque.',
 'Damos vida às suas ideias com soluções em comunicação visual. Fachadas, letreiros, placas, faixas, banners e muito mais para sua marca ser vista.',
 'Sua ideia. Nossa comunicação.',
 'A Dmais Comunicação Visual trabalha com soluções para destacar marcas, divulgar negócios e levar informação até as pessoas. Atendemos Goiânia e região com serviços de fachadas, letreiros, placas, faixas, banners, adesivos, cavaletes e comunicação visual em geral.',
 array['Atendimento próximo','Soluções personalizadas','Diversidade de materiais','Orçamento pelo WhatsApp'],
 'Do pequeno detalhe à fachada da sua empresa: conte com a Dmais para apresentar sua marca com clareza e personalidade.',
 'Algumas das soluções que você pode solicitar para destacar seu negócio. Peça um orçamento e conte o que está imaginando.',
 'Peça seu orçamento.',
 'Conte o que você precisa. Envie sua solicitação pelo formulário e continue a conversa diretamente com a equipe da Dmais pelo WhatsApp.',
 '5562981504537', '(62) 98150-4537',
 'Av. Abel Coimbra, próximo ao Detran Cidade Jardim', 'Goiânia – GO',
 '@dmais_comunicacaovisual', 'https://www.instagram.com/dmais_comunicacaovisual/',
 'https://maps.app.goo.gl/FTg4R91m7H8ESc5Z8', '4,7', '13', '+189');

insert into public.services (slug, title, description, icon, sort_order) values
 ('fachadas','Fachadas','Valorize a entrada do seu negócio e chame a atenção de quem passa.','store',1),
 ('letreiros','Letreiros','Destaque o nome da sua empresa com letreiros de presença.','sparkles',2),
 ('placas','Placas','Placas para identificação, divulgação e sinalização.','signpost',3),
 ('faixas-banners','Faixas e banners','Divulgue promoções, eventos e sua empresa em diferentes espaços.','flag',4),
 ('adesivos','Adesivos','Personalização de superfícies para comunicar sua marca.','sticker',5),
 ('cavaletes-outros','Cavaletes e outros','Soluções de comunicação visual para diferentes necessidades.','layers',6);

insert into public.reviews (author, text, rating, source, sort_order) values
 ('Elizeu Coutinho','Ótimo atendimento, qualidade de serviço, super recomendo.',5,'Avaliação pública do Google',1),
 ('Maria de Lourdes Borges','Excelente profissional, atendimento de primeira. Super recomendo.',5,'Avaliação pública do Google',2),
 ('Cliente Dmais','Maravilhoso, ótimo trabalho, amei.',5,'Trecho de avaliação pública informado pelo cliente',3);