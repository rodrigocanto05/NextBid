#categories

insert into categorie (cat_name) values ('Eletrónica');          # cat_id = 1
insert into categorie (cat_name) values ('Moda');                # cat_id = 2
insert into categorie (cat_name) values ('Casa');                # cat_id = 3
insert into categorie (cat_name) values ('Desporto');            # cat_id = 4
insert into categorie (cat_name) values ('Colecionáveis');       # cat_id = 5
insert into categorie (cat_name) values ('Videojogos');          # cat_id = 6
insert into categorie (cat_name) values ('Automóveis');          # cat_id = 7
insert into categorie (cat_name) values ('Livros');              # cat_id = 8

#users

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Rodrigo Canto', 'rodrigocanto@hotmail.com', 'canto', 'M', str_to_date('2005.10.20','%Y.%m.%d'), 'rodrigo_canto.jpg', 'Estudante e fã de tecnologia.', 120, 'admin', str_to_date('2025.10.20','%Y.%m.%d'));        

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Rodrigo Daibert', 'rodrigodaibert@hotmail.com', '1234', 'M', str_to_date('2005.10.22','%Y.%m.%d'), 'rodrigo_daibert.jpg', 'Gosto de leilões e gaming.', 95, 'admin', str_to_date('2025.10.22','%Y.%m.%d'));       

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Marco Fonseca', 'mf2006@gmail.com', 'hash1', 'M', str_to_date('2006.10.24','%Y.%m.%d'), 'marco_fonseca.jpg', 'Colecionador e vendedor ocasional.', 180, 'admin', str_to_date('2025.10.24','%Y.%m.%d'));            

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Luis Quirim', 'luisquirim@gmail.com', 'hash1', 'M', str_to_date('2004.10.28','%Y.%m.%d'), 'luis_quirim.jpg', 'Interesso-me por artigos para casa e carros.', 60, 'normaluser', str_to_date('2025.10.28','%Y.%m.%d'));    

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Sandra Estrela', 'sandra@hotmail.com', 'hash1', 'F', str_to_date('2003.10.30','%Y.%m.%d'), 'sandra_estrela.jpg', 'Adoro moda e decoração.', 140, 'normaluser', str_to_date('2025.10.30','%Y.%m.%d'));                 

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Daniel Paulo', 'dexpaulo@hotmail.com', 'hash1', 'M', str_to_date('2005.11.01','%Y.%m.%d'), 'daniel_paulo.jpg', 'Utilizador ativo na plataforma.', 75, 'admin', str_to_date('2025.11.01','%Y.%m.%d'));               

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Jocy Grangeiro', 'jocy12@gmail.com', 'hash1', 'F', str_to_date('2004.11.04','%Y.%m.%d'), 'jocy_grangeiro.jpg', 'Gosto de oportunidades e prémios.', 110, 'normaluser', str_to_date('2025.11.04','%Y.%m.%d'));            

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Paulo Alberto', 'pauloencomendas@gmail.com', 'hash1', 'M', str_to_date('2001.11.09','%Y.%m.%d'), 'paulo_alberto.jpg', 'Interessa-me eletrónica e desporto.', 90, 'normaluser', str_to_date('2025.11.09','%Y.%m.%d'));     

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Patricia Daibert', 'patriciadaibert@hotmail.com', 'hash1', 'F', str_to_date('2002.11.13','%Y.%m.%d'), 'patricia_daibert.jpg', 'Procuro artigos de moda e casa.', 130, 'normaluser', str_to_date('2025.11.13','%Y.%m.%d')); 

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Martim Fonseca', 'mrmartim@hotmail.com', 'hash1', 'M', str_to_date('2006.12.01','%Y.%m.%d'), 'martim_fonseca.jpg', 'Curioso por videojogos e gadgets.', 55, 'normaluser', str_to_date('2025.12.01','%Y.%m.%d'));          

insert into userss (usr_name, usr_email, usr_password, usr_gender, usr_birthdate, usr_photo, usr_bio, usr_xp, usr_role, usr_created_at)
values ('Tomas Lebre', 'tomaslebre@gmail.com', 'hash1', 'M', str_to_date('2005.12.02','%Y.%m.%d'), 'tomas_lebre.jpg', 'Participante frequente em leilões.', 70, 'normaluser', str_to_date('2025.12.02','%Y.%m.%d'));

#products

insert into product (prd_name, prd_description, prd_cat_id, prd_usr_id, prd_condition, prd_start_price, prd_location, prd_latitude, prd_longitude, prd_status, prd_ends_at, prd_created_at)
values ('iPhone 13', 'iPhone 13 em excelente estado, 128GB.', 1, 1, 'very good', 450.00, 'Lisboa', 38.7223000, -9.1393000, 'active', str_to_date('2025.12.20','%Y.%m.%d'), str_to_date('2025.12.10','%Y.%m.%d'));   # prd_id = 1

insert into product (prd_name, prd_description, prd_cat_id, prd_usr_id, prd_condition, prd_start_price, prd_location, prd_latitude, prd_longitude, prd_status, prd_ends_at, prd_created_at)
values ('PlayStation 5', 'Consola PS5 com comando incluído.', 6, 3, 'good', 380.00, 'Almada', 38.6800000, -9.1580000, 'active', str_to_date('2025.12.21','%Y.%m.%d'), str_to_date('2025.12.11','%Y.%m.%d'));    # prd_id = 2

insert into product (prd_name, prd_description, prd_cat_id, prd_usr_id, prd_condition, prd_start_price, prd_location, prd_latitude, prd_longitude, prd_status, prd_ends_at, prd_created_at)
values ('Casaco de Pele', 'Casaco em muito bom estado, tamanho M.', 2, 5, 'good', 60.00, 'Porto', 41.1579000, -8.6291000, 'active', str_to_date('2025.12.22','%Y.%m.%d'), str_to_date('2025.12.12','%Y.%m.%d')); # prd_id = 3

insert into product (prd_name, prd_description, prd_cat_id, prd_usr_id, prd_condition, prd_start_price, prd_location, prd_latitude, prd_longitude, prd_status, prd_ends_at, prd_created_at)
values ('Bicicleta BTT', 'Bicicleta de montanha com pouco uso.', 4, 1, 'good', 150.00, 'Braga', 41.5454000, -8.4265000, 'active', str_to_date('2025.12.24','%Y.%m.%d'), str_to_date('2025.12.12','%Y.%m.%d'));   # prd_id = 4

insert into product (prd_name, prd_description, prd_cat_id, prd_usr_id, prd_condition, prd_start_price, prd_location, prd_latitude, prd_longitude, prd_status, prd_ends_at, prd_created_at)
values ('Relógio Vintage', 'Relógio colecionável dos anos 80.', 5, 3, 'satisfactory', 90.00, 'Coimbra', 40.2033000, -8.4103000, 'active', str_to_date('2025.12.23','%Y.%m.%d'), str_to_date('2025.12.13','%Y.%m.%d'));  # prd_id = 5

insert into product (prd_name, prd_description, prd_cat_id, prd_usr_id, prd_condition, prd_start_price, prd_location, prd_latitude, prd_longitude, prd_status, prd_ends_at, prd_created_at)
values ('Mesa de Jantar', 'Mesa de madeira para 6 pessoas.', 3, 5, 'good', 120.00, 'Setúbal', 38.5244000, -8.8882000, 'active', str_to_date('2025.12.26','%Y.%m.%d'), str_to_date('2025.12.14','%Y.%m.%d'));     # prd_id = 6

insert into product (prd_name, prd_description, prd_cat_id, prd_usr_id, prd_condition, prd_start_price, prd_location, prd_latitude, prd_longitude, prd_status, prd_ends_at, prd_created_at)
values ('Livro Java', 'Livro técnico de programação em Java.', 8, 1, 'very good', 25.00, 'Aveiro', 40.6405000, -8.6538000, 'active', str_to_date('2025.12.27','%Y.%m.%d'), str_to_date('2025.12.15','%Y.%m.%d'));      # prd_id = 7

insert into product (prd_name, prd_description, prd_cat_id, prd_usr_id, prd_condition, prd_start_price, prd_location, prd_latitude, prd_longitude, prd_status, prd_ends_at, prd_created_at)
values ('Jantes 18 Polegadas', 'Conjunto de 4 jantes em bom estado.', 7, 3, 'good', 300.00, 'Sintra', 38.8029000, -9.3817000, 'active', str_to_date('2025.12.28','%Y.%m.%d'), str_to_date('2025.12.16','%Y.%m.%d')); # prd_id = 8

#product_images

insert into product_image (img_prd_id, img_path, img_is_primary)
values (1, 'iphone13_1.jpg', true);

insert into product_image (img_prd_id, img_path)
values (1, 'iphone13_2.jpg');

insert into product_image (img_prd_id, img_path, img_is_primary)
values (2, 'ps5_1.jpg', true);

insert into product_image (img_prd_id, img_path)
values (2, 'ps5_2.jpg');

insert into product_image (img_prd_id, img_path, img_is_primary)
values (3, 'casaco_pele_1.jpg', true);

insert into product_image (img_prd_id, img_path, img_is_primary)
values (4, 'bicicleta_btt_1.jpg', true);

insert into product_image (img_prd_id, img_path)
values (4, 'bicicleta_btt_2.jpg');

insert into product_image (img_prd_id, img_path, img_is_primary)
values (5, 'relogio_vintage_1.jpg', true);

insert into product_image (img_prd_id, img_path, img_is_primary)
values (6, 'mesa_jantar_1.jpg', true);

insert into product_image (img_prd_id, img_path, img_is_primary)
values (7, 'livro_java_1.jpg', true);

insert into product_image (img_prd_id, img_path, img_is_primary)
values (8, 'jantes_18_1.jpg', true);

insert into product_image (img_prd_id, img_path)
values (8, 'jantes_18_2.jpg');

#bids

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (1, 2, 460.00, str_to_date('2025.12.10 10:00','%Y.%m.%d %H:%i'));  # bid_id = 1

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (1, 6, 480.00, str_to_date('2025.12.10 12:30','%Y.%m.%d %H:%i'));  # bid_id = 2

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (1, 8, 500.00, str_to_date('2025.12.11 09:15','%Y.%m.%d %H:%i'));  # bid_id = 3

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (2, 4, 390.00, str_to_date('2025.12.11 11:00','%Y.%m.%d %H:%i'));  # bid_id = 4

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (2, 7, 420.00, str_to_date('2025.12.11 14:20','%Y.%m.%d %H:%i'));  # bid_id = 5

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (3, 2, 65.00, str_to_date('2025.12.12 10:10','%Y.%m.%d %H:%i'));   # bid_id = 6

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (3, 9, 75.00, str_to_date('2025.12.12 13:45','%Y.%m.%d %H:%i'));   # bid_id = 7

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (4, 11, 160.00, str_to_date('2025.12.12 16:00','%Y.%m.%d %H:%i')); # bid_id = 8

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (4, 6, 180.00, str_to_date('2025.12.13 09:30','%Y.%m.%d %H:%i'));  # bid_id = 9

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (5, 8, 100.00, str_to_date('2025.12.13 11:00','%Y.%m.%d %H:%i'));  # bid_id = 10

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (5, 2, 120.00, str_to_date('2025.12.13 15:20','%Y.%m.%d %H:%i'));  # bid_id = 11

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (6, 7, 130.00, str_to_date('2025.12.14 10:00','%Y.%m.%d %H:%i'));  # bid_id = 12

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (7, 10, 30.00, str_to_date('2025.12.15 12:00','%Y.%m.%d %H:%i'));  # bid_id = 13

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (7, 11, 35.00, str_to_date('2025.12.15 14:10','%Y.%m.%d %H:%i'));  # bid_id = 14

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (8, 4, 320.00, str_to_date('2025.12.16 10:00','%Y.%m.%d %H:%i'));  # bid_id = 15

insert into bid (bid_prd_id, bid_usr_id, bid_amount, bid_created_at)
values (8, 8, 350.00, str_to_date('2025.12.16 13:30','%Y.%m.%d %H:%i'));  # bid_id = 16

#gamification

insert into gamification (gme_name, gme_description, gme_xp_reward, gme_prd_id, gme_latitude, gme_longitude, gme_radius, gme_verification_code, gme_status, gme_starts_at, gme_reveal_at, gme_ends_at, gme_created_at)
values ('Tesouro Lisboa Centro', 'Encontra o iPhone escondido entre Lisboa e a margem sul.', 50, 1, 38.6890, -9.1770, 30, 'LX01', 'active',
str_to_date('2025.12.05 10:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.05 09:30','%Y.%m.%d %H:%i'),
str_to_date('2025.12.05 18:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.05','%Y.%m.%d'));

insert into gamification (gme_name, gme_description, gme_xp_reward, gme_prd_id, gme_latitude, gme_longitude, gme_radius, gme_verification_code, gme_status, gme_starts_at, gme_reveal_at, gme_ends_at, gme_created_at)
values ('Tesouro Ponte Sul', 'Procura a PS5 escondida entre Lisboa e Almada.', 40, 2, 38.6890, -9.1770, 25, 'LX02', 'active',
str_to_date('2025.12.06 10:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.06 09:30','%Y.%m.%d %H:%i'),
str_to_date('2025.12.06 18:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.06','%Y.%m.%d'));

insert into gamification (gme_name, gme_description, gme_xp_reward, gme_prd_id, gme_latitude, gme_longitude, gme_radius, gme_verification_code, gme_status, gme_starts_at, gme_reveal_at, gme_ends_at, gme_created_at)
values ('Tesouro Ponte Tejo', 'Casaco escondido na zona do Tejo.', 60, 3, 38.6890, -9.1770, 35, 'LX03', 'active',
str_to_date('2025.12.07 10:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.07 09:30','%Y.%m.%d %H:%i'),
str_to_date('2025.12.07 18:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.07','%Y.%m.%d'));

insert into gamification (gme_name, gme_description, gme_xp_reward, gme_prd_id, gme_latitude, gme_longitude, gme_radius, gme_verification_code, gme_status, gme_starts_at, gme_reveal_at, gme_ends_at, gme_created_at)
values ('Tesouro Ponte Lisboa', 'Bicicleta escondida junto ao Tejo.', 45, 4, 38.6890, -9.1770, 30, 'LX04', 'active',
str_to_date('2025.12.08 10:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.08 09:30','%Y.%m.%d %H:%i'),
str_to_date('2025.12.08 18:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.08','%Y.%m.%d'));

insert into gamification (gme_name, gme_description, gme_xp_reward, gme_prd_id, gme_latitude, gme_longitude, gme_radius, gme_verification_code, gme_status, gme_starts_at, gme_reveal_at, gme_ends_at, gme_created_at)
values ('Tesouro Margem Sul', 'Relógio escondido perto do rio.', 55, 5, 38.6890, -9.1770, 30, 'LX05', 'active',
str_to_date('2025.12.09 10:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.09 09:30','%Y.%m.%d %H:%i'),
str_to_date('2025.12.09 18:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.09','%Y.%m.%d'));

insert into gamification (gme_name, gme_description, gme_xp_reward, gme_prd_id, gme_latitude, gme_longitude, gme_radius, gme_verification_code, gme_status, gme_starts_at, gme_reveal_at, gme_ends_at, gme_created_at)
values ('Tesouro Rio Tejo', 'Mesa escondida na zona ribeirinha.', 35, 6, 38.6890, -9.1770, 20, 'LX06', 'active',
str_to_date('2025.12.10 10:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.10 09:30','%Y.%m.%d %H:%i'),
str_to_date('2025.12.10 18:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.10','%Y.%m.%d'));

insert into gamification (gme_name, gme_description, gme_xp_reward, gme_prd_id, gme_latitude, gme_longitude, gme_radius, gme_verification_code, gme_status, gme_starts_at, gme_reveal_at, gme_ends_at, gme_created_at)
values ('Tesouro Tejo Norte', 'Livro Java escondido junto ao rio.', 50, 7, 38.6890, -9.1770, 25, 'LX07', 'active',
str_to_date('2025.12.11 10:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.11 09:30','%Y.%m.%d %H:%i'),
str_to_date('2025.12.11 18:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.11','%Y.%m.%d'));

insert into gamification (gme_name, gme_description, gme_xp_reward, gme_prd_id, gme_latitude, gme_longitude, gme_radius, gme_verification_code, gme_status, gme_starts_at, gme_reveal_at, gme_ends_at, gme_created_at)
values ('Tesouro Ponte Final', 'Jantes escondidas perto da ponte.', 70, 8, 38.6890, -9.1770, 40, 'LX08', 'active',
str_to_date('2025.12.12 10:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.12 09:30','%Y.%m.%d %H:%i'),
str_to_date('2025.12.12 18:00','%Y.%m.%d %H:%i'),
str_to_date('2025.12.12','%Y.%m.%d'));

#gamification_claim

insert into gamification_claim (gcl_gme_id, gcl_usr_id, gcl_claimed_at, gcl_status)
values (1, 2, str_to_date('2025.12.05 10:30','%Y.%m.%d %H:%i'), 'valid');

insert into gamification_claim (gcl_gme_id, gcl_usr_id, gcl_claimed_at, gcl_status)
values (1, 6, str_to_date('2025.12.05 11:00','%Y.%m.%d %H:%i'), 'invalid');

insert into gamification_claim (gcl_gme_id, gcl_usr_id, gcl_claimed_at, gcl_status)
values (2, 4, str_to_date('2025.12.06 10:45','%Y.%m.%d %H:%i'), 'valid');

insert into gamification_claim (gcl_gme_id, gcl_usr_id, gcl_claimed_at, gcl_status)
values (2, 7, str_to_date('2025.12.06 11:15','%Y.%m.%d %H:%i'), 'invalid');

insert into gamification_claim (gcl_gme_id, gcl_usr_id, gcl_claimed_at, gcl_status)
values (3, 8, str_to_date('2025.12.07 12:00','%Y.%m.%d %H:%i'), 'valid');

insert into gamification_claim (gcl_gme_id, gcl_usr_id, gcl_claimed_at, gcl_status)
values (3, 9, str_to_date('2025.12.07 12:30','%Y.%m.%d %H:%i'), 'invalid');

#xp_logs

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (2, 50, 'Participação em evento gamification');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (4, 40, 'Participação em evento gamification');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (8, 60, 'Participação em evento gamification');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (1, 20, 'Criação de produto');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (3, 20, 'Criação de produto');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (5, 20, 'Criação de produto');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (2, 10, 'Licitação em produto');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (6, 10, 'Licitação em produto');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (7, 10, 'Licitação em produto');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (9, 15, 'Atividade na plataforma');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (10, 10, 'Participação geral');

insert into xp_logs (xpl_usr_id, xpl_amount, xpl_reason)
values (11, 10, 'Participação geral');

#notifications

insert into notifications (not_usr_id, not_type, not_message)
values (1, 'bid', 'Recebeste uma nova licitação no teu produto iPhone 13.');

insert into notifications (not_usr_id, not_type, not_message)
values (3, 'bid', 'O teu produto PlayStation 5 recebeu uma nova licitação.');

insert into notifications (not_usr_id, not_type, not_message)
values (2, 'gamification', 'Novo evento disponível: Tesouro Lisboa Centro.');

insert into notifications (not_usr_id, not_type, not_message)
values (4, 'gamification', 'Novo evento disponível: Tesouro Ponte Sul.');

insert into notifications (not_usr_id, not_type, not_message)
values (5, 'gamification', 'Novo evento disponível: Tesouro Ponte Tejo.');

insert into notifications (not_usr_id, not_type, not_message)
values (6, 'system', 'A tua conta foi atualizada com sucesso.');

insert into notifications (not_usr_id, not_type, not_message)
values (7, 'system', 'Explora os novos produtos disponíveis.');

insert into notifications (not_usr_id, not_type, not_message)
values (8, 'bid', 'Foste ultrapassado numa licitação.');

insert into notifications (not_usr_id, not_type, not_message)
values (9, 'system', 'Nova funcionalidade disponível na plataforma.');

insert into notifications (not_usr_id, not_type, not_message)
values (10, 'gamification', 'Participa nos novos desafios disponíveis.');

insert into notifications (not_usr_id, not_type, not_message)
values (11, 'system', 'Obrigado por usares a plataforma!');
