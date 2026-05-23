# Relatório Individual Semanal

## Descrição das Atividades

Durante esta semana, dediquei-me à implementação de novas funcionalidades centrais da aplicação, ao refinamento do sistema de chat ao vivo e à execução de testes funcionais a várias áreas do projeto, com o objetivo de garantir a estabilidade e a integração das funcionalidades já existentes.

## Trabalho Realizado

- Resolução de problemas no sistema de chat ao vivo dos leilões, com criação de scripts de debug e validação da ligação à base de dados

- Implementação do sistema de notificações, incluindo:
  - Componente de sino de notificações na navbar (NotificationBell)
  - Página dedicada de notificações (Notificacoes.html)
  - Backend de gestão de notificações (NotificationManager)
  - Correção da sincronização do ícone de notificações na navbar

- Desenvolvimento da funcionalidade de Guardados/Favoritos:
  - Componente FavoriteButton reutilizável nos cartões de leilão
  - APIs de backend para adicionar, remover e listar favoritos (toggle, list, ids)
  - Migração da base de dados para suportar a tabela de favoritos
  - Integração do botão de favoritos nas páginas de leilões e detalhes

- Resolução de problemas relacionados com o avatar do utilizador e padding em várias páginas

- Tornar o chat ao vivo totalmente operacional, com melhorias no ChatManager, AuctionManager e BidManager

- Atualizações ao carrossel da página inicial (HeroCarousel) e ao Ticker de leilões

- Melhorias na página de Perfil e na exibição de leilões do utilizador (MeusLeiloes)

- Ajustes no sistema de autenticação (Auth.js) e gestão da carteira (Wallet)

## Testes Realizados

- Testes funcionais à página Caça ao Tesouro, validando o fluxo de gamificação e a sua integração com o backend (gamification.php)

- Testes ao sistema de chat ao vivo, incluindo envio de mensagens, sincronização em tempo real e leitura correta de dados da base de dados

- Validação do sistema de notificações em diferentes cenários de utilização (criação, leitura e atualização do contador)

- Testes ao botão de favoritos em vários pontos da aplicação (página inicial, leilões ativos, meus leilões e detalhe de leilão)

- Verificação visual e funcional das correções de layout (avatar, padding, espaçamento) nas várias páginas afetadas

## Conclusão

O trabalho desenvolvido nesta semana permitiu consolidar funcionalidades essenciais para a experiência do utilizador, como o sistema de notificações e de favoritos, bem como resolver problemas pendentes no chat ao vivo. Os testes realizados às várias componentes do projeto contribuíram para garantir uma maior estabilidade e coerência geral da aplicação.
