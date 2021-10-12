import axios, {AxiosError} from 'axios'
import {parseCookies, setCookie} from "nookies";
import {signOut} from "../contexts/AuthContext";
import {AuthTokenError} from "./errors/AuthTokenError";

let isRefreshing = false
let failedRequestsQueue = []

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx)

  const api = axios.create({
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
        cookies = parseCookies(ctx)
        const { 'nextauth.refreshToken': refreshToken } = cookies
        const originalConfig = error.config //aqui vai estar toda a configuração da requisição que foi feita

        if(!isRefreshing) {
          isRefreshing = true

          api.post('/refresh', {
            refreshToken
          }).then(response => {
            const { token } = response.data

            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            })

            setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`

            failedRequestsQueue.forEach(request => request.onSuccess(token))
            failedRequestsQueue = [];
          }).catch(err => {
            failedRequestsQueue.forEach(request => request.onFailure(err))
            failedRequestsQueue = [];

            if (process.browser) {
              signOut()
            }
          }).finally(() => {
            isRefreshing = false;
          });
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => { //(resolve) o que vai acontecer quando o refresh do token tiver finalizado
              originalConfig.headers['Authorization'] = `Bearer ${token}`
              resolve(api(originalConfig))
            },
            onFailure: (err: AxiosError) => { //(reject) caso o processo de refresh do token tenha dado errado
              reject(err)
            }
          })
        })

      } else {
        if (process.browser) {
          signOut()
        } else {
          return Promise.reject(new AuthTokenError())
        }
      }
    }

    return Promise.reject(error) //deixar que o axios propague o erro para que as chamadas as apis tratem o erro da melhor forma (por isso é importante que toda chamada api tenha uma tratativa de erro)
  })

  return api
}