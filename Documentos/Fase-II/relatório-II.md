## 1 - Identificação
- Universidade: Universidade Europeia  ;
- Faculdade: IADE ;
- Elementos do grupo: Rodrigo Canto, Rodrigo Daibert, Marco Fonseca e Daniel Paulo  ;
- Nome do projeto: NextBid  ;
- Repositório GitHub: https://github.com/rodrigocanto05/NextBid  ;
  
---

## 2 - Introdução
Após a fase de pesquisa e definição de requisitos (Fase I), o projeto **NextBid** avançou para a sua segunda etapa: Ideação e Prototipagem. Esta fase marca a transição da concetualização para a materialização técnica e visual da plataforma de leilões online.

O foco central desta etapa consistiu em desenhar a experiência do utilizador (UI/UX), estruturar a arquitetura de informação e iniciar a implementação da versão "Alfa" do projeto. O objetivo foi estabelecer uma infraestrutura de backend sólida, capaz de suportar as funcionalidades essenciais (core), e integrá-la com um frontend inicial, garantindo que o fluxo de dados entre o cliente e o servidor opera de forma eficiente.

A solução baseia-se numa separação clara entre frontend e backend, garantindo modularidade e escalabilidade. O sistema permite aos utilizadores interagir com dados dinâmicos, sendo estes processados no servidor e posteriormente apresentados na interface.

---
## 3 - Objetivos da Fase II
- Elaborar em UML os Casos de Uso e o Modelo de Domínio do sistema.
- Desenvolver os Mockups de alta fidelidade e interfaces na plataforma Figma.
- Criar e documentar os UI Assets e o Web Design System da plataforma.
- Implementar a infraestrutura de backend (PHP e Base de Dados) para as funcionalidades core.
- Desenvolver a versão Alfa/Protótipo do projeto, validando a integração Frontend ↔ Backend.
- Validar a Arquitetura de Informação através de testes com utilizadores.
  
---

## 4 - Descrição da Solução

O **NextBid** consiste numa aplicação web que permite a criação, gestão e participação em leilões online, integrando múltiplos componentes técnicos que trabalham de forma interligada.

A solução baseia-se numa separação clara entre frontend e backend, garantindo modularidade e escalabilidade. O sistema permite aos utilizadores interagir com dados em tempo real, sendo estes processados no servidor e posteriormente apresentados na interface.

O principal objetivo é garantir não só o funcionamento do sistema de leilões, mas também uma experiência interativa suportada por dados dinâmicos e integração com funcionalidades adicionais.

---

## 5- Funcionalidades Core

Foram definidas e parcialmente implementadas funcionalidades essenciais que garantem o funcionamento do sistema:

- **Sistema de autenticação de utilizadores**: Registo e login de utilizadores com encriptação de dados.
- **Caça ao tesouro**
- **Criação e gestão de leilões (CRUD)**: Capacidade de listar produtos e leilões armazenados na BD.
- **Sistema de licitação com validação de valores**: Comunicação assíncrona entre cliente e servidor para submissão de valores.
- **Comunicação entre frontend e backend através de HTTP requests**: Comunicação de forma dinâmica entre o frontend e o backend
- **Atualização dinâmica da interface com base nos dados recebidos**:Todos os dados adquiridos no frontend são prontamente guardados na base de dados

Estas funcionalidades asseguram que o utilizador consegue completar o fluxo principal da aplicação, desde a consulta até à interação com leilões.

---

## 5.1 - Funcionalidades Secundárias

Para complementar o sistema, foram também definidas funcionalidades adicionais:

- **Caça ao Tesouro & Integração de Mapas (SIG)**: Infraestrutura preparada para receber coordenadas geográficas (preparação para o Leaflet.js).
- **Dashboard com informação estatística**: Base de dados recolhe presentemente dados suficientes para análise estatística futura (ex: média de valores de lances).
- **Sistema de notificações**: Notificações em tempo real para atualização para a gamificação referente a caça ao tesouro.

Estas funcionalidades aumentam o valor da aplicação, mas não são críticas para o funcionamento base.

---

## 6 - Arquitetura de Informação

A arquitetura de informação foi estruturada com base na organização do conteúdo, nas necessidades do utilizador e no contexto de utilização.
A estrutura do sistema foi definida de forma hierárquica, incluindo:

- Página inicial com listagem de leilões
- Página de detalhe de leilão
- Área de autenticação
- Perfil de utilizador

Foi desenvolvido um mapa de navegação visual que permite validar a coerência das secções e identificar os caminhos possíveis (User Flows) dentro do sistema.

---

## 7 - Mapa de Navegação

Foi desenvolvido um mapa de navegação que representa a estrutura da aplicação e os caminhos possíveis do utilizador dentro do sistema.

Este mapa permite:
- Visualizar a hierarquia das páginas
- Identificar relações entre diferentes secções
- Validar a coerência da navegação

---

## 8 - Tree Testing

- A validação desta arquitetura foi realizada através da técnica de Tree Testing, permitindo testar a capacidade de os utilizadores encontrarem
- funcionalidades com base apenas na estrutura de navegação. Este processo permitiu:
- Identificar inconsistências na organização e nomenclatura dos menus.
- Ajustar a estrutura de navegação para reduzir o número de cliques até ações essenciais.
- Garantir uma usabilidade intuitiva para diferentes perfis de público-alvo.

Este processo permitiu:
- Identificar inconsistências na organização
- Ajustar a estrutura de navegação
- Garantir maior usabilidade do sistema

---

## 9 - Modelação do Sistema (UML)

De forma a garantir uma lógica de negócio robusta e bem documentada, procedeu-se à modelação do sistema recorrendo a diagramas UML, traduzindo as regras definidas na Fase I para esquemas técnicos:

- Casos de Uso: Mapeamento de todas as interações possíveis dos diferentes atores (Visitante, Utilizador Autenticado, Administrador) com a plataforma, tais como "Registar Conta", "Licitar em Leilão", "Consultar Mapa de Tesouros" e "Gerir Leilões".
  
- Modelo de Domínio: Estruturação das entidades do sistema (Utilizadores, Produtos, Leilões, Licitações, Recompensas) e das respetivas relações e multiplicidades, servindo de base direta para a implementação do esquema da base de dados relacional.
  
---

## 10 - UI/UX, Mockups e Design System

A vertente visual da aplicação foi desenvolvida com foco em elevados critérios de usabilidade, visando maximizar a experiência do utilizador.

Design System e UI Assets
Foi concebido um Design System coeso no Figma, que engloba:

- Tipografia e Paleta de Cores: Cores de destaque para ações críticas (ex: botão de licitação) e tons neutros para leitura confortável.

- Componentes Reutilizáveis: Criação de cards de produtos, inputs de formulários, modals de notificação e barras de navegação padronizadas.

  Mockups de Alta Fidelidade
Foram desenhados os ecrãs principais da plataforma, representando fielmente o produto final:

- Homepage com leilões em destaque e contadores decrescentes.

- Página detalhada do leilão (histórico de lances, informações do produto).

- Dashboard / Perfil do Utilizador.

- Interface do Mapa interativo para a Caça ao Tesouro.

---

## 11 - Integração Backend ↔ Frontend

Durante esta fase, foi implementada a base da comunicação entre frontend e backend, garantindo o fluxo de dados no sistema.

### 11.1 - Backend (Servidor e API)
- Tecnologia: Desenvolvido em PHP assente num servidor local (XAMPP/MAMP).

- Base de Dados: Implementação do esquema físico numa base de dados relacional (MySQL).

- Lógica e API REST: Criação de endpoints que processam requests HTTP (GET, POST), realizam a comunicação com a base de dados (PDO) e devolvem as respostas estruturadas em formato JSON

### 11.2 - Frontend
- Tecnologia: HTML5, CSS3 e Vanilla JavaScript.

- Consumo de Dados: Utilização da Fetch API (AJAX) para consumir os endpoints do backend de forma assíncrona, permitindo que a interface se atualize dinamicamente sem necessidade de recarregar a página (ex: atualização de lances em tempo real).

### 12 - Fluxo de Dados


Frontend → Request HTTP → Backend → Base de Dados → Backend → Resposta JSON → Frontend


Esta integração valida o funcionamento real do sistema, demonstrando que os dados são corretamente processados e apresentados.

---

## 13 - Ligação com Conceitos Teóricos

O desenvolvimento desta fase permitiu aplicar conceitos de várias áreas:

- Programação Web: Implementação da infraestrutura web (servidor PHP), caracterização da API REST e comunicação assíncrona (JSON/Fetch API).
- Interfaces e Usabilidade: Criação do Design System, Figma mockups, User Flows e aplicação do Tree Testing para validação de UI/UX.
- Arquitetura de Informação: definição e validação da estrutura do sistema
- Algoritmos e estrutura de Dados: Modelação do domínio do problema em UML e implementação da lógica de validação de licitações.
- Sistemas de Informação Geográfica: preparação para integração com mapas
- Estatística: base para futura análise de dados
- Projeto de Desenvolvimento Web: Gestão de projeto, iteração da metodologia PBL e desenvolvimento desta documentação técnica.

Esta abordagem demonstra a integração prática dos conceitos teóricos no desenvolvimento do sistema.

---

## 14 - Estado Atual do Projeto

Atualmente, o sistema encontra-se com:

- Frontend funcional com estrutura base implementada
- Backend com ligação à base de dados
- Comunicação estabelecida entre frontend e backend
- Funcionalidades core parcialmente operacionais

O sistema já permite validar o fluxo principal de dados, embora ainda existam componentes a evoluir.

### 14.1 - Próximos passos:

O foco transitará agora para a Implementação Final e Validação. Os objetivos seguintes incluem o refinamento dos algoritmos de licitação e timers cronometrados, a integração do módulo geográfico (Sistemas de Informação Geográfica com o Leaflet.js) para a Caça ao Tesouro, o fecho estatístico para o backoffice, e a realização rigorosa de Testes de Usabilidade com utilizadores finais.

---

## 15 - Conclusão

A Fase II cumpriu os seus objetivos centrais, permitindo consolidar a arquitetura visual e implementar a base funcional e de dados do sistema NextBid. Foi possível materializar as ideias da primeira fase em protótipos de alta fidelidade e estabelecer, com sucesso, a infraestrutura técnica que liga o frontend ao backend através de chamadas assíncronas.

Neste momento, a equipa dispõe de uma versão Alfa onde o fluxo principal de dados já pode ser validado. A base de dados encontra-se estruturada e a API inicial está operacional.

---

## 16 - Bibliografia e ferramentas

- Figma. (2024). Collaborative interface design tool. Disponível em: https://www.figma.com/

- PHP Documentation. (2024). PHP Manual. Disponível em: https://www.php.net/manual/en/

- Mozilla Developer Network (MDN). (2024). Using Fetch. Disponível em: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

- Nielsen Norman Group. (2024). Tree Testing: Fast, Iterative Evaluation of Menu Labels and Categories. Disponível em: https://www.nngroup.com/articles/tree-testing/




