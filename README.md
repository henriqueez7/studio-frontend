# Studio Henrique Cortes

Sistema fullstack para gestão e operação de uma barbearia premium, com foco em experiência do cliente, organização interna e agendamento inteligente por disponibilidade real.

Este repositório contém o **frontend** do projeto, desenvolvido em **React + Vite**, integrado a um backend em **Spring Boot** com autenticação JWT e regras por perfil.

## Visão geral

O Studio Henrique Cortes foi pensado para atender três necessidades principais do negócio:

- apresentar o estúdio de forma profissional para novos clientes
- organizar a operação interna da barbearia
- controlar agendamentos com base na disponibilidade real de cada barbeiro

O sistema possui autenticação por perfil e separa claramente a experiência de:

- `CLIENTE`
- `BARBEIRO`
- `ADMIN`

## Contexto do projeto

Mais do que uma interface administrativa, este projeto foi construído como um produto digital para um estúdio de barbearia real.

Isso significa que o frontend não foi tratado como um painel genérico. A experiência foi desenhada para refletir:

- identidade visual de barbearia premium
- fluxo de agendamento guiado
- disponibilidade configurável por barbeiro
- visão administrativa com indicadores e módulos operacionais

## Funcionalidades por perfil

### Área pública

- landing page institucional da barbearia
- apresentação do estúdio, serviços, ambiente e contato
- CTA para login e agendamento

### Cliente

- login e cadastro
- agendamento com múltiplos serviços no mesmo atendimento
- escolha de barbeiro
- seleção apenas de datas e horários realmente disponíveis
- visualização dos próprios agendamentos

### Barbeiro

- agenda individual
- leitura da própria disponibilidade
- visualização de horários ocupados e livres
- configuração da própria disponibilidade
- acompanhamento de comissões

### Admin

- dashboard operacional e financeiro
- gestão de serviços
- gestão de produtos
- estoque
- despesas
- investimentos
- comissões
- agenda administrativa
- configuração de disponibilidade por barbeiro

## Principais fluxos do sistema

### 1. Login com redirecionamento por perfil

Após autenticação:

- `CLIENTE` é redirecionado para `/agendar`
- `BARBEIRO` é redirecionado para `/barbeiro/agenda`
- `ADMIN` é redirecionado para `/dashboard`

### 2. Agendamento inteligente

O cliente:

1. escolhe o barbeiro
2. seleciona um ou mais serviços
3. vê apenas datas compatíveis com a disponibilidade configurada
4. vê apenas horários livres e válidos
5. confirma o atendimento

### 3. Configuração de disponibilidade

O barbeiro ou administrador configura:

- dia da semana
- horário inicial
- horário final
- intervalo entre atendimentos
- status ativo/inativo

Essa configuração influencia diretamente o fluxo de agendamento do cliente.

## Stack utilizada

### Frontend

- React
- Vite
- React Router DOM
- Axios
- React Hook Form
- Zod
- Framer Motion
- Recharts
- Tailwind CSS
- Lucide React

### Backend

- Java
- Spring Boot
- Spring Security
- JWT
- JPA / Hibernate

## Diferenciais do projeto

- autenticação com controle por perfil
- agendamento com múltiplos serviços
- disponibilidade real por barbeiro
- integração entre agenda, disponibilidade e operação financeira
- identidade visual alinhada com a proposta da barbearia
- estrutura preparada para evolução incremental sem reescrita do projeto

## Estrutura resumida do projeto

```bash
src/
  assets/          # imagens e arquivos visuais
  components/      # componentes reutilizáveis
  context/         # autenticação e estado global
  hooks/           # hooks de integração e lógica de páginas
  layouts/         # layout do painel autenticado
  pages/           # páginas públicas e privadas
  routes/          # definição das rotas
  services/        # camada de acesso à API
  utils/           # helpers e normalizações
```

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm
- backend do projeto rodando localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` com base no `.env.example`:

```bash
VITE_API_URL=http://localhost:8080
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

### 4. Gerar build de produção

```bash
npm run build
```

## Integração com o backend

O frontend usa `VITE_API_URL` para apontar para a API. Em desenvolvimento local, use `http://localhost:8080`. Em produção, defina a URL pública do backend no ambiente de deploy.

### Endpoints principais consumidos

#### Autenticação

- `POST /auth/login`
- `POST /auth/register`

#### Dashboard e gestão

- `GET /dashboard`
- `GET /services`
- `GET /products`
- `GET /stock-movements`
- `GET /expenses`
- `GET /commissions`
- `GET /investments`

#### Agendamentos

- `GET /appointments`
- `POST /appointments`

Payload de criação de agendamento:

```json
{
  "clientId": 5,
  "barberId": 2,
  "serviceIds": [1, 3, 7],
  "appointmentDate": "2026-04-10",
  "startTime": "10:30:00",
  "notes": "Preferência por acabamento mais curto."
}
```

#### Disponibilidade

- `GET /barbers/available`
- `GET /appointments/availability/{barberId}/dates`
- `GET /appointments/availability/{barberId}/times`
- `GET /barber-availability/{barberId}`
- `POST /barber-availability`
- `PUT /barber-availability/{id}`
- `DELETE /barber-availability/{id}`

## Telas principais

### Landing page

Página pública da barbearia com:

- hero institucional
- apresentação do studio
- seção de serviços
- ambiente
- CTA para login e agendamento
- footer com contato e localização

### Login e cadastro

Telas alinhadas visualmente à identidade do studio, com acesso por perfil e persistência de sessão.

### Painel administrativo

Ambiente claro, organizado e modular para gestão de:

- indicadores
- serviços
- produtos
- estoque
- despesas
- comissões
- investimentos
- agenda

### Área do cliente

Fluxo guiado de agendamento com feedback visual, resumo do atendimento e histórico de horários.

### Área do barbeiro

Leitura da própria agenda, visão de disponibilidade configurada e gestão operacional do dia a dia.

## Possíveis evoluções futuras

- CRUD completo de serviços e produtos direto pelo frontend
- calendário com visual semanal/mensal mais avançado
- notificações por WhatsApp ou e-mail
- filtros analíticos mais profundos no dashboard
- upload otimizado de imagens e assets
- melhoria de performance com code splitting adicional

## Qualidade e proposta de portfólio

Este projeto foi estruturado para demonstrar:

- integração real entre frontend e backend
- modelagem de fluxo por perfil
- preocupação com regras de negócio
- consistência visual entre área pública e autenticada
- evolução incremental de produto, sem reescrever a aplicação a cada etapa

## Status atual

Projeto funcional, integrado ao backend e em fase final de polimento para apresentação em portfólio profissional.
