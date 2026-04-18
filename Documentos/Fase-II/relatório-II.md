## Identificação
- Universidade: Universidade Europeia  ;
- Faculdade: IADE ;
- Elementos do grupo: Rodrigo Canto, Rodrigo Daibert, Marco Fonseca e Daniel Paulo  ;
- Nome do projeto: NextBid  ;
- Repositório GitHub: https://github.com/rodrigocanto05/NextBid  ;
  
---

## Descrição da Solução

O **NextBid** consiste numa aplicação web que permite a criação, gestão e participação em leilões online, integrando múltiplos componentes técnicos que trabalham de forma interligada.

A solução baseia-se numa separação clara entre frontend e backend, garantindo modularidade e escalabilidade. O sistema permite aos utilizadores interagir com dados em tempo real, sendo estes processados no servidor e posteriormente apresentados na interface.

O principal objetivo é garantir não só o funcionamento do sistema de leilões, mas também uma experiência interativa suportada por dados dinâmicos e integração com funcionalidades adicionais.

---

## Funcionalidades Core

Foram definidas e parcialmente implementadas funcionalidades essenciais que garantem o funcionamento do sistema:

- Sistema de autenticação de utilizadores
- Caça ao tesouro
- Criação e gestão de leilões (CRUD)
- Sistema de licitação com validação de valores
- Comunicação entre frontend e backend através de HTTP requests
- Persistência de dados numa base de dados relacional
- Atualização dinâmica da interface com base nos dados recebidos

Estas funcionalidades asseguram que o utilizador consegue completar o fluxo principal da aplicação, desde a consulta até à interação com leilões.

---

## Funcionalidades Secundárias

Para complementar o sistema, foram também definidas funcionalidades adicionais:

- Integração com mapas para geolocalização de produtos
- Dashboard com informação estatística
- Sistema de notificações

Estas funcionalidades aumentam o valor da aplicação, mas não são críticas para o funcionamento base.

---

## Arquitetura de Informação

A arquitetura de informação foi estruturada com base na organização do conteúdo, necessidades do utilizador e contexto de utilização :contentReference[oaicite:1]{index=1}.

A estrutura do sistema foi definida de forma hierárquica, incluindo:

- Página inicial com listagem de leilões
- Página de detalhe de leilão
- Área de autenticação
- Perfil de utilizador

Esta organização permite uma navegação clara e lógica, facilitando o acesso às funcionalidades principais.

---

## Mapa de Navegação

Foi desenvolvido um mapa de navegação que representa a estrutura da aplicação e os caminhos possíveis do utilizador dentro do sistema.

Este mapa permite:
- Visualizar a hierarquia das páginas
- Identificar relações entre diferentes secções
- Validar a coerência da navegação

---

## Tree Testing

A validação da arquitetura de informação foi realizada através da técnica de **Tree Testing**, permitindo testar a capacidade dos utilizadores encontrarem funcionalidades com base apenas na estrutura de navegação :contentReference[oaicite:2]{index=2}.

Este processo permitiu:
- Identificar inconsistências na organização
- Ajustar a estrutura de navegação
- Garantir maior usabilidade do sistema

---

## Integração Backend ↔ Frontend

Durante esta fase, foi implementada a base da comunicação entre frontend e backend, garantindo o fluxo de dados no sistema.

### Backend
- Implementado em PHP
- Responsável por processar requests HTTP
- Realiza operações sobre a base de dados
- Retorna dados em formato JSON

### Frontend
- Desenvolvido em HTML, CSS e JavaScript
- Consome dados do backend através de Fetch API / AJAX
- Atualiza a interface dinamicamente

### Fluxo de Dados


Frontend → Request HTTP → Backend → Base de Dados → Backend → Resposta JSON → Frontend


Esta integração valida o funcionamento real do sistema, demonstrando que os dados são corretamente processados e apresentados.

---

## Ligação com Conceitos Teóricos

O desenvolvimento desta fase permitiu aplicar conceitos de várias áreas:

- Programação Web: comunicação cliente-servidor e implementação do backend
- Interfaces e Usabilidade: estruturação da navegação e organização visual
- Arquitetura de Informação: definição e validação da estrutura do sistema
- Algoritmos: lógica de validação de licitações
- Sistemas de Informação Geográfica: preparação para integração com mapas
- Estatística: base para futura análise de dados

Esta abordagem demonstra a integração prática dos conceitos teóricos no desenvolvimento do sistema.

---

## Estado Atual do Projeto

Atualmente, o sistema encontra-se com:

- Frontend funcional com estrutura base implementada
- Backend com ligação à base de dados
- Comunicação estabelecida entre frontend e backend
- Funcionalidades core parcialmente operacionais

O sistema já permite validar o fluxo principal de dados, embora ainda existam componentes a evoluir.

---

## Conclusão

A Fase II permitiu consolidar a arquitetura e implementar a base funcional do sistema **NextBid**, garantindo que a solução é tecnicamente viável.

Foi possível estabelecer a ligação entre frontend e backend, validar a arquitetura de informação e implementar as funcionalidades essenciais do sistema.

Esta base permite avançar para a fase seguinte com foco na expansão de funcionalidades, testes e otimização do sistema.


