# Faculdade de Design, Tecnologia e Comunicação — IADE
## Licenciatura em Engenharia Informática | Ano Letivo: 2025/2026
## Unidade Curricular: Projeto de Desenvolvimento Web
## Docente: Maria Inês Pires

<br>

# NextBid
## Plataforma de Leilões Online Gamificada e Georreferenciada
### Relatório Técnico - 3ª Entrega (Versão Conclusiva)

<br>

**Elementos do Grupo:**
* Daniel Paulo — Engenharia Informática
* Marco Fonseca — Engenharia Informática
* Rodrigo Canto — Engenharia Informática
* Rodrigo Daibert — Engenharia Informática

**Lisboa, 24 de Maio de 2026**

---

## ÍNDICE

* [1. Link do Repositório no GitHub & Matriz de Responsabilidades](#1-link-do-repositório-no-github--matriz-de-responsabilidades)
* [2. Palavras-Chave](#2-palavras-chave)
* [3. Proposta Inicial do Projeto](#3-proposta-inicial-do-projeto)
* [4. Sites Semelhantes no Mercado e Valor Acrescentado](#4-sites-semelhantes-no-mercado-e-valor-acrescentado)
* [5. Pesquisa de Utilizador, Personas e User Journey](#5-pesquisa-de-utilizador-personas-e-user-journey)
* [6. Requisitos do Sistema (Funcionais, Não Funcionais e Sistema)](#6-requisitos-do-sistema-funcionais-não-funcionais-e-sistema)
* [7. Modelação do Sistema: UML e Casos de Uso](#7-modelação-do-sistema-uml-e-casos-de-uso)
* [8. Plano de Trabalho, Project Charter e WBS](#8-plano-de-trabalho-project-charter-e-wbs)
* [9. Design System — Web Style Guide e Interfaces](#9-design-system--web-style-guide-e-interfaces)
* [10. Solução Técnica Detalhada (Arquitetura e Base de Dados)](#10-solução-técnica-detalhada)
* [11. Tecnologias Complementares e Integração SIG](#11-tecnologias-complementares-e-integração-sig)
* [12. Enquadramento das Unidades Curriculares (UC's)](#12-enquadramento-das-unidades-curriculares-ucs)
* [13. Validação e Guiões de Teste](#13-validação-e-guiões-de-teste)
* [14. Estado Final do Protótipo e Conclusão](#14-estado-final-do-protótipo-e-conclusão)
* [15. Referências Bibliográficas](#15-referências-bibliográficas)

---

## 1. Link do Repositório no GitHub & Matriz de Responsabilidades

### 1.1 Repositório Oficial
* **URL:** [https://github.com/rodrigocanto05/NextBid](https://github.com/rodrigocanto05/NextBid)
* **Conteúdo:** Código-fonte do frontend, scripts estruturados de backend em PHP, ficheiros de configuração da base de dados e documentação técnica complementar.

### 1.2 WBS 

| Tarefas Principais / Entregáveis | Rodrigo Canto | Rodrigo Daibert | Marco Fonseca | Daniel Paulo | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Fase I: Pesquisa, Requisitos e Arquitetura** | 25% | 25% | 25% | 25% | **100%** |
| **Fase II: Backend Core, Base de Dados e Prototipagem** | 30% | 30% | 20% | 20% | **100%** |
| **Fase III: Integração SIG, Testes Finais e Otimização** | 20% | 40% | 20% | 20% | **100%** |

---

## 2. Palavras-Chave
* Leilões Online; Gamificação; Georeferenciação; PHP; MySQL; Vanilla JavaScript; Desenvolvimento Web, Frontend e Backend; Linguagens de Programação; HTML; JavaScript; Base de Dados; Interfaces, Licitações; 

---

## 3. Proposta Inicial do Projeto

### 3.1 Explicação do Nome
* O nome **NextBid** resulta da junção dos termos anglo-saxónicos *Next* (Próximo) e *Bid* (Lance / Licitação).
* Esta designação reflete diretamente a ambição core da plataforma: representar o próximo passo evolutivo no comércio eletrónico de leilões, abandonando assim as interfaces estáticas e tradicionais em prol de um ecossistema dinâmico, interativo e altamente focado na retenção da atenção do utilizador.

### 3.2 Ideia Principal
* A NextBid é um Website concebido para modernizar a compra e venda de produtos através de leilões online baseados em tempo real.
* A plataforma funciona como um ambiente centralizado onde os utilizadores podem publicar artigos, submeter licitações validadas e interagir com um mapa georreferenciado interativo.
* O grande diferencial lúdico reside na introdução de mecânicas de gamificação baseadas em localização, similar a um minijogo que consiste no sistema de "Caça ao Tesouro", onde prémios reais e pontos de experiência (XP) são distribuídos dinamicamente no espaço geográfico urbano o qual é organizado pelos administradores.

### 3.3 Contexto de Inserção
* **Evolução do E-Commerce:** O mercado do comércio digital exige experiências cada vez mais imersivas e imediatas para evitar a quebra de retenção e o abandono de carrinhos.
* **Carga Cognitiva:** Os leilões eletrónicos convencionais são, na sua maioria, puramente transacionais e lineares, falhando no envolvimento psicológico do utilizador moderno.
* **A Resposta da NextBid:** O projeto insere-se na interseção entre os sistemas transacionais tradicionais e a gamificação geográfica, aproveitando a ubiquidade dos sensores de localização e a atração natural por mecânicas de progressão competitiva (níveis de utilizador e rankings).

### 3.4 Objetivos Gerais do Projeto
* **Desenvolver uma Plataforma Intuitiva:** Criar um ambiente web responsivo e limpo, capaz de mitigar barreiras técnicas para vendedores casuais e licitadores.
* **Garantir Concorrência Imparcial:** Implementar algoritmos assíncronos rigorosos para validação e atualização instantânea de lances superiores antes do término do tempo limite.
* **Integrar a Camada SIG:** Utilizar dados cartográficos georreferenciados para expandir o e-commerce para além do ecrã, incentivando a exploração urbana por proximidade espacial.
* **Assegurar Robustez Transacional:** Estruturar um backend sólido capaz de registar movimentações, logs de experiência e transações financeiras simuladas sem redundâncias ou falhas de concorrência.

---

## 4. Sites Semelhantes no Mercado e Valor Acrescentado

Para consolidar o posicionamento do NextBid, realizou-se um estudo comparativo focado nas soluções existentes na indústria digital:

### 4.1 Análise Comparativa de Concorrentes

| Plataforma | Vetores de Convergência (Semelhanças) | Vetores de Divergência (Diferenças do NextBid) |
| :--- | :--- | :--- |
| **eBay** | • Modelo global de licitações concorrentes.<br>• Suporte a catálogos massivos de produtos heterogéneos. | • Interface puramente transacional.<br>• Ausência absoluta de gamificação (XP, roletas ou níveis).<br>• Inexistência de dinâmicas baseadas em proximidade espacial via GPS. |
| **Mercado Livre** | • Permite a facilidade de interação.<br>• Contacto direto entre vendedores e compradores para entrega física de bens. | • Logística e distribuição estritamente tradicionais baseadas em transportadoras.<br>• Sem mecânicas de exploração territorial ou incentivos lúdicos. |
| **DealDash** | • Foco em leilões rápidos.<br>• Forte componente psicológica e competitiva de urgência baseada em cronómetros. | • Modelo comercial controverso baseado em lances pagos individualmente por clique.<br>• Falta de transparência.<br>• Ausência de componentes geográficas ou jogos interativos gratuitos. |

### 4.2 Valor Acrescentado do NextBid
A NextBid preenche o espaço deixado pelas soluções comerciais tradicionais através de quatro pilares estratégicos:
* **Fusão de E-Commerce com Gamificação Local:** Transforma a aquisição de bens num desafio ativo no mapa, promovendo a retenção diária através de mecânicas de recompensas por progressão.
* **Transparência Concorrente Assíncrona:** Validação em milissegundos no servidor que impede a sobreposição incorreta de licitações inválidas.
* **Logística por Proximidade Espacial:** Permite a visualização clara e imediata do posicionamento geográfico do artigo, otimizando as rotas de entrega direta e trocas locais em segurança.

---

## 5. Pesquisa de Utilizador, Personas e User Journey

O desenho de interfaces e a arquitetura de informação do **NextBid** fundamentaram-se numa pesquisa de utilizador detalhada, que permitiu mapear os perfis-alvo (Personas) e compreender as suas jornadas dentro da plataforma.

### 5.1 Caracterização das Personas
Com base em entrevistas estruturadas e análise de dados, definiram-se três perfis centrais:

* **João Silva (23 anos, Estudante Universitário — Comprador):**
    * *Objetivo:* Encontrar produtos tecnológicos ou colecionáveis a preços baixos.
    * *Comportamento:* Utilizador intensivo de dispositivos móveis; prefere interações rápidas e dinâmicas.
    * *Frustração:* Perder leilões no último segundo por falta de acompanhamento ou lentidão nas notificações.
* **Ana Martins (29 anos, Trabalhadora Independente — Vendedora Casual):**
    * *Objetivo:* Vender artigos usados de forma rápida para complementar o rendimento.
    * *Comportamento:* Utiliza redes sociais para negócios; procura interfaces simples e acessíveis.
    * *Frustração:* Baixa exposição e pouca visibilidade dos seus produtos em plataformas tradicionais.
* **Ricardo Fernandes (35 anos, Gestor de Produto — Stakeholder):**
    * *Objetivo:* Monitorizar métricas operacionais, aumentar a retenção e o engagement dos utilizadores.
    * *Comportamento:* Analisa dados analíticos e tendências de mercado para tomar decisões estratégicas.
    * *Frustração:* Desafios técnicos no sistema ou perda de interesse contínuo por parte dos utilizadores.

---

### 5.2 Mapeamento das Jornadas de Utilizador (User Journeys)

As jornadas sintetizam os passos críticos, pontos de contacto, estados emocionais e as oportunidades de design identificadas para os fluxos principais da plataforma.

#### Cenário A: Fluxo de Compra e Licitação (João Silva)
* **Objetivo:** Descobrir um artigo, licitar com sucesso em tempo real e acompanhar a entrega.

| Etapa | Ações do Utilizador| Pontos de Contacto | Emoção | Oportunidade de Design |
| :--- | :--- | :--- | :---: | :--- |
| **Atrair** | Procura alternativas online e visualiza anúncios do NextBid. | Motores de busca e redes sociais. | 😐 | Melhorar campanhas digitais direcionadas a jovens. |
| **Entrar** | Acede à plataforma e efetua o registo rápido via e-mail. | Ecrã de Registo / Login. | 🙂 | Simplificar o formulário e garantir autenticação segura. |
| **Envolver** | Explora o catálogo, seleciona um produto e faz lances concorrentes. | Página de Detalhe do Leilão e Painel de Lances. | 🔥 | Integrar elementos de gamificação (rankings e medalhas). |
| **Utilizar** | Monitoriza a contagem decrescente e recebe alertas de novos lances. | Central de Notificações em tempo real. | ⚡ | Aprimorar os alertas push para evitar a perda de lances. |
| **Sair / Ir** | Vence o leilão e consulta o mapa interativo para recolha do produto. | Interface de Mapa (SIG / Leaflet.js). | 🤩 | Otimizar os filtros de raio GPS e as opções de entrega. |
| **Feedback**| Atribui uma avaliação ao vendedor e partilha com amigos. | Sistema de Star Rating e comentários. | 🥰 | Incentivar partilhas para aumentar o engagement orgânico. |

#### Cenário B: Fluxo de Publicação e Venda (Ana Martins)
* **Objetivo:** Criar um leilão de forma simples, acompanhar a concorrência e liquidar o produto.

| Etapa | Ações do Utilizador  | Pontos de Contacto  | Emoção | Oportunidade de Design |
| :--- | :--- | :--- | :---: | :--- |
| **Atrair** | Procura canais com maior visibilidade para escoar um item parado. | Pesquisa de mercado e comparadores. | 😐 | Reforçar o SEO para captar vendedores independentes. |
| **Entrar** | Cria conta e explora intuitivamente o painel de utilizador. | Dashboard principal de perfil. | 🙂 | Desenvolver um onboarding interativo para novas contas. |
| **Publicar** | Preenche dados do item, faz upload de fotos e define a localização. | Formulário "Criar Leilão". | 🙂 | Oferecer dicas de preços base apelativos e templates rápidos. |
| **Envolver** | Acompanha a subida do valor do produto através da competição. | Painel de monitorização e histórico de bids. | 🤩 | Disponibilizar métricas de visualizações em tempo real. |
| **Sair** | O leilão encerra e o vencedor é determinado de forma automática. | Ecrã de fecho e resumo financeiro. | 🤩 | Facilitar a coordenação e a rota de entrega através do mapa. |
| **Feedback**| Conclui a transação com sucesso e avalia o comprador final. | Formulário de reputação pós-venda. | 🥰 | Implementar um sistema visível de medalhas de reputação. |

#### Cenário C: Fluxo de Gestão e Análise (Ricardo Fernandes — Stakeholder)
* **Objetivo:** Analisar métricas de engagement da plataforma para guiar decisões de negócio.

| Etapa | Ações do Utilizador  | Pontos de Contacto  | Emoção | Oportunidade de Design |
| :--- | :--- | :--- | :---: | :--- |
| **Pesquisar**| Analisa tendências de e-commerce e soluções inovadoras de gamificação. | Relatórios externos e benchmarks. | 😐 | Monitorizar a concorrência para antecipar funções core. |
| **Aceder** | Inicia sessão no painel administrativo e consulta os relatórios. | Login Admin e painéis principais. | 🙂 | Otimizar a visualização de dados para relatórios rápidos. |
| **Analisar** | Avalia utilizadores ativos, taxas de lances e engagement dos jogos. | Grafismo descritivo e XP logs agregados. | 🙂 | Desenvolver relatórios personalizados para métricas cruciais. |
| **Decidir** | Identifica falhas e prioriza investimentos em novas mecânicas lúdicas. | Painel de configuração administrativa. | 😐 | Incrementar o engagement através de novos módulos dinâmicos. |
| **Otimizar** | Implementa melhorias e monitoriza o impacto técnico na estabilidade. | Logs de sistema e infraestrutura Apache/MySQL | 🙂 | Reforçar a performance do servidor sob múltiplos acessos. |
| **Evoluir** | Recolhe feedback contínuo e ajusta a estratégia de crescimento. | Ciclos de feedback e reuniões de sprint. | 🤩 | Estruturar canais de comunicação com utilizadores ativos. |

---

## 6. Requisitos do Sistema 

### 6.1 Requisitos Funcionais (RF)
* **RF-01 (Autenticação e Gestão de Sessão):** O sistema deve fornecer mecanismos seguros de registo e login, gerando tokens unívocos armazenados na tabela `auth_tokens`.
* **RF-02 (CRUD de Leilões e Produtos):** Permitir a criação, listagem, edição e remoção lógica de produtos associados a categorias estruturadas, com upload obrigatório de imagens.
* **RF-03 (Validação Assíncrona de Lances):** O motor de backend deve rejeitar qualquer proposta cujo valor seja inferior ou igual ao lance atual somado ao incremento mínimo estipulado.
* **RF-04 (Fecho Automático por Cronómetro):** O sistema deve monitorizar o tempo restante de cada lote, encerrando-o autonomamente ao atingir o marco zero e elegendo o maior licitador registado.
* **RF-05 (Mecanismo Caça ao Tesouro):** Gerar coordenadas aleatórias georreferenciadas na tabela `gamification`, validando e registando os resgates validados na tabela `gamification_claim`.
* **RF-06 (Central de Notificações e Mensajaria):** Fornecer comunicação interna entre licitadores através de canais dedicados (`chat_message`) e disparar alertas sobre o estado dos leilões monitorizados.

### 6.2 Requisitos Não Funcionais (RNF)
* **RNF-01 (Criptografia e Segurança):** Proteção obrigatória de dados sensíveis e credenciais de acesso via algoritmo hash `BCRYPT`, e mitigação de vulnerabilidades SQLi recorrendo a *PDO Prepared Statements*.
* **RNF-02 (Fluidez e Reatividade da Interface):** Garantir que a submissão de propostas e a atualização de dados dinâmicos ocorrem em segundo plano via *Fetch API*, eliminando recarregamentos desnecessários da página de detalhe.
* **RNF-03 (Responsividade Adaptativa):** A interface desenvolvida com CSS3 e layouts flexíveis deve ser compatível e legível em dispositivos móveis, tablets e computadores de secretária.

### 6.3 Requisitos de Sistema (Ambiente Tecnológico)
* **Servidor Web e Interpretador:** Apache 2.4+ com suporte nativo à execução estável de scripts PHP 8.x.
* **Sistema de Gestão de Base de Dados:** Servidor relacional MySQL 8.0 operando em ambiente local integrado (XAMPP / MAMP).
* **Dependências de Cliente:** Navegador moderno compatível com a interpretação de ECMAScript 6 e integração nativa da biblioteca cartográfica *Leaflet.js*.

---

## 7. Modelação do Sistema: UML e Casos de Uso

A conceptualização das regras de negócio e limites operacionais da plataforma assentou no desenvolvimento prévio de diagramas de engenharia de software normalizados.

### 7.1 Diagrama de Casos de Uso
O mapeamento abaixo delimita com precisão o nível de acesso de cada utilizador (Utilizador Autenticado e Administrador do Sistema) e as respetivas relações de inclusão e extensão das funcionalidades principais:

<img width="388" height="1056" alt="casos_de_uso_nextbid" src="https://github.com/user-attachments/assets/f13b64b1-7769-402a-a523-a9c15d966428" />


### 7.2 Diagrama UML de Classes e Domínio
A modelação lógica orientada a objetos que serviu de fundação direta para a criação estrutural e física das tabelas relacionais do MySQL encontra-se representada na imagem abaixo:

<img width="2950" height="1498" alt="uml_nextbid" src="https://github.com/user-attachments/assets/9d49c02f-fa1d-457e-a3c3-e450d9bd2728" />


---

## 8. Plano de Trabalho, Project Charter e WBS

O desenvolvimento do NextBid foi gerido de forma estrita ao longo de um cronograma estruturado de 13 semanas, mitigando desvios de prazo e assegurando entregas funcionais incrementais:

### 8.1 Cronograma Detalhado de Desenvolvimento (Semana a Semana)

* **Semana 1: Definição do Âmbito Conceptual**
  * Especificação do conceito do NextBid e identificação dos módulos fundamentais (Leilão, Gamificação).
  * Distribuição inicial da matriz de responsabilidades gerais pelo grupo de trabalho.
* **Semana 2: Análise Técnica e Desenho da Arquitetura**
  * Escolha e validação do ecossistema tecnológico (PHP, Vanilla JS, MySQL).
  * Elaboração inicial do diagrama UML de casos de uso do sistema.
* **Semana 3: Modelação Relacional da Base de Dados**
  * Modelação lógica e física das tabelas estruturais core (utilizadores, produtos, lances).
  * Condução de testes preliminares de inserção e integridade referencial.
* **Semana 4: Sistema de Autenticação e Perfis**
  * Codificação das rotinas de registo, login e encriptação de palavras-passe com `BCRYPT`.
  * Criação do ecossistema de persistência de sessões por tokens de segurança.
* **Semana 5: CRUD e Gestão Inicial de Leilões**
  * Implementação de formulários para publicação de lotes e definição de preços base e tempos limites.
  * Desenvolvimento do upload inicial de ficheiros multimédia associados aos artigos.
* **Semana 6: Algoritmo de Licitação Assíncrona**
  * Programação do motor backend de validação estrita de valores concorrentes.
  * Integração de chamadas assíncronas assentes na Fetch API para evitar interrupções de navegação.
* **Semana 7: Temporizadores e Fecho Automatizado**
  * Implementação de rotinas de contagem decrescente client-side sincronizadas com o carimbo do servidor.
  * Programação das rotinas automáticas de encerramento de leilões e definição do respetivo vencedor.
* **Semana 8: Integração Cartográfica**
  * Renderização de marcadores espaciais com base nas coordenadas decimais de latitude e longitude dos produtos.
* **Semana 9: Motor da Caça ao Tesouro**
  * Programação do algoritmo de geração aleatória de prémios no espaço cartográfico.
  * Desenvolvimento da lógica de validação de proximidade linear entre utilizadores e tesouros.
* **Semana 10: Desenvolvimento do Módulo Lúdico de Retenção**
  * Implementação das tabelas de progressão de níveis, logs e acumulação de pontos de experiência (XP).
  * Integração do sistema básico de rankings (*leaderboards*) competitivos em tempo real.
* **Semana 11: Interface, Design System e Usabilidade**
  * Refinamento com estilo CSS3 aplicadas aos dashboards privados dos utilizadores.
  * Organização estrutural e hierárquica dos painéis informativos de lances e carteira digital.
* **Semana 12: Validação, Guiões de Teste e Otimização**
  * Condução de testes intensivos de concorrência com simulação de múltiplos lances em simultâneo.
  * Correção de anomalias no upload de imagens de grandes dimensões através de compressão client-side.
* **Semana 13: Documentação Técnica e Fecho do Projeto**
  * Consolidação do relatório técnico da 3ª entrega e preparação da demonstração prática final.
  * Revisão e fecho do repositório no GitHub.
 
---

## 9. Design System — Web Style Guide e Interfaces

O desenvolvimento da interface do **NextBid** foi estruturado com foco em elevados critérios de usabilidade, visando maximizar a experiência do utilizador e reduzir a carga cognitiva no momento de licitação. O estudo completo da interface e os fluxos detalhados encontram-se documentados no ficheiro `NextBid-Fase-III-IU.pdf`.

### 9.1 Diretrizes do Design System
Concebido e estruturado de forma colaborativa, o sistema visual estabelece um padrão unificado para toda a plataforma através de componentes atómicos reutilizáveis que podem ser explorados diretamente no link oficial do projeto: [Figma Design System - NextBid](https://www.figma.com/design/pgCvU0DvI50EcrGyFTnkmz/Design-System--Community-?node-id=4-6&p=f).

* **Paleta de Cores:** Utilização de uma base em tons escuros e neutros para o fundo, minimizando a fadiga visual e destacando os elementos de informação dinâmica. As cores vibrantes e de alto contraste foram aplicadas de forma exclusiva em botões de ações críticas (como o botão de submissão de lances).
* **Tipografia e Hierarquia:** Definição de escalas tipográficas rígidas para assegurar uma leitura confortável de valores numéricos, históricos de licitações e contagens decrescentes dos temporizadores.
* **Componentes Padronizados:** Estruturação unificada de cartões (*cards*) de listagem de produtos, campos de input para formulários com feedback visual e janelas modais para a central de notificações.

---

## 10. Solução Técnica Detalhada

A infraestrutura técnica do NextBid foi desenhada assente num modelo clássico Cliente-Servidor, robusto e escalável, dividindo de forma clara as responsabilidades de processamento.

---

### 10.1 Frontend — Interface do Utilizador
A camada de cliente foi desenvolvida recorrendo a tecnologias nativas da Web para garantir o controlo absoluto sobre a performance e o comportamento do DOM:
* **HTML5 e CSS3:** Utilização de semântica estrutural e folhas de estilo nativas com layouts flexíveis e responsivos, garantindo a adaptação fluida a qualquer tamanho de ecrã sem a dependência de frameworks pesados.
* **Vanilla JavaScript:** Codificação de toda a interatividade lógica client-side em JavaScript puro, incluindo a gestão de temporizadores cronometrados, manipulação dinâmica de conteúdos e o consumo de dados da API.

### 10.2 Backend — Servidor da Aplicação
O motor de negócio corre no servidor Apache através de um ecossistema em **PHP puramente estruturado**, privilegiando a legibilidade e a rapidez de processamento em ambiente académico:
* **Gestão de Estado e Segurança:** Implementação de controlo de acessos nativo via sessões e chaves seguras, além de sanitização rigorosa de inputs.
* **Comunicação de Dados:** Desenvolvimento de endpoints que funcionam como uma camada de serviços, processando pedidos HTTP e devolvendo respostas estruturadas em formato JSON para o cliente.

### 10.3 Base de Dados — MySQL (Estrutura Relacional)
A base de dados encontra-se normalizada na **3.ª Forma Normal (3FN)**, garantindo a integridade referencial estável e eliminando anomalias de inserção ou remoção. O esquema divide-se em 16 tabelas físicas interligadas:

1.  `userss`: Armazena os metadados dos utilizadores (ID, nome, e-mail, hash `BCRYPT`, saldo líquido e o perfil de privilégios `role`).
2.  `auth_tokens`: Registo de chaves unívocas de autenticação para controlo e validação de sessões seguras no backend.
3.  `category`: Tabela estática para organização hierárquica do catálogo de produtos disponíveis na plataforma.
4.  `product`: Entidade central que guarda a informação do lote (preço base, preço corrente atual, carimbo de data/hora de expiração e coordenadas decimais de georreferenciação).
5.  `product_attribute`: Arquitetura baseada no modelo *Key-Value*, permitindo adicionar propriedades customizadas a produtos heterogéneos sem alterar a estrutura física do SQL.
6.  `product_image`: Mapeamento dos caminhos e ficheiros multimédia associados a cada artigo publicado.
7.  `transactions`: Livro-razão imutável (*ledger*). Regista depósitos, levantamentos e retenções temporárias de saldo para licitações ativas. O saldo real é calculado por agregação (`SUM`), inviabilizando fraudes por manipulação direta de colunas.
8.  `bid`: Histórico completo de lances concorrentes, indexando o utilizador, o lote e o valor exato oferecido.
9.  `gamification`: Configuração dos eventos lúdicos e pontos de interesse mapeados (ex: coordenadas geográficas dos baús da Caça ao Tesouro).
10. `gamification_claim`: Registo e validação das recompensas e itens resgatados com sucesso pelos utilizadores.
11. `xp_logs`: Histórico analítico detalhado das ações do utilizador dentro do site que geraram pontos de experiência.
12. `xp_level`: Tabela de conversão matemática que define os patamares e limites de nível com base no XP acumulado.
13. `notifications`: Fila de mensagens dinâmicas geradas pelo backend para alertar o utilizador na interface.
14. `review`: Avaliações, comentários e reputação transacionada entre compradores e vendedores após o fecho de um leilão.
15. `chat_message`: Histórico de mensagens trocadas em tempo real na sala de conversação privada de cada lote ativo.
16. `product_favorite`: Mapeamento relacional dos produtos guardados na lista de desejos de cada utilizador.

---

## 11. Tecnologias Complementares

Para expandir as capacidades da plataforma, a NextBid incorpora componentes e bibliotecas especializadas que enriquecem a experiência transacional e geográfica:

* **Leaflet.js:** Biblioteca open-source em JavaScript utilizada para a renderização espacial de mapas interativos no cliente. Consome dados georreferenciados (latitude e longitude decimais) gerados pelo backend PHP para plotar marcadores dinâmicos representativos dos leilões locais e dos eventos de Caça ao Tesouro ativos.
* **Fetch API:** Utilizada para estabelecer a comunicação assíncrona entre o frontend e a API em PHP. Permite que as licitações sejam submetidas, validadas na base de dados e refletidas na interface em milissegundos, sem que o utilizador sofra interrupções ou recarregamentos forçados na página.
* **Sessões Nativas em PHP:** Mecanismo responsável pelo controlo estrito de acessos e persistência de utilizadores autenticados, validando a integridade dos cabeçalhos em cada operação crítica (como lances e movimentações na carteira).

---

## 12. Enquadramento das Unidades Curriculares (UC's)

O desenvolvimento da NextBid materializa e consolida as competências transversais adquiridas ao longo do percurso académico durante este semestre, ligando diretamente os conceitos teóricos à sua aplicação prática:

* **Projeto de Desenvolvimento Web:** Atua como o eixo central integrador do projeto, fornecendo as metodologias de gestão ágil, iterações de desenvolvimento e acompanhamento docente contínuo para transformar o conceito inicial num produto de software funcional e comercializável.
* **Programação Web:** Aplicação prática na estruturação e desenvolvimento da infraestrutura de backend (servidor local Apache e PHP), na caracterização de endpoints assíncronos que manipulam objetos estruturados em formato JSON e no consumo seguro de dados via Fetch API.
* **Sistemas de Informação Geográfica (SIG):** Integração de dados cartográficos georreferenciados na plataforma web. Permite a manipulação e conversão de coordenadas espaciais, a aplicação de marcadores vetoriais interativos na biblioteca cartográfica e o desenvolvimento da lógica de validação de proximidade linear na superfície terrestre (Fórmula de Haversine) realizada pelo servidor.
* **Interfaces e Usabilidade:** Orientação estrita de UI/UX para mitigar a carga cognitiva na interface. Inclui a validação prévia da taxonomia de menus através da técnica de *Tree Testing*, a criação de um *Design System* atómico coerente e a condução de testes práticos de usabilidade com utilizadores finais para identificar e corrigir pontos de fricção.
* **Estatística:** Fornecimento de rigor analítico e matemático para o tratamento de dados no sistema. Permite a modelação e compilação de métricas descritivas agregadas diretamente da base de dados relacional para alimentar o dashboard, calculando médias de licitações por categoria e identificando padrões de procura ou tendências transacionais fraudulentas com base em desvios no comportamento dos lances.
* **Algoritmos e Estruturas de Dados:** Estruturação lógica e otimizada da informação na memória do servidor, garantindo assim a eficiência computacional nos algoritmos de ordenação cronológica de históricos de lances e na árvore de validação concorrente de integridade de licitações.

---

## 13. Validação e Guiões de Teste

A estabilidade técnica do ecossistema do NextBid foi submetida a um plano rigoroso de validação funcional através de cenários de teste controlados.

### 13.1 Resultados dos Testes Funcionais Executados

| ID | Cenário de Teste | Procedimento de Execução | Resultado Esperado e Obtido | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **01** | Submissão de Leilão Válido | Envio do formulário preenchido com metadados do lote e upload de ficheiros de imagem associados. | Persistência bem-sucedida dos registos nas tabelas `product` e `product_image` e ficheiros guardados no diretório local. | **Aprovado** |
| **02** | Licitação Superior Ativa | Utilizador autenticado submete um lance assíncrono com valor superior à proposta corrente. | Transação validada e autorizada no backend; atualização instantânea do valor na tabela `bid` e interface do cliente notificada via JSON. | **Aprovado** |
| **03** | Licitação Inválida por Valor | Utilizador tenta submeter um lance com valor inferior ou matematicamente igual ao registado atualmente. | Rejeição imediata no servidor backend através de blocos lógicos condicionais, devolvendo um código de erro JSON descritivo. | **Aprovado** |
| **04** | Validação Espacial da Caça ao Tesouro | Submissão de coordenadas de GPS do cliente simuladas fora do raio métrico limite fixado para o prémio ativo. | Bloqueio imediato do pedido com base no cálculo linear de Haversine; a tabela `gamification_claim` não regista o resgate do prémio. | **Aprovado** |

---

## 14. Estado Final do Protótipo e Conclusão

O nosso projeto da **NextBid** cumpre com sucesso a sua fase conclusiva, atingindo a totalidade dos objetivos operacionais, técnicos e pedagógicos delineados no início do semestre letivo. A opção pelo desenvolvimento assente numa arquitetura limpa com separação entre a interface de cliente e os serviços de backend provou ser altamente eficaz, garantindo a velocidade de resposta necessária para um ambiente transacional assíncrono de leilões.

A integração bem-sucedida da camada geográfica através do *Leaflet.js* e o acoplamento do motor de gamificação por níveis de experiência elevam a plataforma além do e-commerce comum, oferecendo um protótipo perfeitamente estável, escalável e alinhado com o rigor exigido na Licenciatura em Engenharia Informática do IADE. Como desenvolvimentos futuros, o grupo perspetiva a transição do ambiente de desenvolvimento local para um servidor de produção em nuvem e a integração real de sensores e APIs nativas de geolocalização móvel.

---

## 15. Referências Bibliográficas

* DealDash. (2026). *The Online Auction Site with the Lowest Prices*. Obtido de https://www.dealdash.com
* eBay. (2026). *Buy & Sell Electronics, Cars, Fashion, Collectibles & More*. Obtido de https://www.ebay.com
* ESRI. (2026). *What is GIS? Geographic Information System Mapping Technology*. Obtido de https://www.esri.com
* JetBrains. (2026). *PhpStorm: The Lightning-Smart IDE for PHP Developers*. JetBrains s.r.o. Obtido de https://www.jetbrains.com/phpstorm/
* Leaflet. (2026). *Leaflet - An open-source JavaScript library for mobile-friendly interactive maps*. Obtido de https://leafletjs.com
* Mercado Livre. (2026). *Compra y Venta de Productos Online*. Obtido de https://www.mercadolibre.com
* Microsoft. (2026). *Visual Studio Code - Code Editing. Redefined*. Microsoft Corporation. Obtido de https://code.visualstudio.com
* MySQL. (2026). *MySQL 8.0 Reference Manual*. Oracle Corporation. Obtido de https://dev.mysql.com/doc/refman/8.0/en/
* Nielsen Norman Group. (2026). *Usability & UX Guidelines for Digital Interfaces*. Obtido de https://www.nngroup.com
* PHP Documentation. (2026). *PHP Hypertext Preprocessor Manual*. Obtido de https://www.php.net/manual/en/
