import { z } from 'zod'

export const SceneSchema = z.object({
  sequence_order: z.number(),
  audio_text: z.string(),
  visual_description: z.string()
})

export const ScenesSchema = z.array(SceneSchema)

export type ValidatedScene = z.infer<typeof SceneSchema>