import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()

const router = Router()

const fonecedorSchema = z.object({
    nome: z.string().min(3, { message: "Nome do fornecedor deve possuir mín 3 caracteres."})
})

router.get("/", async (req, res) => {
  try {
    const fornecedores = await prisma.fornecedor.findMany()
    res.status(200).json(fornecedores)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {

  const valida = fonecedorSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome } = valida.data

  try {
    const fornecedor = await prisma.fornecedor.create({
      data: { nome }
    })
    res.status(201).json(fornecedor)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params
    
    const valida = fonecedorSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
    
    const { nome } = valida.data
    
    try {
        const fornecedor = await prisma.fornecedor.update({
            where: { id: Number(id) },
            data: { nome }
        })
    res.status(200).json(fornecedor)
} catch (error) {
    res.status(400).json({ error })
}
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const fornecedor = await prisma.fornecedor.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(fornecedor)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})
export default router
