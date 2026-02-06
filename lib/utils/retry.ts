export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i))); // Exponential backoff
    }
  }
  throw new Error("Retry logic failed");
}