# Contributing to CommerceCRM

Thank you for contributing to CommerceCRM! We follow a structured, phased development workflow adhering to enterprise standards.

---

## 🌿 Git Branching Strategy

- `main`: Stable, release-ready branch.
- `develop`: Integration branch for active phase development.
- `feature/<name>`: Feature branch (e.g., `feature/customer-360`).
- `fix/<name>`: Bug fix branch.
- `docs/<name>`: Documentation updates.
- `test/<name>`: Test suite enhancements.

---

## 💬 Commit Convention

We strictly follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Formatting, missing semi colons, etc.
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Maintenance tasks, dependency updates, tooling

---

## 🛠️ Development Rules

1. **No Duplicate Business Logic**: All core rules reside in domain/application services, never duplicated in frontend components or isolated API controllers.
2. **Tenant Isolation**: Every database interaction must respect tenant context.
3. **Safe Monetary Arithmetic**: Always use `Decimal` for financial values. Never use floats.
4. **Code Quality**:
   - Python: Run `ruff check`, `black --check`, `mypy`.
   - TypeScript: Run `npm run lint` and `npm run typecheck`.
5. **Testing**: Every PR must include unit and integration tests covering positive and negative paths.
