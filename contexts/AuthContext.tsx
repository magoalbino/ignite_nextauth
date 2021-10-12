import {createContext, ReactNode, useEffect, useState} from "react";
import {destroyCookie, parseCookies, setCookie} from 'nookies'
import Router from 'next/router'
import { api } from '../services/apiClient'

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

//foi colocado dessa forma pq esse contexto está sendo chamado pelo next tb, e o broadcast não funciona no lado do servidor
//por isso foi usado o let, e colocado dentro do useEffect (que só executa do lado do cliente)
let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')

  authChannel.postMessage('signOut')

  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user;

  useEffect(() => {
    return () => {
      authChannel = new BroadcastChannel('auth')

      authChannel.onmessage = (message) => {
        console.log(message.data);
        switch (message.data) {
          case 'signOut':
            signOut();
            // authChannel.close()
            break;
          case 'signIn':
            //logar todas as abas abertas
            // Router.reload()
            // window.location.replace("http://localhost:3000/dashboard");
            Router.push('/dashboard')
            break;
          default:
            break;
        }
      }
    };
  }, []);


  // A primeira vez que o usuário acessa a aplicação, iremos pegar as informações de permissão e roles
  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies()

    if (token) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data;
        setUser({email, permissions, roles})
      }).catch(() => {
        signOut()
      })
    }


  }, []);



  async function signIn({ email, password }: SignInCredentials) {
    try{
      const response = await api.post('sessions', {
        email,
        password
      })

      const { token, refreshToken, permissions, roles } = response.data

      // sessionStorage - se fechar e abrir o navegador, perde o sessionStorage
      // localStorage - não funciona direito com o next (por causa do server side rendering)
      // cookies - nesse caso é a melhor opção: pode ser usada a api própria do browser, porém usaremos a biblioteca nookies

      // o primeiro parâmetro é o contexto da requisição, como o login é uma ação do usuário e fica sempre do lado do broser,
      // esse parâmetro deve ficar undefined
      // o segundo é o nome do cookie, o terceiro é o valor, e o quarto...
      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, //30 dias - o backend é o responsável por verificar o token e fazer o refresh
        path: '/' //Quais caminhos da aplicação terão acesso a esse cookie, nesse caso é global
      })
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard')

      authChannel.postMessage('signIn')

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
