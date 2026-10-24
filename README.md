# ⚡ Muhammad Taha — Portfolio & Interactive Lab

<p align="center">
  <b>Software Engineer & Full-Stack AI System Architect</b><br>
  Building high-performance web applications, multi-agent frameworks, and immersive UI experiences.
</p>

<p align="center">
  <a href="https://m-taha.netlify.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-m--taha.netlify.app-blue?style=for-the-badge" alt="Live Demo">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?style=flat-square" alt="CI/CD">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white" alt="GSAP">
</p>

---

## 🚀 Overview

Welcome to my official digital portfolio and interactive engineering laboratory. This repository houses my production-grade web applications, architectural showcases, AI system integrations, and high-performance UI components designed with clean editorial aesthetics and buttery-smooth animations.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** React, TypeScript, Vite, Tailwind CSS
- **Animations:** GSAP (GreenSock Animation Platform) Core & ScrollTrigger, Framer Motion
- **UI Engineering & Design Systems:** Custom Neo-Brutalist & Editorial themes, Radix UI primitives, Lucide icons
- **Quality Assurance & CI/CD:** GitHub Actions, Custom AST & HTML Meta Validation Scripts, pnpm

---

## 🛡️ Automated CI/CD Quality Gates

This repository enforces strict automated code health and asset integrity checks via **GitHub Actions** (`.github/workflows/ci-cd.yml`) on every push and pull request:
1. **Asset Integrity Validation:** Verifies all local images, brand variants, icons, and font assets resolve cleanly without 404s.
2. **Portfolio Test Suite:** Automated Node.js scripts validating HTML metadata, CSS custom properties, accessibility landmarks (`<main>`, skip links), and in-page anchor DOM targets.
3. **Syntax & Standards Parse:** Strict non-eval JavaScript compilation and HTML standards linting.

---

## 📦 Getting Started Locally

To run this portfolio locally on your machine:

```bash
# 1. Clone the repository
git clone [https://github.com/taha463/portfolio.git](https://github.com/taha463/portfolio.git)

# 2. Navigate into the directory
cd portfolio

# 3. Install dependencies using pnpm
pnpm install

# 4. Run quality validation tests
pnpm run test:portfolio
pnpm run test:assets

# 5. Start the development server
pnpm dev
