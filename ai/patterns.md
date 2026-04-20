# Patterns

## Repository (Functional)

export function createXRepository(deps) {
return {
async getAll() {},
async getById() {},
async save() {},
}
}

## Use Case

export function createUseCase(repo) {
return async (input) => {
// logic
}
}

## Mapper

export function toEntity(dto) {}
export function toDTO(entity) {}