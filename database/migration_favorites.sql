create table product_favorite (
    fav_id          int not null auto_increment,
    fav_usr_id      int not null,
    fav_prd_id      int not null,
    fav_created_at  datetime not null default current_timestamp,
    primary key (fav_id),
    unique key uq_favorite_user_product (fav_usr_id, fav_prd_id),
    index idx_favorite_usr_id (fav_usr_id),
    index idx_favorite_prd_id (fav_prd_id)
);

alter table product_favorite
add constraint favorite_fk_user
foreign key (fav_usr_id) references userss(usr_id)
on delete cascade;

alter table product_favorite
add constraint favorite_fk_product
foreign key (fav_prd_id) references product(prd_id)
on delete cascade;
