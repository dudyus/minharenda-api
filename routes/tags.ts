import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()

const router = Router()

const tagSchema = z.object({
    nome: z.string().min(2, { message: "Nome da tag deve possuir mín 2 caracteres."})
})

router.get("/", async (req, res) => {
  try {
    const tags = await prisma.tag.findMany()
    res.status(200).json(tags)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {

  const valida = tagSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome } = valida.data

  try {
    const tag = await prisma.tag.create({
      data: { nome }
    })
    res.status(201).json(tag)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params
    
    const valida = tagSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
    
    const { nome } = valida.data
    
    try {
        const tag = await prisma.tag.update({
            where: { id: Number(id) },
            data: { nome }
        })
    res.status(200).json(tag)
} catch (error) {
    res.status(400).json({ error })
}
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const tag = await prisma.tag.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(tag)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})
export default router
