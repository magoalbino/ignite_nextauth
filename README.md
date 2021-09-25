## Projeto

- Aplicação que aborda tópicos de autenticação e autorização dentro do next, utilizando next auth.

## Estudo

- A requisição de login ao backend deve retornar um token jwt e um refresh_token (que deve ser único)
- O site jwt.io pode validar a estrutura do token
- no backend dessa aplicação podemos alterar o tempo de expiração do token em src/auth.ts - expiresIn (linha 9) - em segundos
----
- as informações do usuário (email, permissões, perfis) não precisam ficar salvar nos cookies, e podem ser recuperadas do backend a cada página acessada
----
- Para uma aplicação que não utiliza next, quais bibliotecas de autenticação e para trabalhar com cookies são recomendadas?
