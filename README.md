# NextBid — Plataforma de Leilões

A **NextBid** é uma aplicação web inovadora dedicada à criação, gestão e participação em leilões online de forma dinâmica. Desenvolvida sob a metodologia *Project-Based Learning* no 4.º semestre da Licenciatura em Engenharia Informática no IADE - Universidade Europeia, a plataforma diferencia-se ao integrar mecânicas avançadas de gamificação e geolocalização em tempo real.

---

## Links Rápidos e Entregáveis

* **Última Release Oficial (Fase III):** https://github.com/rodrigocanto05/NextBid/blob/main/docs/Fase-III/relatório_III.md
* **UI/UX Assets & Design System (Figma):** https://www.figma.com/design/pgCvU0DvI50EcrGyFTnkmz/Design-System--Community-?node-id=4-6&t=SOEzBYig4gihzntO-1
* **Documentação Completa da API (Swagger):** https://github.com/rodrigocanto05/NextBid/blob/main/docs/Fase-II/openapi-NextBid.yaml
---

## Stack Tecnológico

 O nosso Website foi estruturada de forma modular, garantindo uma separação estrita de responsabilidades entre cliente e servidor:

| Camada | Tecnologia | Função no Sistema |
| :--- | :--- | :--- |
| **Frontend** | HTML5 / CSS / Vanilla JS (ES6+) | Interface responsiva e consumo assíncrono de dados. |
| **Mapas** | Leaflet.js | Renderização cartográfica vetorial do cliente. |
| **Backend** | PHP | Processamento lógico de negócio, tokens e segurança. |
| **Base de Dados** | MySQL | Persistência relacional normalizada em 3FN. |
| **Servidor Local** | XAMPP / MAMP | Ambiente unificado de desenvolvimento local. |

---

## Estrutura do Repositório

O repositório está organizado de forma rigorosa, nós isolamos os módulos do sistema e mapeamos também os artefactos visuais de planeamento:

```text
NextBid/
├── backend/
│   ├── api/             # Endpoints RESTful (.php) divididos por módulos
│   ├── config/          # Ficheiros de configuração e ligação PDO à BD
│   ├── includes/        # Managers de lógica core (Auth, Auction, Gamification)
│   ├── uploads/         # Diretoria física para armazenamento de imagens
│   └── openapi.yaml     # Especificação OpenAPI 3.0 para o Swagger
├── database/
│   ├── Tables.sql      # Tabelas necessárias para criar a base de dados
│   ├── queries.sql      # Scripts de teste e listagens estatísticas
│   └── inserts.sql      # Script oficial para a criação física das tabelas
├── docs/
│   ├── Fase-I/          # Levantamento de requisitos e diagramas iniciais
│   ├──  Fase-II/
│       ├── Mockupsnextbid/  # Protótipos de alta fidelidade das interfaces
│       └── wireframes/       # Esboços estruturais de baixa fidelidade (UX)
│   └── Fase-III/
├── frontend/
│   ├── css/           # Estilos estruturais e classes do design system em código
│   ├── html/          #documentos html para estrutura das páginas so site  
│   ├── js/            # Controladores e Fetch API para consumo assíncrono
│   └── img/           # Ecrãs e páginas do ecossistema do utilizador
└── README.md          # Links rápidos e Documentação técnica de acolhimento do repositório



