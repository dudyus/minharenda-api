import express from 'express'
import cors from 'cors'
import routesClientes from './routes/clientes'
import routesDespesas from './routes/despesas'
import routesLogins from './routes/login'
import routesProdutos from './routes/produtos'
import routesReceitas from './routes/receitas'
import routesUsuarios from './routes/usuarios'
import dotenv from 'dotenv';
dotenv.config();

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.use("/clientes",      routesClientes)
app.use("/despesas",      routesDespesas)
app.use("/login",         routesLogins)
app.use("/produtos",      routesProdutos)
app.use("/receitas",      routesReceitas)
app.use("/usuarios",      routesUsuarios)

app.get('/', (req, res) => {
  res.send('API: minharenda')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})