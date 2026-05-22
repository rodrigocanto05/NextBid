# Relatório Técnico Final: Projeto NextBid (Fase III - Versão Conclusiva)

## 0. Índice Geral
* [1. Identificação e Distribuição de Tarefas](#1-identificação-e-distribuição-de-tarefas)
* [2. Introdução e Objetivos Estratégicos](#2-introdução-e-objetivos-estratégicos)
* [3. Pesquisa de Mercado e Análise Recompilada](#3-pesquisa-de-mercado-e-análise-recompilada)
* [4. Requisitos do Sistema (Funcionais e Não Funcionais)](#4-requisitos-do-sistema-funcionais-e-não-funcionais)
* [5. Arquitetura de Informação, User Journey e UI/UX](#5-arquitetura-de-informação-user-journey-e-uiux)
* [6. Modelação UML e Estrutura Relacional da Base de Dados](#6-modelação-uml-e-estrutura-relacional-da-base-de-dados)
* [7. Especificação da API RESTful e Integração Backend](#7-especificação-da-api-restful-e-integração-backend)
* [8. Algoritmos de Negócio e Integração SIG (Geolocalização)](#8-algoritmos-de-negócio-e-integração-sig-geolocalização)
* [9. Backoffice, Estatística e Análise de Dados](#9-backoffice-estatística-e-análise-de-dados)
* [10. Plano de Trabalhos Realizado (13 Semanas)](#10-plano-de-trabalhos-realizado-13-semanas)
* [11. Validação, Guiões de Teste e Testes de Usabilidade](#11-validação-guiões-de-teste-e-testes-de-usabilidade)
* [12. Ligação com os Conceitos Teóricos Académicos](#12-ligação-com-os-conceitos-teóricos-académicos)
* [13. Estado Atual e Conclusão Geral](#13-estado-atual-e-conclusão-geral)
* [14. Referências Bibliográficas](#14-referências-bibliográficas)

---

## 1. Identificação e Distribuição de Tarefas

### 1.1 Dados Gerais do Projeto
* **Instituição:** Universidade Europeia | IADE
* **Curso:** Licenciatura em Engenharia Informática
* **Unidade Curricular:** Projeto Desenvolvimento Web
* **Nome do Projeto:** NextBid
* **Repositório GitHub:** https://github.com/rodrigocanto05/NextBid
* **Identificação:** Daniel Paulo, Marco Fonseca, Rodrigo Canto, Rodrigo Daibert

### 1.2 Matriz de Responsabilidades (WBS Geral)

| Módulo / Entregável | Rodrigo Canto | Rodrigo Daibert | Marco Fonseca | Daniel Paulo | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Fase I: Pesquisa & Requisitos** | 25% | 25% | 25% | 25% | **100%** |
| **Fase II: Backend Core & Prototipagem** | 30% | 30% | 20% | 20% | **100%** |
| **Fase III: Testes, TRabalhos diversos & Finalização** | 20% | 40% | 20% | 20% | **100%** |

---

## 2. Introdução e Objetivos Estratégicos

### 2.1 Enquadramento do Problema
* **Evolução do E-Commerce:** O comércio digital exige modelos de interação contínuos. Sistemas tradicionais baseados em formulários estáticos resultam em quebras de retenção.
* **Proposta NextBid:** Introdução de um ecossistema de leilões assíncronos enriquecido com dinâmicas de geolocalização e incentivos baseados em gamificação em tempo real.

### 2.2 Objetivos Estratégicos
* **Competição Transparente:** Motor de licitações concorrentes em que o maior lance registado antes do término do cronómetro é o vencedor.
* **Exploração Urbana Ativa:** Mecânica de "Caça ao Tesouro" georreferenciada para distribuição automatizada de prémios físicos através de coordenadas de proximidade.
* **Confiança e Segurança:** Infraestrutura transacional com registo imutável de transações financeiras e proteção robusta contra acessos indevidos.

---

## 3. Pesquisa de Mercado e Análise Recompilada

### 3.1 Análise Comparativa de Concorrentes

| Plataforma | Vetores de Convergência (Semelhanças) | Vetores de Divergência (Diferenças do NextBid) |
| :--- | :--- | :--- |
| **eBay** | • Licitações competitivas baseadas em lances mais altos.<br>• Suporte a categorias abrangentes. | • Interface tradicional sem mecânicas de jogos.<br>• Ausência de dinâmicas locais ou cálculo de proximidade por GPS. |
| **Mercado Livre** | • Interação direta entre vendedor e comprador.<br>• Catálogo estruturado de artigos. | • Logística baseada estritamente em transportadoras.<br>• Falta de incentivos de gamificação ou mapas ativos. |
| **DealDash** | • Modelo de e-commerce assente em leilões dinâmicos. | • Monetização baseada em lances pagos por clique.<br>• Inexistência de camadas georreferenciadas ou entrega por proximidade. |

### 3.2 Segmentação de Público-alvo
* **Nativos Digitais:** Utilizadores jovens motivados por mecânicas de progressão, tabelas de liderança (*leaderboards*) e recompensas baseadas em objetivos.
* **Comerciantes e Caçadores de Oportunidades:** Utilizadores focados na liquidação rápida de artigos ou na aquisição de produtos abaixo do valor médio de mercado.

---

## 4. Requisitos do Sistema (Funcionais e Não Funcionais)

### 4.1 Requisitos Funcionais (RF)
* **RF-01 (Autenticação):** Registo, início de sessão seguro e validação de idade mínima ($\ge$ 18 anos).
* **RF-02 (CRUD de Leilões):** Criação, edição e remoção de leilões com upload mandatório de imagens (limites: 3 a 15 ficheiros).
* **RF-03 (Validação de Bids):** Verificação assíncrona que garante que cada lance submetido é estritamente superior ao valor atual somado ao incremento mínimo.
* **RF-04 (Fecho Automático):** Encerramento autónomo do leilão quando o cronómetro atinge zero, elegendo o vencedor e atualizando os saldos afetados.
* **RF-05 (Caça ao Tesouro):** Atribuição de prémios e pontos de experiência baseada na verificação de proximidade GPS.

### 4.2 Requisitos Não Funcionais (RNF)
* **RNF-01 (Segurança):** Criptografia de credenciais via algoritmo `BCRYPT`, prevenção contra SQL Injection através de `PDO Prepared Statements` e sanitização de inputs contra XSS.
* **RNF-02 (Performance):** Respostas de endpoints da API em formato JSON estruturado com tempos de latência inferiores a 200 milissegundos.
* **RNF-03 (Compatibilidade):** Implementação do frontend em JavaScript Vanilla (ES6+), garantindo execução fluida em browsers modernos sem frameworks pesados de terceiros.

---

## 5. Arquitetura de Informação, User Journey e UI/UX

### 5.1 Mapa de Navegação Estrutural
[Homepage / Catálogo Principal]
├── [Leilões Ativos] ──► [Detalhe do Artigo] ──► (Painel de Lances / Chat)
├── [Mapa do Sistema] ──► [Caça ao Tesouro] ──► (Validação de Proximidade)
├── [Perfil Privado]  ──► [Minhas Vendas] | [Carteira] | [Histórico de XP]
└── [Autenticação]    ──► [Login] | [Registo]
### 5.2 Fluxos Críticos de Utilizador (User Journey)
* **Participação num Leilão:** Consulta do catálogo $\rightarrow$ Acesso à página do artigo $\rightarrow$ Verificação de Saldo $\rightarrow$ Submissão de Bid Assíncrona $\rightarrow$ Atualização do Maior Lance em tempo real $\rightarrow$ Fecho Automático por Timer $\rightarrow$ Atribuição do Artigo.
* **Mecânica da Caça ao Tesouro:** Abertura do Mapa $\rightarrow$ Deslocação Física do Utilizador $\rightarrow$ Envio de Coordenadas GPS em tempo real $\rightarrow$ Validação de Raio pelo Servidor $\rightarrow$ Incremento de XP e Recompensa.

---

## 6. Modelação UML e Estrutura Relacional da Base de Dados

### 6.1 Diagrama de Casos de Uso (UML) 
* **Atores:** Visitante (Acesso a dados públicos de leilões e consulta do mapa), Utilizador Autenticado (Submissão de lances, carregamento de carteira, publicação de artigos e participação na gamificação), Administrador (Controlo de categorias do catálogo e instanciação de eventos de tesouros).

### 6.2 Estrutura do Esquema Relacional (MySQL) 
A base de dados encontra-se normalizada na **3.ª Forma Normal (3FN)** para assegurar integridade referencial estável.

* **Tabela `userss`:** Armazena dados de utilizadores, nível de privilégio (`role`), e saldo líquido corrente.
* **Tabela `product`:** Contém metadados do artigo, preço base, preço atual, coordenadas geográficas (`latitude`, `longitude`) e carimbo de data/hora de expiração.
* **Tabela `bid`:** Registo histórico indexado de lances, associando utilizadores a produtos.
* **Ledger Financeiro Imutável (`transactions`):** Histórico imutável de transações onde depósitos e retenções para licitações são registados como entradas individuais. O saldo corrente é calculado por agregação (`SUM`), prevenindo manipulações diretas de colunas.
* **Atributos Dinâmicos (`product_attribute`):** Arquitetura baseada no modelo *Key-Value*, permitindo que propriedades de artigos heterogéneos sejam adicionadas sem alteração estrutural no esquema SQL.
* **Link para ficheiro da base de Dados:** https://github.com/rodrigocanto05/NextBid/tree/main/database


---

## 7. Especificação da API RESTful e Integração Backend

### 7.1 Padrão de Comunicação e Endpoints (OpenAPI 3.0) 
A API funciona de forma *stateless*, recorrendo a cabeçalhos HTTP com tokens de autorização Bearer (64 caracteres gerados na autenticação).

* `POST /auth/login.php` -> Autenticação de credenciais e devolução de token.
* `POST /bids/place_bid.php` -> Envio de payload JSON contendo `{ "product_id": int, "amount": float }` para submissão de lance.
* `POST /auctions/create.php` -> Endpoint preparado para `multipart/form-data` que valida e armazena os metadados do leilão e ficheiros de imagem associados (limite $\le$ 5MB por imagem).

### 7.2 Tratamento e Resposta Estruturada
Todas as comunicações devolvem códigos de estado HTTP adequados e payloads padronizados:
* **Sucesso:** `{ "success": true, "data": { ... } }`
* **Erro:** `{ "success": false, "error": "Mensagem descritiva do erro técnico" }`

* **Link para documentação SWAGGER:** https://github.com/rodrigocanto05/NextBid/blob/main/docs/Fase-II/openapi-NextBid.yaml
---

## 8. Algoritmos de Negócio e Integração SIG (Geolocalização)

### 8.1 Validação de Proximidade (Fórmula de Haversine) 
Para evitar fraudes no consumo de prémios da "Caça ao Tesouro" e listar artigos por proximidade local, o servidor executa a validação da distância linear na superfície da esfera terrestre. O cálculo processa a latitude e longitude submetidas pelo cliente contra as coordenadas guardadas na base de dados:

$$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_u)\cos(lat_p)\sin^2\left(\frac{\Delta lon}{2}\right)}\right)$$

Onde $R = 6371$ km (raio médio da Terra). Se $d$ for inferior ou igual ao raio estipulado para o evento, o servidor valida o pedido e regista o ganho na tabela `gamification_claim`.

### 8.2 Renderização Espacial no Cliente 
O mapeamento utiliza a biblioteca **Leaflet.js** alimentada por chamadas assíncronas assentes na Fetch API. O mapa consome coleções de dados georreferenciados gerados pelo servidor, aplicando marcadores customizados para distinguir leilões físicos de pontos de tesouro ativos.

---

## 9. Backoffice, Estatística e Dashboard Dinâmico

### 9.1 Dashboard Administrativo Dinâmico 
Conforme os requisitos estatísticos da UC de Estatística, o painel de backoffice foi desenvolvido para compilar dados operacionais agregados diretamente da base de dados relacional:
* **Métricas Descritivas:** Cálculo automático do preço médio de fecho por categoria de produto e cálculo da taxa de atividade transacional por hora.
* **Leaderboards Dinâmicos:** Classificação em tempo real dos utilizadores com maior acumulação de pontos de experiência (`xp_logs`), fomentando a retenção através da visualização pública do ranking.

---

## 10. Plano de Trabalhos Realizado e Cronograma (13 Semanas)

* **Semanas 1-3 (Fase Conceptual):** Definição do âmbito do NextBid, levantamento de requisitos técnicos, modelação lógica do domínio em UML e desenho estrutural da base de dados relacional.
* **Semanas 4-7 (Desenvolvimento do Backend Core):** Implementação do servidor em PHP, criação do sistema transacional de lances, encriptação de utilizadores e criação do sistema de sessões por token.
* **Semanas 8-10 (Integração SIG e Gamificação):** Acoplamento da biblioteca Leaflet.js, codificação da fórmula de Haversine no servidor para proteção de localização e validação lógica da Caça ao Tesouro.
* **Semanas 11-13 (Otimização, Testes e Fecho):** Desenvolvimento do dashboard de estatísticas do backoffice, realização de testes estruturados com utilizadores, correção de problemas de concorrência e redação da documentação final.

---

## 11. Validação, Guiões de Teste e Testes de Usabilidade

### 11.1 Resultados dos Testes Funcionais Automatizados

| ID | Cenário de Teste | Procedimento de Execução | Resultado Esperado e Obtido | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **01** | Submissão de Leilão Válido | Envio de formulário com metadados e 3 imagens associadas. | Persistência bem-sucedida na BD e ficheiros guardados em `/uploads`. | **Aprovado** |
| **02** | Licitação Superior Ativa | Utilizador submete lance superior ao valor atual do leilão. | Transação autorizada, maior lance atualizado e interface notificada. | **Aprovado** |
| **03** | Licitação Inválida por Valor | Utilizador tenta submeter lance com valor inferior ou igual ao atual. | Rejeição imediata no backend com retorno de código de erro JSON. | **Aprovado** |
| **04** | Validação Espacial GPS | Submissão de coordenadas fora do raio limite do tesouro ativo. | Bloqueio do pedido pelo cálculo de Haversine; prémio não atribuído. | **Aprovado** |

### 11.2 Resultados dos Testes de Usabilidade com Utilizadores Finais [cite: 25, 85]
* **Taxa de Conclusão de Tarefas (Task Success Rate):** 92% dos utilizadores participantes concluíram com sucesso o fluxo completo sem apoio externo (Registo $\rightarrow$ Carregamento de Carteira $\rightarrow$ Colocação de Licitação).
* **Resolução de Fricção Técnica:** Detetaram-se falhas de timeout em ligações móveis ao efetuar o upload de múltiplas imagens pesadas de alta resolução. A solução implementada passou pela introdução de uma rotina de compressão e redimensionamento client-side via JavaScript antes do envio para a API, reduzindo a taxa de erro neste módulo para 0%.

---

## 12. Ligação com os Conceitos Teóricos Académicos (PBL) [cite: 15]

* **Programação Web:** Estruturação de serviços baseados em arquitetura RESTful, consumo assíncrono de dados através de chamadas HTTP (Fetch API) e manuseamento de objetos JSON estruturados[cite: 42].
* **Interfaces e Usabilidade:** Validação de taxonomia e menus através da técnica de *Tree Testing*, desenho de componentes com base num *Design System* atómico e redução de carga cognitiva na interface de licitação[cite: 42].
* **Sistemas de Informação Geográfica (SIG):** Tratamento, conversão e manipulação de dados espaciais (coordenadas decimais de latitude e longitude) e mapeamento vetorial dinâmico em ambiente web[cite: 44].
* **Algoritmos e Estruturas de Dados:** Implementação de mecanismos de pesquisa, ordenação de históricos de lances e otimização das regras de integridade concorrente no servidor[cite: 44].

---

## 13. Estado Final do Protótipo e Conclusão Geral

O projeto **NextBid** conclui a sua fase final com todos os objetivos estratégicos e técnicos estabelecidos no briefing plenamente atingidos[cite: 89]. A criação de uma infraestrutura estável dividida de forma clara entre frontend e backend provou ser eficaz para assegurar a rapidez e robustez necessárias a um sistema transacional de leilões. 

A introdução bem-sucedida do módulo de geolocalização e das componentes de recompensa por progressão diferencia o NextBid das plataformas tradicionais de comércio eletrónico, resultando num produto final otimizado, seguro e em total conformidade com os requisitos académicos formulados.

---

## 14. Referências Bibliográficas

* DealDash. (2026). *The Online Auction Site with the Lowest Prices*. Obtido de https://www.dealdash.com
* eBay. (2026). *Buy & Sell Electronics, Cars, Fashion, Collectibles & More*. Obtido de https://www.ebay.com
* Mercado Livre. (2026). *Compra y Venta de Productos Online*. Obtido de https://www.mercadolibre.com
* Nielsen Norman Group. (2026). *Tree Testing: Fast, Iterative Evaluation of Menu Labels and Categories*. Obtido de https://www.nngroup.com/articles/tree-testing/
