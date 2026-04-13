# 1. Base de Dados (BD Report)

Este capítulo apresenta o modelo de dados utilizado no projeto **NextBid**, incluindo o diagrama ER, a definição das entidades e relações, o dicionário de dados e os exemplos que compõem a base de dados de referência para testes. A base de dados reflete os requisitos funcionais da aplicação, permitindo gerir utilizadores, produtos em leilão, licitações, gamificação (caça ao tesouro), notificações e sistema de XP.

---

# 1.1 Modelo (MER)

O Modelo Entidade-Relação do sistema NextBid organiza os dados essenciais para a gestão de uma plataforma de leilões online com gamificação. O modelo estrutura-se em torno das entidades **Userss**, **Product** e **Categorie**, que permitem a criação e gestão de produtos colocados a leilão por utilizadores registados.

A gestão das licitações é suportada pela entidade **Bid**, que regista cada lance efetuado em tempo real. A geolocalização dos produtos é complementada com o sistema de **Gamification** e **Gamification_Claim**, que implementam a mecânica de caça ao tesouro — permitindo que utilizadores se desloquem fisicamente a um local para reclamar prémios.

O sistema de recompensas é gerido pelas entidades **XP_Logs**, que registam todos os ganhos de experiência dos utilizadores, e **Notifications**, que envia alertas automáticos sobre licitações, eventos e atividade geral.

De forma geral, o MER garante coerência, normalização e suporte direto aos requisitos funcionais da aplicação, articulando utilizadores, leilões, licitações, gamificação e notificações num modelo de dados consistente e escalável.

<img width="632" height="452" alt="UML drawio" src="https://github.com/user-attachments/assets/889cb3e0-a9dd-46b4-98ca-916d0b122728" />

---

# 1.2 Dicionário de Dados

## Tabela: `userss`
Armazena todos os utilizadores registados na plataforma NextBid.

**Funções principais:**
- Criar e gerir leilões
- Participar em licitações
- Participar em eventos de gamificação
- Receber notificações
- Acumular XP

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| usr_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único do utilizador |
| usr_name | alfanumérico | 80 | Obrigatório | Nome do utilizador |
| usr_email | alfanumérico | 120 | Único / Obrigatório | Email do utilizador |
| usr_password | alfanumérico | 200 | Obrigatório | Palavra-passe encriptada |
| usr_gender | char | 1 | Obrigatório | Género do utilizador (M/F) |
| usr_birthdate | date | — | Obrigatório | Data de nascimento |
| usr_photo | alfanumérico | 255 | Opcional | Caminho para a foto de perfil |
| usr_bio | texto | — | Opcional | Biografia do utilizador |
| usr_xp | numérico inteiro | — | Default 0 | Pontos de experiência acumulados |
| usr_role | enum | — | Obrigatório | Papel na plataforma (admin / normaluser) |
| usr_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data de criação do registo |

---

## Tabela: `categorie`
Define as categorias dos produtos colocados a leilão.

**Funções principais:**
- Classificar produtos por tipo
- Facilitar a pesquisa e filtragem de leilões

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| cat_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único da categoria |
| cat_name | alfanumérico | 80 | Único / Obrigatório | Nome da categoria |

---

## Tabela: `product`
Armazena todos os produtos colocados a leilão na plataforma.

**Funções principais:**
- Criar e gerir leilões
- Definir preço base, duração e localização
- Associar produto a utilizador e categoria

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| prd_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único do produto |
| prd_name | alfanumérico | 120 | Obrigatório | Nome do produto |
| prd_description | texto | — | Obrigatório | Descrição detalhada do produto |
| prd_cat_id | numérico inteiro | — | FK → categorie.cat_id | Categoria do produto |
| prd_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador que criou o leilão |
| prd_condition | enum | — | Obrigatório | Estado do produto (very good / good / satisfactory / very used) |
| prd_start_price | decimal | 10,2 | Obrigatório | Preço base do leilão |
| prd_location | alfanumérico | 120 | Opcional | Localização textual do produto |
| prd_latitude | decimal | 10,7 | Opcional | Latitude GPS do produto |
| prd_longitude | decimal | 10,7 | Opcional | Longitude GPS do produto |
| prd_status | enum | — | Default 'active' | Estado do leilão (active / ended / sold / expired) |
| prd_ends_at | datetime | — | Obrigatório | Data e hora de fim do leilão |
| prd_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data de criação do leilão |

---

## Tabela: `product_image`
Armazena as imagens associadas a cada produto.

**Funções principais:**
- Guardar imagens dos produtos
- Identificar a imagem principal

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| img_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único da imagem |
| img_prd_id | numérico inteiro | — | FK → product.prd_id | Produto ao qual a imagem pertence |
| img_path | alfanumérico | 255 | Obrigatório | Caminho do ficheiro de imagem |
| img_is_primary | boolean | — | Default FALSE | Indica se é a imagem principal do produto |

---

## Tabela: `bid`
Regista todas as licitações efetuadas nos leilões.

**Funções principais:**
- Registar cada lance de um utilizador
- Validar que o novo lance é superior ao anterior
- Guardar o histórico de licitações

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| bid_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único da licitação |
| bid_prd_id | numérico inteiro | — | FK → product.prd_id | Produto licitado |
| bid_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador que efetuou a licitação |
| bid_amount | decimal | 10,2 | Obrigatório | Valor do lance |
| bid_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data e hora da licitação |

---

## Tabela: `gamification`
Define os eventos de caça ao tesouro disponíveis na plataforma.

**Funções principais:**
- Criar pontos de recompensa geolocalizados
- Associar um produto físico a cada evento
- Gerir o ciclo de vida do evento (scheduled → active → claimed / expired)

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| gme_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único do evento |
| gme_name | alfanumérico | 120 | Obrigatório | Nome do evento |
| gme_description | texto | — | Opcional | Descrição do evento |
| gme_xp_reward | numérico inteiro | — | Default 0 | XP atribuído ao vencedor |
| gme_prd_id | numérico inteiro | — | FK → product.prd_id | Produto associado ao evento |
| gme_latitude | decimal | 10,7 | Obrigatório | Latitude do local do tesouro |
| gme_longitude | decimal | 10,7 | Obrigatório | Longitude do local do tesouro |
| gme_radius | numérico inteiro | — | Default 30 | Raio de proximidade em metros para reclamar |
| gme_verification_code | alfanumérico | 10 | Opcional | Código de verificação presencial |
| gme_status | enum | — | Default 'scheduled' | Estado do evento (scheduled / active / claimed / expired) |
| gme_starts_at | datetime | — | Obrigatório | Data e hora de início |
| gme_reveal_at | datetime | — | Opcional | Data e hora de revelação da localização exata |
| gme_ends_at | datetime | — | Obrigatório | Data e hora de fim |
| gme_winner_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador vencedor (após reclamação) |
| gme_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data de criação do evento |

---

## Tabela: `gamification_claim`
Regista as tentativas de reclamação de tesouros pelos utilizadores.

**Funções principais:**
- Registar quem tentou reclamar cada tesouro
- Validar a proximidade geográfica do utilizador
- Identificar o vencedor do evento

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| gcl_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único da reclamação |
| gcl_gme_id | numérico inteiro | — | FK → gamification.gme_id | Evento de gamificação associado |
| gcl_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador que tentou reclamar |
| gcl_claimed_at | datetime | — | Default CURRENT_TIMESTAMP | Data e hora da tentativa |
| gcl_status | enum | — | Default 'valid' | Resultado da tentativa (valid / invalid / winner) |

---

## Tabela: `xp_logs`
Regista todos os ganhos de XP dos utilizadores na plataforma.

**Funções principais:**
- Registar o histórico de XP ganho
- Identificar a razão de cada atribuição de XP

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| xpl_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único do registo |
| xpl_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador que ganhou XP |
| xpl_amount | numérico inteiro | — | Obrigatório | Quantidade de XP atribuída |
| xpl_reason | alfanumérico | 255 | Obrigatório | Motivo da atribuição de XP |
| xpl_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data e hora do registo |

---

## Tabela: `notifications`
Armazena as notificações enviadas aos utilizadores da plataforma.

**Funções principais:**
- Alertar utilizadores sobre licitações, eventos e atividade
- Registar se a notificação foi lida

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| not_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único da notificação |
| not_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador destinatário |
| not_type | alfanumérico | 50 | Opcional | Tipo de notificação (bid / gamification / system) |
| not_message | texto | — | Obrigatório | Conteúdo da notificação |
| not_read | boolean | — | Default FALSE | Indica se a notificação foi lida |
| not_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data e hora de criação |

---

# 1.3 Guia de Dados

## Introdução
O Guia de Dados descreve a estrutura lógica da Base de Dados, explicando o propósito de cada tabela, as relações existentes e ilustrando exemplos reais de registos.

---

## Tabela: userss

A tabela **userss** é responsável por armazenar todos os utilizadores registados na plataforma **NextBid**.  
Cada utilizador representa uma pessoa que pode criar leilões, licitar em produtos, participar em eventos de gamificação e acumular XP.

Atualmente, esta tabela contém **11 utilizadores**.

| usr_id | usr_name | usr_email | usr_gender | usr_birthdate | usr_photo | usr_bio | usr_xp | usr_role | usr_created_at |
|---:|---|---|:---:|---|---|---|---:|---|---|
| 1 | Rodrigo Canto | rodrigocanto@hotmail.com | M | 2005-10-20 | rodrigo_canto.jpg | Estudante e fã de tecnologia. | 120 | admin | 2025-10-20 |
| 2 | Rodrigo Daibert | rodrigodaibert@hotmail.com | M | 2005-10-22 | rodrigo_daibert.jpg | Gosto de leilões e gaming. | 95 | admin | 2025-10-22 |
| 3 | Marco Fonseca | mf2006@gmail.com | M | 2006-10-24 | marco_fonseca.jpg | Colecionador e vendedor ocasional. | 180 | admin | 2025-10-24 |
| 4 | Luis Quirim | luisquirim@gmail.com | M | 2004-10-28 | luis_quirim.jpg | Interesso-me por artigos para casa e carros. | 60 | normaluser | 2025-10-28 |
| 5 | Sandra Estrela | sandra@hotmail.com | F | 2003-10-30 | sandra_estrela.jpg | Adoro moda e decoração. | 140 | normaluser | 2025-10-30 |
| 6 | Daniel Paulo | dexpaulo@hotmail.com | M | 2005-11-01 | daniel_paulo.jpg | Utilizador ativo na plataforma. | 75 | admin | 2025-11-01 |
| 7 | Jocy Grangeiro | jocy12@gmail.com | F | 2004-11-04 | jocy_grangeiro.jpg | Gosto de oportunidades e prémios. | 110 | normaluser | 2025-11-04 |
| 8 | Paulo Alberto | pauloencomendas@gmail.com | M | 2001-11-09 | paulo_alberto.jpg | Interessa-me eletrónica e desporto. | 90 | normaluser | 2025-11-09 |
| 9 | Patricia Daibert | patriciadaibert@hotmail.com | F | 2002-11-13 | patricia_daibert.jpg | Procuro artigos de moda e casa. | 130 | normaluser | 2025-11-13 |
| 10 | Martim Fonseca | mrmartim@hotmail.com | M | 2006-12-01 | martim_fonseca.jpg | Curioso por videojogos e gadgets. | 55 | normaluser | 2025-12-01 |
| 11 | Tomas Lebre | tomaslebre@gmail.com | M | 2005-12-02 | tomas_lebre.jpg | Participante frequente em leilões. | 70 | normaluser | 2025-12-02 |

---

## Tabela: categorie

A tabela **categorie** define as categorias disponíveis para classificar os produtos leiloados na plataforma **NextBid**.  
Cada produto deve estar associado a uma categoria, permitindo aos utilizadores filtrar e encontrar leilões do seu interesse.

Atualmente, existem **8 categorias** registadas.

| cat_id | cat_name |
|---:|---|
| 1 | Eletrónica |
| 2 | Moda |
| 3 | Casa |
| 4 | Desporto |
| 5 | Colecionáveis |
| 6 | Videojogos |
| 7 | Automóveis |
| 8 | Livros |

---

## Tabela: product

A tabela **product** armazena todos os produtos colocados a leilão na plataforma **NextBid**.  
Cada produto representa um leilão criado por um utilizador, com um preço base, descrição, data de fim e coordenadas geográficas.

Atualmente, existem **8 produtos** registados.

### Como funcionam os IDs

- **prd_cat_id** → identifica a categoria do produto (corresponde ao `cat_id` da tabela `categorie`)
- **prd_usr_id** → identifica o utilizador que criou o leilão (corresponde ao `usr_id` da tabela `userss`)

### Conteúdo da tabela product

| prd_id | prd_name | prd_description | prd_cat_id | prd_usr_id | prd_condition | prd_start_price | prd_location | prd_latitude | prd_longitude | prd_status | prd_ends_at | prd_created_at |
|---:|---|---|:---:|:---:|---|---:|---|---|---|---|---|---|
| 1 | iPhone 13 | iPhone 13 em excelente estado, 128GB. | 1 | 1 | very good | 450,00 € | Lisboa | 38.7223000 | -9.1393000 | active | 2025-12-20 | 2025-12-10 |
| 2 | PlayStation 5 | Consola PS5 com comando incluído. | 6 | 3 | good | 380,00 € | Almada | 38.6800000 | -9.1580000 | active | 2025-12-21 | 2025-12-11 |
| 3 | Casaco de Pele | Casaco em muito bom estado, tamanho M. | 2 | 5 | good | 60,00 € | Porto | 41.1579000 | -8.6291000 | active | 2025-12-22 | 2025-12-12 |
| 4 | Bicicleta BTT | Bicicleta de montanha com pouco uso. | 4 | 1 | good | 150,00 € | Braga | 41.5454000 | -8.4265000 | active | 2025-12-24 | 2025-12-12 |
| 5 | Relógio Vintage | Relógio colecionável dos anos 80. | 5 | 3 | satisfactory | 90,00 € | Coimbra | 40.2033000 | -8.4103000 | active | 2025-12-23 | 2025-12-13 |
| 6 | Mesa de Jantar | Mesa de madeira para 6 pessoas. | 3 | 5 | good | 120,00 € | Setúbal | 38.5244000 | -8.8882000 | active | 2025-12-26 | 2025-12-14 |
| 7 | Livro Java | Livro técnico de programação em Java. | 8 | 1 | very good | 25,00 € | Aveiro | 40.6405000 | -8.6538000 | active | 2025-12-27 | 2025-12-15 |
| 8 | Jantes 18 Polegadas | Conjunto de 4 jantes em bom estado. | 7 | 3 | good | 300,00 € | Sintra | 38.8029000 | -9.3817000 | active | 2025-12-28 | 2025-12-16 |

### Exemplo prático

Um registo como:
- `prd_id = 1`, `prd_name = iPhone 13`, `prd_usr_id = 1`, `prd_start_price = 450.00`, `prd_ends_at = 2025-12-20`

significa:

> "O utilizador **Rodrigo Canto** colocou um **iPhone 13** a leilão com preço base de **450,00 €**, com término a **20 de dezembro de 2025**, localizado em **Lisboa** (38.7223, -9.1393)."

---

## Tabela: product_image

A tabela **product_image** armazena as imagens associadas a cada produto leiloado na plataforma.  
Um produto pode ter várias imagens, sendo uma delas marcada como imagem principal (`img_is_primary = true`).

| img_id | img_prd_id | img_path | img_is_primary |
|---:|:---:|---|:---:|
| 1 | 1 (iPhone 13) | iphone13_1.jpg | true |
| 2 | 1 (iPhone 13) | iphone13_2.jpg | false |
| 3 | 2 (PlayStation 5) | ps5_1.jpg | true |
| 4 | 2 (PlayStation 5) | ps5_2.jpg | false |
| 5 | 3 (Casaco de Pele) | casaco_pele_1.jpg | true |
| 6 | 4 (Bicicleta BTT) | bicicleta_btt_1.jpg | true |
| 7 | 4 (Bicicleta BTT) | bicicleta_btt_2.jpg | false |
| 8 | 5 (Relógio Vintage) | relogio_vintage_1.jpg | true |
| 9 | 6 (Mesa de Jantar) | mesa_jantar_1.jpg | true |
| 10 | 7 (Livro Java) | livro_java_1.jpg | true |
| 11 | 8 (Jantes 18 Polegadas) | jantes_18_1.jpg | true |
| 12 | 8 (Jantes 18 Polegadas) | jantes_18_2.jpg | false |

### Relação entre produtos e imagens

- Um produto pode ter **várias imagens**
- Apenas uma imagem pode ser a **principal** (`img_is_primary = true`)
- Se o produto for eliminado, as imagens são automaticamente removidas (CASCADE)

---

## Tabela: bid

A tabela **bid** regista todas as licitações efetuadas nos leilões da plataforma **NextBid**.  
Cada registo representa um lance de um utilizador num produto, com o valor e o momento exato em que foi feito.

### Como funcionam os IDs

- **bid_prd_id** → identifica o produto licitado (corresponde ao `prd_id` da tabela `product`)
- **bid_usr_id** → identifica o utilizador que licitou (corresponde ao `usr_id` da tabela `userss`)

### Conteúdo da tabela bid

| bid_id | bid_prd_id | bid_usr_id | bid_amount | bid_created_at |
|---:|:---:|:---:|---:|---|
| 1 | 1 (iPhone 13) | 2 (Rodrigo Daibert) | 460,00 € | 2025-12-10 10:00 |
| 2 | 1 (iPhone 13) | 6 (Daniel Paulo) | 480,00 € | 2025-12-10 12:30 |
| 3 | 1 (iPhone 13) | 8 (Paulo Alberto) | 500,00 € | 2025-12-11 09:15 |
| 4 | 2 (PlayStation 5) | 4 (Luis Quirim) | 390,00 € | 2025-12-11 11:00 |
| 5 | 2 (PlayStation 5) | 7 (Jocy Grangeiro) | 420,00 € | 2025-12-11 14:20 |
| 6 | 3 (Casaco de Pele) | 2 (Rodrigo Daibert) | 65,00 € | 2025-12-12 10:10 |
| 7 | 3 (Casaco de Pele) | 9 (Patricia Daibert) | 75,00 € | 2025-12-12 13:45 |
| 8 | 4 (Bicicleta BTT) | 11 (Tomas Lebre) | 160,00 € | 2025-12-12 16:00 |
| 9 | 4 (Bicicleta BTT) | 6 (Daniel Paulo) | 180,00 € | 2025-12-13 09:30 |
| 10 | 5 (Relógio Vintage) | 8 (Paulo Alberto) | 100,00 € | 2025-12-13 11:00 |
| 11 | 5 (Relógio Vintage) | 2 (Rodrigo Daibert) | 120,00 € | 2025-12-13 15:20 |
| 12 | 6 (Mesa de Jantar) | 7 (Jocy Grangeiro) | 130,00 € | 2025-12-14 10:00 |
| 13 | 7 (Livro Java) | 10 (Martim Fonseca) | 30,00 € | 2025-12-15 12:00 |
| 14 | 7 (Livro Java) | 11 (Tomas Lebre) | 35,00 € | 2025-12-15 14:10 |
| 15 | 8 (Jantes 18 Polegadas) | 4 (Luis Quirim) | 320,00 € | 2025-12-16 10:00 |
| 16 | 8 (Jantes 18 Polegadas) | 8 (Paulo Alberto) | 350,00 € | 2025-12-16 13:30 |

### Exemplo prático

Um registo como:
- `bid_id = 3`, `bid_prd_id = 1`, `bid_usr_id = 8`, `bid_amount = 500.00`

significa:

> "O utilizador **Paulo Alberto** licitou **500,00 €** no produto **iPhone 13**, tornando-se o licitador com o lance mais alto."

### Lances por produto (resumo)

- **iPhone 13** → 3 lances — lance mais alto: 500,00 € (Paulo Alberto)
- **PlayStation 5** → 2 lances — lance mais alto: 420,00 € (Jocy Grangeiro)
- **Casaco de Pele** → 2 lances — lance mais alto: 75,00 € (Patricia Daibert)
- **Bicicleta BTT** → 2 lances — lance mais alto: 180,00 € (Daniel Paulo)
- **Relógio Vintage** → 2 lances — lance mais alto: 120,00 € (Rodrigo Daibert)
- **Mesa de Jantar** → 1 lance — lance mais alto: 130,00 € (Jocy Grangeiro)
- **Livro Java** → 2 lances — lance mais alto: 35,00 € (Tomas Lebre)
- **Jantes 18"** → 2 lances — lance mais alto: 350,00 € (Paulo Alberto)

---

## Tabela: gamification

A tabela **gamification** define os eventos de caça ao tesouro disponíveis na plataforma **NextBid**.  
Cada evento associa um produto físico a uma localização geográfica, onde o utilizador tem de se deslocar presencialmente para o reclamar.

### Como funcionam os IDs

- **gme_prd_id** → identifica o produto associado ao evento (corresponde ao `prd_id` da tabela `product`)
- **gme_winner_usr_id** → identifica o utilizador vencedor, após a reclamação bem-sucedida

### Conteúdo da tabela gamification

| gme_id | gme_name | gme_description | gme_xp_reward | gme_prd_id | gme_latitude | gme_longitude | gme_radius | gme_verification_code | gme_status | gme_starts_at | gme_reveal_at | gme_ends_at | gme_created_at |
|---:|---|---|:---:|:---:|---|---|:---:|---|---|---|---|---|---|
| 1 | Tesouro Lisboa Centro | Encontra o iPhone escondido entre Lisboa e a margem sul. | 50 XP | 1 (iPhone 13) | 38.6890 | -9.1770 | 30 m | LX01 | active | 2025-12-05 10:00 | 2025-12-05 09:30 | 2025-12-05 18:00 | 2025-12-05 |
| 2 | Tesouro Ponte Sul | Procura a PS5 escondida entre Lisboa e Almada. | 40 XP | 2 (PlayStation 5) | 38.6890 | -9.1770 | 25 m | LX02 | active | 2025-12-06 10:00 | 2025-12-06 09:30 | 2025-12-06 18:00 | 2025-12-06 |
| 3 | Tesouro Ponte Tejo | Casaco escondido na zona do Tejo. | 60 XP | 3 (Casaco de Pele) | 38.6890 | -9.1770 | 35 m | LX03 | active | 2025-12-07 10:00 | 2025-12-07 09:30 | 2025-12-07 18:00 | 2025-12-07 |
| 4 | Tesouro Ponte Lisboa | Bicicleta escondida junto ao Tejo. | 45 XP | 4 (Bicicleta BTT) | 38.6890 | -9.1770 | 30 m | LX04 | active | 2025-12-08 10:00 | 2025-12-08 09:30 | 2025-12-08 18:00 | 2025-12-08 |
| 5 | Tesouro Margem Sul | Relógio escondido perto do rio. | 55 XP | 5 (Relógio Vintage) | 38.6890 | -9.1770 | 30 m | LX05 | active | 2025-12-09 10:00 | 2025-12-09 09:30 | 2025-12-09 18:00 | 2025-12-09 |
| 6 | Tesouro Rio Tejo | Mesa escondida na zona ribeirinha. | 35 XP | 6 (Mesa de Jantar) | 38.6890 | -9.1770 | 20 m | LX06 | active | 2025-12-10 10:00 | 2025-12-10 09:30 | 2025-12-10 18:00 | 2025-12-10 |
| 7 | Tesouro Tejo Norte | Livro Java escondido junto ao rio. | 50 XP | 7 (Livro Java) | 38.6890 | -9.1770 | 25 m | LX07 | active | 2025-12-11 10:00 | 2025-12-11 09:30 | 2025-12-11 18:00 | 2025-12-11 |
| 8 | Tesouro Ponte Final | Jantes escondidas perto da ponte. | 70 XP | 8 (Jantes 18 Polegadas) | 38.6890 | -9.1770 | 40 m | LX08 | active | 2025-12-12 10:00 | 2025-12-12 09:30 | 2025-12-12 18:00 | 2025-12-12 |

### Exemplo prático

Um registo como:
- `gme_id = 1`, `gme_name = Tesouro Lisboa Centro`, `gme_prd_id = 1`, `gme_xp_reward = 50`, `gme_radius = 30`, `gme_verification_code = LX01`

significa:

> "Existe um evento de caça ao tesouro chamado **Tesouro Lisboa Centro**, onde está escondido um **iPhone 13**. O primeiro utilizador a chegar ao local e a estar dentro de um raio de **30 metros** ganha o produto e **50 XP**. Para confirmar a presença, o utilizador deve introduzir o código **LX01**."

---

## Tabela: gamification_claim

A tabela **gamification_claim** regista todas as tentativas de reclamação de tesouros efetuadas pelos utilizadores.  
Cada registo indica se o utilizador estava no local correto (`valid`) ou fora do raio permitido (`invalid`), e identifica o vencedor (`winner`).

### Como funcionam os IDs

- **gcl_gme_id** → identifica o evento de gamificação (corresponde ao `gme_id` da tabela `gamification`)
- **gcl_usr_id** → identifica o utilizador que tentou reclamar (corresponde ao `usr_id` da tabela `userss`)

### Conteúdo da tabela gamification_claim

| gcl_id | gcl_gme_id | gcl_usr_id | gcl_claimed_at | gcl_status |
|---:|:---:|:---:|---|---|
| 1 | 1 (Tesouro Lisboa Centro) | 2 (Rodrigo Daibert) | 2025-12-05 10:30 | valid |
| 2 | 1 (Tesouro Lisboa Centro) | 6 (Daniel Paulo) | 2025-12-05 11:00 | invalid |
| 3 | 2 (Tesouro Ponte Sul) | 4 (Luis Quirim) | 2025-12-06 10:45 | valid |
| 4 | 2 (Tesouro Ponte Sul) | 7 (Jocy Grangeiro) | 2025-12-06 11:15 | invalid |
| 5 | 3 (Tesouro Ponte Tejo) | 8 (Paulo Alberto) | 2025-12-07 12:00 | valid |
| 6 | 3 (Tesouro Ponte Tejo) | 9 (Patricia Daibert) | 2025-12-07 12:30 | invalid |

### Exemplo prático

Um registo como:
- `gcl_gme_id = 1`, `gcl_usr_id = 2`, `gcl_status = valid`

significa:

> "O utilizador **Rodrigo Daibert** tentou reclamar o **Tesouro Lisboa Centro** e estava dentro do raio permitido — tentativa **válida**."

---

## Tabela: xp_logs

A tabela **xp_logs** regista o histórico completo de XP ganho por cada utilizador na plataforma **NextBid**.  
Cada registo indica quem ganhou XP, quanto ganhou, por que razão e quando.

### Como funcionam os IDs

- **xpl_usr_id** → identifica o utilizador que ganhou XP (corresponde ao `usr_id` da tabela `userss`)

### Conteúdo da tabela xp_logs

| xpl_id | xpl_usr_id | xpl_amount | xpl_reason | xpl_created_at |
|---:|:---:|:---:|---|---|
| 1 | 2 (Rodrigo Daibert) | 50 XP | Participação em evento gamification | 2025-12-05 |
| 2 | 4 (Luis Quirim) | 40 XP | Participação em evento gamification | 2025-12-05 |
| 3 | 8 (Paulo Alberto) | 60 XP | Participação em evento gamification | 2025-12-05 |
| 4 | 1 (Rodrigo Canto) | 20 XP | Criação de produto | 2025-12-05 |
| 5 | 3 (Marco Fonseca) | 20 XP | Criação de produto | 2025-12-05 |
| 6 | 5 (Sandra Estrela) | 20 XP | Criação de produto | 2025-12-05 |
| 7 | 2 (Rodrigo Daibert) | 10 XP | Licitação em produto | 2025-12-05 |
| 8 | 6 (Daniel Paulo) | 10 XP | Licitação em produto | 2025-12-05 |
| 9 | 7 (Jocy Grangeiro) | 10 XP | Licitação em produto | 2025-12-05 |
| 10 | 9 (Patricia Daibert) | 15 XP | Atividade na plataforma | 2025-12-05 |
| 11 | 10 (Martim Fonseca) | 10 XP | Participação geral | 2025-12-05 |
| 12 | 11 (Tomas Lebre) | 10 XP | Participação geral | 2025-12-05 |

### Formas de ganhar XP na plataforma

- **Criação de produto** → 20 XP por leilão criado
- **Licitação em produto** → entre 5 e 15 XP por lance efetuado
- **Participação em gamificação** → XP definido por evento (entre 35 e 70 XP)

---

## Tabela: notifications

A tabela **notifications** armazena todas as notificações enviadas aos utilizadores da plataforma **NextBid**.  
As notificações são geradas automaticamente pelo sistema em resposta a eventos como novas licitações, eventos de gamificação e atividade geral.

### Tipos de notificação

- **bid** → alertas relacionados com licitações (novo lance, lance ultrapassado)
- **gamification** → alertas sobre eventos de caça ao tesouro
- **system** → mensagens gerais do sistema

### Conteúdo da tabela notifications

| not_id | not_usr_id | not_type | not_message | not_read | not_created_at |
|---:|:---:|---|---|:---:|---|
| 1 | 1 (Rodrigo Canto) | bid | Recebeste uma nova licitação no teu produto iPhone 13. | false | 2025-12-10 |
| 2 | 3 (Marco Fonseca) | bid | O teu produto PlayStation 5 recebeu uma nova licitação. | false | 2025-12-11 |
| 3 | 2 (Rodrigo Daibert) | gamification | Novo evento disponível: Tesouro Lisboa Centro. | false | 2025-12-05 |
| 4 | 4 (Luis Quirim) | gamification | Novo evento disponível: Tesouro Ponte Sul. | false | 2025-12-06 |
| 5 | 5 (Sandra Estrela) | gamification | Novo evento disponível: Tesouro Ponte Tejo. | false | 2025-12-07 |
| 6 | 6 (Daniel Paulo) | system | A tua conta foi atualizada com sucesso. | false | 2025-12-10 |
| 7 | 7 (Jocy Grangeiro) | system | Explora os novos produtos disponíveis. | false | 2025-12-10 |
| 8 | 8 (Paulo Alberto) | bid | Foste ultrapassado numa licitação. | false | 2025-12-11 |
| 9 | 9 (Patricia Daibert) | system | Nova funcionalidade disponível na plataforma. | false | 2025-12-11 |
| 10 | 10 (Martim Fonseca) | gamification | Participa nos novos desafios disponíveis. | false | 2025-12-12 |
| 11 | 11 (Tomas Lebre) | system | Obrigado por usares a plataforma! | false | 2025-12-12 |

### Exemplo prático

Um registo como:
- `not_id = 8`, `not_usr_id = 8`, `not_type = bid`, `not_read = false`

significa:

> "O utilizador **Paulo Alberto** recebeu uma notificação do tipo **bid** a informar que foi ultrapassado numa licitação, e ainda **não a leu**."

---

# 1.4 Scripts SQL

> Scripts completos incluídos na entrega da tarefa:
- `tabels.sql` 
- `inserts.sql`
- `queries.sql`

---

# 1.5 Conclusão

A base de dados desenvolvida para o projeto **NextBid** evidencia uma estrutura conceptual e lógica adequada aos requisitos definidos, assegurando a integridade, a normalização e a coerência dos dados ao longo de todo o sistema. O modelo ER e o respetivo dicionário de dados demonstram uma articulação clara entre as entidades e os seus relacionamentos, garantindo suporte às funcionalidades centrais, como a gestão de leilões em tempo real, o sistema de licitações, a gamificação com geolocalização e o sistema de notificações e XP.

Em síntese, a modelação apresentada constitui uma base robusta e escalável, proporcionando as condições necessárias para o correto funcionamento da aplicação e para a sua futura evolução.
