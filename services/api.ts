import axios, {AxiosError} from 'axios'
import {parseCookies, setCookie} from "nookies";

let cookies = parseCookies()

export const api = axios.create({
  baseURL: 'http://localhost:3333/',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
})

//primeiro parâmetro do use é o que fazer quano a resposta der sucesso
//o segundo é o que fazer quando der erro
api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError) => {
  if(error.response.status == 401) {
    if(error.response.data?.code === 'token.expired') { //esse code é o que vem do backend
      cookies = parseCookies()
      const { 'nextauth.refreshToken': refreshToken } = cookies

      api.post('/refresh', {
        refreshToken
      }).then(response => {
        const { token } = response.data

        setCookie(undefined, 'nextauth.token', token, {
          maxAge: 60 * 60 * 24 * 30,
          path: '/'
        })

        setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
          maxAge: 60 * 60 * 24 * 30,
          path: '/'
        })

        api.defaults.headers['Authorization'] = `Bearer ${token}`

      });

    } else {
      //deslogar usuário
    }
  }
})