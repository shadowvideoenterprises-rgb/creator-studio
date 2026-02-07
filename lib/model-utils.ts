import { VALID_SCRIPT_MODELS, VALID_IMAGE_MODELS, VALID_AUDIO_MODELS, EXCLUDED_KEYWORDS, MODEL_LABELS } from './model-constants'

// Standardize Model IDs (removes "google:", "openai:", etc)
export const normalizeId = (id: string) => id.toLowerCase().replace('models/', '').trim()

// Shared Label Formatter
export const getModelLabel = (id: string, provider: string, name: string) => {
    // 1. Check if we have a pretty label in Constants
    if (MODEL_LABELS[id]) return MODEL_LABELS[id]
    
    // 2. Formatting Fallback
    const cleanProvider = provider.charAt(0).toUpperCase() + provider.slice(1)
    return `${cleanProvider}: ${name}`
}

// THE FILTER: Validates if a model belongs in a category
export const isModelValid = (id: string, category: 'text' | 'image' | 'audio') => {
    const lower = normalizeId(id)

    // 1. GLOBAL GARBAGE COLLECTOR
    if (EXCLUDED_KEYWORDS.some(bad => lower.includes(bad))) return false

    // 2. CATEGORY RULES
    if (category === 'text') {
        // BAN IMAGE TERMS from Text Dropdowns
        if (lower.includes('banana') || lower.includes('image') || lower.includes('flux') || lower.includes('dall-e') || lower.includes('tts') || lower.includes('audio')) {
            return false
        }
        // Must be in our valid list OR contain "gemini"/"gpt"/"claude"
        return VALID_SCRIPT_MODELS.some(v => lower.includes(v)) || lower.includes('gemini') || lower.includes('gpt')
    }

    if (category === 'image') {
        return VALID_IMAGE_MODELS.some(v => lower.includes(v)) || lower.includes('banana') || lower.includes('flux') || lower.includes('imagen')
    }

    if (category === 'audio') {
        return VALID_AUDIO_MODELS.some(v => lower.includes(v)) || lower.includes('tts') || lower.includes('voice')
    }

    return false
}

// THE SORTER: Puts the best models top
export const sortModelsSmart = (models: any[]) => {
    const PRIORITY = [
        'gemini-3-pro', 'gemini-3-flash', 
        'gemini-2.5-pro', 'gemini-2.5-flash',
        'gpt-4o', 'gemini-1.5-pro'
    ]
    
    return models.sort((a, b) => {
        const idA = normalizeId(a.value)
        const idB = normalizeId(b.value)

        const idxA = PRIORITY.findIndex(p => idA.includes(p))
        const idxB = PRIORITY.findIndex(p => idB.includes(p))

        // If both are priority, lower index wins
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        // If only A is priority, A wins
        if (idxA !== -1) return -1
        // If only B is priority, B wins
        if (idxB !== -1) return 1
        
        return a.label.localeCompare(b.label)
    })
}
