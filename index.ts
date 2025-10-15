import express from 'express'
import routesUsuarios from './routes/usuarios'
import routesEstoques from './routes/estoques'
import routesDespesas from './routes/despesas'
import routesFornecedores from './routes/fornecedores'
import routesTags from './routes/tags'
import routesReceitas from './routes/receitas'
import routesClientes from './routes/clientes'
import routesLogins from './routes/login'
import dotenv from 'dotenv';
dotenv.config();


const app = express()
const port = 3000

app.use(express.json())

app.use("/usuarios",      routesUsuarios)
app.use("/despesas",      routesDespesas)
app.use("/estoque",       routesEstoques)
app.use("/fornecedores",  routesFornecedores)
app.use("/tags",          routesTags)
app.use("/receitas",      routesReceitas)
app.use("/clientes",      routesClientes)
app.use("/login",         routesLogins)

app.get('/', (req, res) => {
  res.send('API: minharenda')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})