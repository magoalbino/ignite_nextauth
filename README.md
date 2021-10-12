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
----
- A validação das permissões do usuário para visualizar os elementos da tela não tem muita segurança (pq?), e por isso devem ser validadas também no backend
- Por exemplo: no front nós validamos se o usuário tem permissão para ver uma lista. no backend, na hora de trazer os dados da lista, essa permissão deve ser validada novamente.
----
- Para fazer as validações aqui com 'withSSRAuth' ou 'withSSRGuest' numa aplicação normal, colocaríamos elas dentro do useEffect no lugar do getServerSideProps
----
- No fim das contas o broadcast parece que não funcionou muito bem, mas provavelmente é por causa do next
- Acredito que numa aplicação de react pura deve funcionar