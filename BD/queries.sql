-- selecionar utilizadores do género masculino com email hotmail
select usr_name, usr_email, usr_gender
from userss
where usr_gender = 'M'
and usr_email like '%hotmail%'

-- selecionar todos os produtos com o nome da categoria e do vendedor, ordenados dos mais recentes para os mais antigos
select prd_name, cat_name, usr_name, prd_created_at
from product
join categorie on prd_cat_id = cat_id
join userss on prd_usr_id = usr_id
order by prd_created_at desc

-- selecionar todos os produtos ativos, ordenados pelo fim do leilão
select prd_name, prd_start_price, prd_location, prd_ends_at
from product
where prd_status = 'active'
order by prd_ends_at asc

-- selecionar os produtos com a respetiva imagem principal
select prd_name, img_path
from product
join product_image on prd_id = img_prd_id
where img_is_primary = true
order by prd_name asc

-- selecionar os produtos que ainda não têm licitações
select prd_name, prd_start_price, prd_status
from product
where prd_id not in (select bid_prd_id from bid)

-- selecionar o número total de licitações por produto, ordenado do maior para o menor
select prd_name, count(bid_id) total_licitacoes
from product
left join bid on prd_id = bid_prd_id
group by prd_id, prd_name
order by total_licitacoes desc

-- selecionar o lance mais alto de cada produto, ordenado do maior para o menor
select prd_name, max(bid_amount) maior_lance
from product
join bid on prd_id = bid_prd_id
group by prd_id, prd_name
order by maior_lance desc

-- selecionar os utilizadores que mais licitaram, ordenados do que fez mais lances para o que fez menos
select usr_name, count(bid_id) total_lances
from userss
join bid on usr_id = bid_usr_id
group by usr_id, usr_name
order by total_lances desc

-- selecionar os utilizadores que criaram mais produtos, ordenados do que criou mais para o que criou menos
select usr_name, count(prd_id) total_produtos
from userss
join product on usr_id = prd_usr_id
group by usr_id, usr_name
order by total_produtos desc

-- selecionar os utilizadores ordenados por xp, do maior para o menor
select usr_name, usr_email, usr_xp
from userss
order by usr_xp desc

-- selecionar todos os eventos de gamificação com o respetivo prémio
select gme_name, prd_name, gme_xp_reward, gme_status
from gamification
join product on gme_prd_id = prd_id
order by gme_starts_at asc

-- selecionar o número total de tentativas por evento, ordenado do maior para o menor
select gme_name, count(gcl_id) total_tentativas
from gamification
left join gamification_claim on gme_id = gcl_gme_id
group by gme_id, gme_name
order by total_tentativas desc

-- selecionar as notificações não lidas de um utilizador, ordenadas da mais recente para a mais antiga
select not_type, not_message, not_created_at
from notifications
where not_usr_id = 8
and not_read = false
order by not_created_at desc

-- selecionar categorias com mais produtos, ordenadas da que tem mais para a que tem menos
select cat_name, count(prd_id) total_produtos
from categorie
left join product on cat_id = prd_cat_id
group by cat_id, cat_name
order by total_produtos desc

-- selecionar os produtos que terminam primeiro, ordenados da data mais próxima para a mais distante
select prd_name, prd_ends_at, prd_status
from product
where prd_status = 'active'
order by prd_ends_at asc
