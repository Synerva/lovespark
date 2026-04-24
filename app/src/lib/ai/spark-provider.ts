import {
  AIProviderRequestError,
  formatMessagesAsPrompt,
  type AIProvider,
  type AIProviderMessage,
} from './ai-provider'

const DEFAULT_SPARK_MODEL = 'gpt-4o'

export class SparkProvider implements AIProvider {
  name = 'spark'

  async generateResponse(messages: AIProviderMessage[]): Promise<string> {
    if (!window.spark?.llm) {
      throw new AIProviderRequestError(this.name, 'GitHub Spark runtime is unavailable in this session.')
    }

    try {
      return await window.spark.llm(formatMessagesAsPrompt(messages), DEFAULT_SPARK_MODEL, false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Spark request failed.'
      throw new AIProviderRequestError(this.name, message)
    }
  }
}