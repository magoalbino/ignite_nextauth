## Projeto

- Aplicação que aborda tópicos de autenticação e autorização dentro do next, utilizando next auth.

## Estudo

- A requisição de login ao backend deve retornar um token jwt e um refresh_token (que deve ser único)
- O site jwt.io pode validar a estrutura do token
- no backend dessa aplicação podemos alterar o tempo de expiração do token em src/auth.ts - expiresIn (linha 9) - em segundos
- 