import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()

const router = Router()

const despesaSchema = z.object({
  descricao: z.string(),
  valor: z.number().positive({ message: "Valor deve ser positivo"}),
  categoria: z.string().min(2,
    { message: "Nome da categoria deve possuir, no mínimo, 2 caracteres" }).optional(),
  anexo: z.string().url().optional(), // links, não especifica .png/jpg
  data: z.coerce.date(),
  usuarioId: z.string()
})

router.get("/", async (req, res) => {
  try {
    const despesas = await prisma.despesa.findMany()
    res.status(200).json(despesas)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get("/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params
  try {
    const despesas = await prisma.despesa.findMany({
      where: {usuarioId: usuarioId}
    })
    res.status(200).json(despesas)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {

  const valida = despesaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { descricao, valor, categoria, anexo, data, usuarioId} = valida.data

  try {
    const despesa = await prisma.despesa.create({
      data: { descricao, valor, categoria, anexo, data, usuarioId }
    })
    res.status(201).json(despesa)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params
    
    const valida = despesaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
    
    const { descricao, valor, categoria, anexo, data, usuarioId } = valida.data
    
    try {
        const despesa = await prisma.despesa.update({
            where: { id: Number(id) },
            data: { descricao, valor, categoria, anexo, data, usuarioId }
        })
    res.status(200).json(despesa)
} catch (error) {
    res.status(400).json({ error })
}
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const despesa = await prisma.despesa.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(despesa)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})
export default router
