# 1. Base de Dados (BD Report)

Este capítulo apresenta a estrutura final da base de dados do projeto **NextBid**, incluindo o modelo relacional, o dicionário de dados e o guia de dados com exemplos de registos. A base de dados foi desenhada para suportar os principais módulos da aplicação: autenticação, gestão de utilizadores, leilões, licitações, carteira/saldo, gamificação, notificações, avaliações, mensagens (chat) e progressão por XP.

---

# 1.1 UML

O modelo de dados do sistema **NextBid** organiza-se em torno da entidade **userss**, que representa todos os utilizadores registados na plataforma. A partir desta entidade central, estabelecem-se relações com os módulos de autenticação, leilões, licitações, transações, notificações, avaliações, interação direta (chat) e gamificação.

A autenticação é suportada pela tabela **auth_tokens**, que permite gerir sessões ativas através de tokens associados aos utilizadores. A categorização dos produtos é feita pela tabela **category**, enquanto a tabela **product** representa os produtos colocados a leilão, incluindo o vendedor, o vencedor, a condição do item, o preço inicial, o estado do leilão e a localização geográfica. 

A flexibilidade da descrição dos produtos é assegurada pela tabela **product_attribute**, que permite guardar características dinâmicas definidas pelo próprio utilizador, e pela tabela **product_image**, que suporta múltiplas imagens por produto, com indicação da imagem principal. Os utilizadores podem também guardar leilões do seu interesse através da tabela **product_favorite**.

A dinâmica de licitação é suportada pela tabela **bid**, que regista todos os lances efetuados pelos utilizadores. O módulo financeiro é tratado pela tabela **transactions**, responsável por registar depósitos e débitos associados à carteira interna da plataforma. A interação durante o leilão é complementada pela tabela **chat_message**, que regista as mensagens trocadas no contexto de cada produto.

A componente de gamificação é composta pelas tabelas **gamification** e **gamification_claim**, que permitem criar eventos geolocalizados, definir regras de reclamação, guardar tentativas dos utilizadores e identificar vencedores. O sistema de progressão é suportado por **xp_logs**, que regista o histórico de XP atribuído, e por **xp_level**, que define os níveis e o XP necessário para os atingir.

Por fim, a tabela **notifications** gere os alertas enviados aos utilizadores, e a tabela **review** suporta o sistema de avaliação por estrelas, permitindo ao comprador vencedor avaliar o vendedor no final do leilão.

De forma geral, o modelo garante integridade referencial, normalização e suporte direto aos requisitos funcionais da aplicação, articulando autenticação, leilões, saldo, gamificação e reputação num sistema coerente e escalável.

<img width="5000" height="3500" alt="uml_nextbid" src="https://github.com/user-attachments/assets/e66fcd87-c55b-4b73-9f2e-6125f81fcc44" />

### Relações e Multiplicidades do Modelo de Domínio

O Modelo de Domínio acima ilustra as entidades conceptuais do sistema **NextBid** e as regras de negócio que as unem. As multiplicidades definem a obrigatoriedade e o limite das associações entre as classes:

**1. Utilizadores, Autenticação e Sistema**
* **User (1) — (0..*) AuthToken:** Um utilizador pode ter zero ou várias sessões ativas (tokens). Um token pertence sempre a exatamente um utilizador.
* **User (1) — (0..*) XpLog:** Um utilizador pode ter zero ou vários registos de ganhos de experiência.
* **User (1) — (0..*) Notification:** Um utilizador pode receber zero ou várias notificações.

**2. Catálogo e Leilões**
* **Category (1) — (0..*) Product:** Uma categoria pode conter zero ou vários produtos. Um produto pertence obrigatoriamente a uma única categoria.
* **User (1) — (0..*) Product (Vendedor):** Um utilizador pode criar/vender zero ou vários produtos. Um produto é sempre publicado por um único utilizador.
* **User (0..1) — (0..*) Product (Vencedor):** Um utilizador pode vencer zero ou vários leilões. Um produto pode ter um vencedor (1) ou, se ainda estiver ativo/expirado sem lances, não ter nenhum (0).

**3. Detalhes do Produto (Relação de Composição ♦)**
* **Product (1) ♦— (0..*) ProductAttribute:** Um produto é composto por zero ou vários atributos dinâmicos. A existência do atributo depende totalmente da existência do produto.
* **Product (1) ♦— (0..*) ProductImage:** Um produto é composto por zero ou várias imagens. As imagens são destruídas se o produto for eliminado.

**4. Licitações e Movimentos Financeiros**
* **Product (1) — (0..*) Bid:** Um produto pode receber zero ou várias licitações.
* **User (1) — (0..*) Bid:** Um utilizador pode fazer zero ou várias licitações em diversos leilões.
* **User (1) — (0..*) Transaction:** Um utilizador pode ter zero ou vários movimentos na sua carteira (depósitos/débitos).

**5. Gamificação (Caça ao Tesouro)**
* **Product (1) — (0..*) Gamification:** Um produto físico pode estar associado a zero ou vários eventos de tesouro ao longo do tempo.
* **Gamification (1) — (0..*) GamificationClaim:** Um evento de gamificação pode ter zero ou várias tentativas de reclamação por diferentes utilizadores.
* **User (1) — (0..*) GamificationClaim:** Um utilizador pode fazer zero ou várias tentativas em diferentes tesouros.
* **User (0..1) — (0..*) Gamification (Vencedor):** Um evento pode ter um vencedor, e um utilizador pode vencer vários eventos.

**6. Interação e Social**
* **User (1) — (0..*) ChatMessage:** Um utilizador envia zero ou várias mensagens.
* **Product (1) — (0..*) ChatMessage:** Um leilão pode conter zero ou várias mensagens no seu chat.
* **Product (1) — (0..*) Review:** Um produto pode ser alvo de avaliação no final do leilão.
* **User (1) — (0..*) Review:** Um utilizador pode escrever várias avaliações (como comprador) e receber várias avaliações (como vendedor).
* **User (1) — (0..*) ProductFavorite:** Um utilizador pode guardar zero ou vários leilões nos favoritos.
* **Product (1) — (0..*) ProductFavorite:** Um leilão pode ser favoritado por zero ou vários utilizadores.

---

# 1.2 Dicionário de Dados

## Tabela: `auth_tokens`
Armazena os tokens de autenticação utilizados para manter sessões ativas na API.

**Funções principais:**
- Guardar o token de cada sessão autenticada
- Associar o token a um utilizador
- Controlar a validade temporal da sessão

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| tok_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único do token |
| tok_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador associado ao token |
| tok_token | alfanumérico | 64 | Único / Obrigatório | Token de autenticação |
| tok_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data de criação do token |
| tok_expires_at | datetime | — | Obrigatório | Data de expiração do token |

---

## Tabela: `userss`
Armazena todos os utilizadores registados na plataforma NextBid.

**Funções principais:**
- Criar e gerir leilões
- Participar em licitações e chat
- Participar em eventos de gamificação
- Receber notificações
- Acumular XP
- Gerir saldo da carteira interna

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
| usr_balance | decimal | 10,2 | Default 0.00 | Saldo disponível na carteira |
| usr_location | alfanumérico | 120 | Opcional | Localização textual do utilizador |
| usr_xp | numérico inteiro | — | Default 0 | XP acumulado |
| usr_role | enum | — | Obrigatório | Papel na plataforma (admin / normaluser) |
| usr_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data de criação do registo |

---

## Tabela: `category`
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
- Associar produto a vendedor, categoria e vencedor

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| prd_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único do produto |
| prd_name | alfanumérico | 120 | Obrigatório | Nome do produto |
| prd_description | texto | — | Obrigatório | Descrição detalhada do produto |
| prd_cat_id | numérico inteiro | — | FK → category.cat_id | Categoria do produto |
| prd_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador que criou o leilão |
| prd_winner_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador vencedor do leilão |
| prd_condition | enum | — | Obrigatório | Estado do produto (new / like new / good / used) |
| prd_start_price | decimal | 10,2 | Obrigatório | Preço base do leilão |
| prd_location | alfanumérico | 120 | Opcional | Localização textual do produto |
| prd_latitude | decimal | 10,7 | Opcional | Latitude GPS do produto |
| prd_longitude | decimal | 10,7 | Opcional | Longitude GPS do produto |
| prd_status | enum | — | Default 'active' | Estado do leilão (active / ended / sold / expired) |
| prd_ends_at | datetime | — | Obrigatório | Data e hora de fim do leilão |
| prd_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data de criação do leilão |

---

## Tabela: `product_attribute`
Armazena atributos dinâmicos associados aos produtos.

**Funções principais:**
- Permitir que cada produto tenha características personalizadas
- Adaptar o sistema a diferentes tipos de itens

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| atr_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único do atributo |
| atr_prd_id | numérico inteiro | — | FK → product.prd_id | Produto a que o atributo pertence |
| atr_name | alfanumérico | 80 | Obrigatório | Nome do atributo |
| atr_value | alfanumérico | 255 | Obrigatório | Valor do atributo |

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

## Tabela: `transactions`
Regista todas as transações financeiras dos utilizadores.

**Funções principais:**
- Simular carregamentos de saldo
- Registar débitos associados a compras/leilões ganhos
- Manter histórico financeiro da carteira

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| tra_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único da transação |
| tra_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador associado à transação |
| tra_type | enum | — | Obrigatório | Tipo de movimento (deposit / debit) |
| tra_amount | decimal | 10,2 | Obrigatório | Valor do movimento |
| tra_description | alfanumérico | 255 | Opcional | Descrição da transação |
| tra_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data e hora da transação |

---

## Tabela: `bid`
Regista todas as licitações efetuadas nos leilões.

**Funções principais:**
- Registar cada lance de um utilizador
- Guardar o histórico de licitações
- Apoiar a determinação do maior lance e do vencedor

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
| gme_reveal_at | datetime | — | Opcional | Momento em que a localização exata é revelada |
| gme_ends_at | datetime | — | Obrigatório | Data e hora de fim |
| gme_winner_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador vencedor do evento |
| gme_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data de criação do evento |

---

## Tabela: `gamification_claim`
Regista as tentativas de reclamação de tesouros pelos utilizadores.

**Funções principais:**
- Registar quem tentou reclamar cada tesouro
- Validar tentativas válidas e inválidas
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

## Tabela: `xp_level`
Define os níveis do sistema de progressão.

**Funções principais:**
- Estabelecer a progressão por níveis
- Definir o XP necessário para atingir cada nível

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| lvl_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único do nível |
| lvl_number | numérico inteiro | — | Único / Obrigatório | Número do nível |
| lvl_xp_required | numérico inteiro | — | Obrigatório | XP necessário para atingir o nível |

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
| not_type | alfanumérico | 50 | Opcional | Tipo de notificação |
| not_message | texto | — | Obrigatório | Conteúdo da notificação |
| not_read | boolean | — | Default FALSE | Indica se a notificação foi lida |
| not_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data e hora de criação |

---

## Tabela: `review`
Permite avaliar vendedores após a conclusão de um leilão.

**Funções principais:**
- Registar avaliações de 1 a 5 estrelas
- Garantir apenas uma avaliação por utilizador e produto
- Suportar reputação dos vendedores

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| rev_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único da avaliação |
| rev_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador que avalia |
| rev_reviewed_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador avaliado |
| rev_prd_id | numérico inteiro | — | FK → product.prd_id | Produto associado à avaliação |
| rev_rating | tinyint | — | Check 1..5 | Classificação atribuída |
| rev_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data e hora da avaliação |

---

## Tabela: `chat_message`
Regista as mensagens trocadas no chat de cada leilão.

**Funções principais:**
- Permitir comunicação entre utilizadores num produto
- Registar mensagens de sistema automáticas

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| cht_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único da mensagem |
| cht_prd_id | numérico inteiro | — | FK → product.prd_id | Produto associado ao chat |
| cht_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador que enviou a mensagem |
| cht_content | texto | — | Obrigatório | Conteúdo da mensagem |
| cht_is_system | tinyint | 1 | Default 0 | Indica se é uma mensagem gerada pelo sistema |
| cht_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data e hora de envio |

---

## Tabela: `product_favorite`
Guarda os produtos adicionados aos favoritos pelos utilizadores.

**Funções principais:**
- Permitir aos utilizadores seguir leilões do seu interesse
- Aceder rapidamente a produtos guardados

| Atributo | Tipo de dado | Tamanho | Restrição | Descrição |
|---|---|---|---|---|
| fav_id | numérico inteiro | — | Chave primária / Auto Increment | Identificador único do favorito |
| fav_usr_id | numérico inteiro | — | FK → userss.usr_id | Utilizador que guardou o favorito |
| fav_prd_id | numérico inteiro | — | FK → product.prd_id | Produto guardado |
| fav_created_at | datetime | — | Default CURRENT_TIMESTAMP | Data em que o produto foi favoritado |

---

# 1.3 Guia de Dados

## Introdução
O Guia de Dados descreve a estrutura lógica da base de dados, explicando o propósito de cada tabela, as relações existentes e ilustrando exemplos de registos de teste incluídos nos scripts SQL.

---

## Resumo do conjunto de dados de teste

A base de dados de referência contém os seguintes conjuntos principais de dados:

- **11 utilizadores**
- **8 categorias**
- **8 produtos/leilões**
- **10 atributos dinâmicos de produto**
- **9 imagens de produto**
- **12 transações**
- **12 licitações**
- **4 eventos de gamificação**
- **5 reclamações de gamificação**
- **10 níveis de XP**
- **5 registos de XP**
- **9 notificações**
- **1 avaliação**
- **8 mensagens de chat**
- **6 produtos favoritos**

---

## Tabela: `userss`

A tabela **userss** armazena os utilizadores registados na plataforma. Para além dos dados de identificação, inclui também a localização, o saldo disponível na carteira, o XP acumulado e o papel do utilizador no sistema.

### Exemplo de registos

| usr_id | usr_name | usr_email | usr_location | usr_balance | usr_xp | usr_role |
|---:|---|---|---|---:|---:|---|
| 1 | Rodrigo Canto | rodrigocanto@hotmail.com | Lisboa | 150.00 | 120 | admin |
| 3 | Marco Fonseca | mf2006@gmail.com | Cascais | 200.00 | 180 | admin |
| 7 | Jocy Grangeiro | jocy12@gmail.com | Setúbal | 110.00 | 110 | normaluser |

---

## Tabela: `category`

A tabela **category** contém as categorias dos produtos disponibilizados para leilão.

### Categorias existentes

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

## Tabela: `product`

A tabela **product** representa os leilões criados na plataforma. Cada registo identifica o vendedor, a categoria, o estado do produto, o preço base, a localização e o estado atual do leilão. Quando o leilão termina com sucesso, pode também guardar o utilizador vencedor.

### Exemplo de registos

| prd_id | prd_name | prd_cat_id | prd_usr_id | prd_winner_usr_id | prd_condition | prd_start_price | prd_status |
|---:|---|---:|---:|---:|---|---:|---|
| 1 | iPhone 13 | 1 | 1 | — | like new | 400.00 | active |
| 5 | Cartas Pokémon | 5 | 3 | 7 | like new | 150.00 | sold |
| 7 | Peugeot 206 | 7 | 4 | — | used | 1200.00 | active |

### Exemplo prático

Um registo com `prd_id = 5`, `prd_usr_id = 3` e `prd_winner_usr_id = 7` significa que o produto **Cartas Pokémon** foi colocado a leilão por **Marco Fonseca** e foi ganho por **Jocy Grangeiro**.

---

## Tabela: `product_attribute`

A tabela **product_attribute** permite guardar características dinâmicas, definidas pelo utilizador no momento da criação do leilão. Esta solução torna o sistema flexível, uma vez que diferentes tipos de produtos necessitam de atributos diferentes.

### Exemplo de registos

| atr_id | atr_prd_id | atr_name | atr_value |
|---:|---:|---|---|
| 1 | 1 | Storage | 128GB |
| 2 | 1 | Color | Black |
| 9 | 7 | Kilometers | 120000 |
| 10 | 7 | Fuel | Diesel |

---

## Tabela: `product_image`

A tabela **product_image** armazena as imagens associadas aos produtos. Um produto pode ter várias imagens, sendo uma delas marcada como principal.

### Exemplo de registos

| img_id | img_prd_id | img_path | img_is_primary |
|---:|---:|---|:---:|
| 1 | 1 | iphone13_1.jpg | true |
| 2 | 1 | iphone13_2.jpg | false |
| 7 | 6 | ps5.jpg | true |

---

## Tabela: `transactions`

A tabela **transactions** representa os movimentos financeiros da carteira do utilizador. Os dados de teste incluem carregamentos iniciais de saldo e um débito associado a um leilão ganho.

### Exemplo de registos

| tra_id | tra_usr_id | tra_type | tra_amount | tra_description |
|---:|---:|---|---:|---|
| 1 | 1 | deposit | 150.00 | Initial balance |
| 7 | 7 | deposit | 110.00 | Initial balance |
| 12 | 7 | debit | 180.00 | Auction win - Pokemon Cards |

---

## Tabela: `bid`

A tabela **bid** regista todas as licitações realizadas nos leilões. Cada registo representa um lance feito por um utilizador num determinado produto, guardando o valor e a data.

### Exemplo de registos

| bid_id | bid_prd_id | bid_usr_id | bid_amount |
|---:|---:|---:|---:|
| 1 | 1 | 2 | 420.00 |
| 2 | 1 | 5 | 450.00 |
| 3 | 1 | 7 | 480.00 |
| 8 | 5 | 7 | 180.00 |

### Exemplo prático

No produto **iPhone 13**, os utilizadores 2, 5 e 7 efetuaram licitações sucessivas, sendo o maior lance de **480.00**.

---

## Tabela: `gamification`

A tabela **gamification** define os eventos de caça ao tesouro, associando um produto a uma localização geográfica, a um raio de validação e a uma recompensa em XP.

### Exemplo de registos

| gme_id | gme_name | gme_prd_id | gme_status | gme_xp_reward | gme_winner_usr_id |
|---:|---|---:|---|---:|---:|
| 1 | Treasure Hunt - Pokemon Cards | 5 | claimed | 80 | 7 |
| 2 | Treasure Hunt - iPhone 13 | 1 | active | 120 | — |
| 3 | Treasure Hunt - Football | 4 | scheduled | 50 | — |
| 4 | Treasure Hunt - Harry Potter Book | 8 | expired | 40 | — |

---

## Tabela: `gamification_claim`

A tabela **gamification_claim** guarda as tentativas dos utilizadores para reclamar tesouros. Cada utilizador só pode ter uma reclamação por evento.

### Exemplo de registos

| gcl_id | gcl_gme_id | gcl_usr_id | gcl_status |
|---:|---:|---:|---|
| 1 | 1 | 2 | valid |
| 2 | 1 | 5 | valid |
| 3 | 1 | 7 | winner |
| 5 | 2 | 8 | invalid |

---

## Tabela: `xp_level`

A tabela **xp_level** define a progressão do sistema de níveis. O conjunto de dados de teste inclui os primeiros 10 níveis, com progressão linear de 50 XP entre níveis.

### Exemplo de registos

| lvl_id | lvl_number | lvl_xp_required |
|---:|---:|---:|
| 1 | 1 | 0 |
| 2 | 2 | 50 |
| 3 | 3 | 100 |
| 10 | 10 | 450 |

---

## Tabela: `xp_logs`

A tabela **xp_logs** regista o histórico de ganhos de XP. Os dados de teste incluem XP obtido por licitações, vitória em leilão e vitória em gamificação.

### Exemplo de registos

| xpl_id | xpl_usr_id | xpl_amount | xpl_reason |
|---:|---:|---:|---|
| 1 | 2 | 10 | Placed a bid on iPhone 13 |
| 2 | 7 | 50 | Won auction |
| 3 | 7 | 80 | Won treasure hunt |

---

## Tabela: `notifications`

A tabela **notifications** armazena as notificações enviadas aos utilizadores. Nos dados de teste, predominam notificações relacionadas com bids, outbid e vitória em leilões.

### Exemplo de registos

| not_id | not_usr_id | not_type | not_message | not_read |
|---:|---:|---|---|:---:|
| 1 | 2 | bid | Your bid on iPhone 13 was placed. | false |
| 2 | 2 | outbid | You have been outbid on iPhone 13. | false |
| 6 | 7 | win | You won the auction for Pokemon Cards. | false |

---

## Tabela: `review`

A tabela **review** suporta o sistema de avaliação por estrelas. No conjunto de dados atual, existe uma avaliação registada do comprador vencedor para o vendedor do produto.

### Exemplo de registo

| rev_id | rev_usr_id | rev_reviewed_usr_id | rev_prd_id | rev_rating |
|---:|---:|---:|---:|---:|
| 1 | 7 | 3 | 5 | 5 |

Isto significa que o utilizador **7** avaliou o utilizador **3** com **5 estrelas** após a conclusão do leilão do produto **5**.

---

## Tabela: `chat_message`

A tabela **chat_message** regista as interações via chat nos leilões. Pode incluir mensagens diretas dos utilizadores ou mensagens automáticas geradas pelo sistema (ex: "Nova licitação máxima").

### Exemplo de registos

| cht_id | cht_prd_id | cht_usr_id | cht_is_system | cht_content |
|---:|---:|---:|:---:|---|
| 1 | 1 | 2 | 0 | Este produto tem garantia? |
| 2 | 1 | 1 | 0 | Sim, tem garantia da marca até 2027. |
| 3 | 1 | 7 | 1 | Nova licitação de 480.00€ |

---

## Tabela: `product_favorite`

A tabela **product_favorite** permite aos utilizadores guardar leilões para fácil acesso posterior.

### Exemplo de registos

| fav_id | fav_usr_id | fav_prd_id |
|---:|---:|---:|
| 1 | 2 | 1 |
| 2 | 2 | 7 |
| 3 | 7 | 5 |

Isto significa que o utilizador **2** adicionou aos favoritos os produtos **1** (iPhone 13) e **7** (Peugeot 206).

---

# 1.4 Scripts SQL

> Scripts completos incluídos na entrega da tarefa:
- `tabels.sql`
- `inserts.sql`
- `queries.sql`

---

# 1.5 Conclusão

A base de dados desenvolvida para o projeto **NextBid** apresenta uma estrutura relacional coerente com os requisitos do sistema e com a implementação do backend. O modelo final suporta autenticação por tokens, gestão de utilizadores, leilões, licitações em tempo real, carteira interna, gamificação geolocalizada, sistema de notificações, avaliações, chat integrado e progressão por XP.

Em síntese, a modelação apresentada constitui uma base robusta, modular e escalável, proporcionando as condições necessárias para o correto funcionamento da aplicação e para a sua futura evolução.
