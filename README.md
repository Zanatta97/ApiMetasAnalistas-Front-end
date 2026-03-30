# ApiMetasAnalistas — Front-end

[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/status-prova%20de%20conceito-yellow.svg)]()
[![IA Assistida](https://img.shields.io/badge/criado%20com-aux%C3%ADlio%20de%20IA-blueviolet.svg)]()

*Choose your language / Escolha o seu idioma:*
- 🇧🇷 [Português](#-versão-em-português)
- 🇺🇸 [English](#-english-version)

---

## 🇧🇷 Versão em Português

### 🎯 Sobre o Projeto

Este repositório contém o front-end desenvolvido como **prova de conceito** para validar o funcionamento da [ApiMetasAnalistas](https://github.com/Zanatta97/ApiMetasAnalistas).

O objetivo foi simples: criar uma interface visual que consumisse todos os endpoints da API e demonstrasse que ela responde corretamente — cadastros, consultas, edições, exclusões e o cálculo de resultados por período.

> 🤖 **Este front-end foi desenvolvido com auxílio de Inteligência Artificial.** O foco do aprendizado está na API back-end. O front-end existe para tornar tangível o que foi construído no servidor, não para ser um estudo de desenvolvimento front-end em si.

---

### 📄 Páginas e Funcionalidades

O app é uma SPA (Single Page Application) com navegação por sidebar, cobrindo todos os recursos da API:

| Página | Recurso da API | O que faz |
|---|---|---|
| 🏆 **Resultados** | `/Analysts/target` | Consulta o desempenho de todos os analistas em um período, com cards de progresso, ordenação e resumo estatístico |
| 🗺️ **Regiões** | `/Regions` | CRUD completo de regiões |
| 👤 **Analistas** | `/Analysts` | CRUD completo de analistas com vínculo a regiões |
| 📅 **Feriados** | `/Holidays` | CRUD de feriados por região, com filtro por período |
| 📋 **Ocorrências** | `/Occurrences` | CRUD de ocorrências dos analistas (afastamentos, etc.) |
| 🎫 **Tickets** | `/Tickets` | CRUD de tickets fechados por analista |

---

### 🛠️ Tecnologias

| Tecnologia | Versão | Papel no projeto |
|---|---|---|
| React | 19 | Framework de UI |
| TypeScript | 5 | Tipagem estática |
| Vite | 6 | Build tool e dev server |
| Fetch API | Nativa | Comunicação HTTP com a API |
| CSS puro | — | Estilização (sem biblioteca de componentes) |

---

---

## 🇺🇸 English Version

### 🎯 About the Project

This repository contains the front-end developed as a **proof of concept** to validate the functionality of [ApiMetasAnalistas](https://github.com/Zanatta97/ApiMetasAnalistas).

The goal was straightforward: build a visual interface that consumes all API endpoints and demonstrates they respond correctly — creates, reads, updates, deletes, and the period-based results calculation.

> 🤖 **This front-end was built with the assistance of Artificial Intelligence.** The learning focus is on the back-end API. The front-end exists to make the server-side work tangible, not as a front-end development study in itself.

---

### 📄 Pages and Features

The app is a SPA (Single Page Application) with sidebar navigation, covering all API resources:

| Page | API Resource | What it does |
|---|---|---|
| 🏆 **Results** | `/Analysts/target` | Queries analyst performance over a period, with progress cards, sorting, and summary stats |
| 🗺️ **Regions** | `/Regions` | Full CRUD for regions |
| 👤 **Analysts** | `/Analysts` | Full CRUD for analysts linked to regions |
| 📅 **Holidays** | `/Holidays` | CRUD for holidays per region, with period filtering |
| 📋 **Occurrences** | `/Occurrences` | CRUD for analyst occurrences (absences, etc.) |
| 🎫 **Tickets** | `/Tickets` | CRUD for closed tickets per analyst |

---

### 🛠️ Technologies

| Technology | Version | Role in the project |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5 | Static typing |
| Vite | 6 | Build tool and dev server |
| Fetch API | Native | HTTP communication with the API |
| Pure CSS | — | Styling (no component library) |
